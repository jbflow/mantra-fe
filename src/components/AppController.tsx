"use client";

import { useEffect, useRef, useState } from "react";
import { MantraEngine } from "mantra-engine";
import type { Intent } from "musical-intent-protocol";
import { MidiRouter } from "@/domains/midi/MidiRouter";
import { RecognitionService } from "@/domains/speech/RecognitionService";
import { WhisperRecognitionService } from "@/domains/speech/WhisperRecognitionService";
import {
  WHISPER_MODELS,
  type RecognitionEngineId,
  type RecognitionState,
  type SpeechRecognitionEngine,
  type WhisperModelId
} from "@/domains/speech/SpeechRecognitionEngine";
import { WakeWordDetector } from "@/domains/speech/WakeWordDetector";
import {
  createWorkflow,
  createWorkflowAction,
  moveWorkflowAction,
  normalizeTrigger,
  parseWorkflows,
  WORKFLOWS_STORAGE_KEY,
  type Workflow,
  type WorkflowAction
} from "@/domains/workflows";
import WorkflowBuilder from "@/components/WorkflowBuilder";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type VoiceStatus = "idle" | "wake" | "recording" | "processing" | "error";
type WakePhrase = "bumblebee" | "computer" | "jarvis";
type ActivityItem = { id: string; label: string; time: string; kind: "sent" | "received" | "error" | "midi" };

const WAKE_PHRASES: WakePhrase[] = ["bumblebee", "computer", "jarvis"];
const PREFERENCES_STORAGE_KEY = "mantra-fe-preferences";

const getStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }
  return window.localStorage;
};

const makeActivity = (label: string, kind: ActivityItem["kind"]): ActivityItem => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  label,
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  kind
});

export default function AppController() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [wakePhrase, setWakePhrase] = useState<WakePhrase>("bumblebee");
  const [language, setLanguage] = useState("en-US");
  const [recognitionEngine, setRecognitionEngine] = useState<RecognitionEngineId>("web-speech");
  const [whisperModel, setWhisperModel] = useState<WhisperModelId>(WHISPER_MODELS[0].id);
  const [recognitionStatus, setRecognitionStatus] = useState<RecognitionState>("ready");
  const [modelProgress, setModelProgress] = useState(0);
  const [recognitionDevice, setRecognitionDevice] = useState("");
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [typedCommand, setTypedCommand] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [engineUrl, setEngineUrl] = useState("ws://localhost:1979");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [midiInputs, setMidiInputs] = useState<string[]>([]);
  const [midiOutputs, setMidiOutputs] = useState<string[]>([]);
  const [selectedMidiInput, setSelectedMidiInput] = useState("");
  const [midiReady, setMidiReady] = useState(false);
  const [midiNote, setMidiNote] = useState(60);
  const [learningMidi, setLearningMidi] = useState(false);
  const webSpeechLanguage = recognitionEngine === "web-speech" ? language : undefined;

  const engineRef = useRef<MantraEngine | null>(null);
  const lastIntentRef = useRef<Intent | undefined>(undefined);
  const connectPromiseRef = useRef<Promise<MantraEngine | null> | null>(null);
  const wakeRef = useRef<WakeWordDetector | null>(null);
  const wakeEnabledRef = useRef(wakeEnabled);
  const recognitionRef = useRef<SpeechRecognitionEngine | null>(null);
  const midiRouterRef = useRef<MidiRouter | null>(null);
  const learningMidiRef = useRef(false);
  const midiNoteRef = useRef(60);
  const startSpeakingRef = useRef<() => void>(() => undefined);
  const processTranscriptRef = useRef<(text: string) => Promise<void>>(async () => undefined);
  wakeEnabledRef.current = wakeEnabled;

  const addActivity = (label: string, kind: ActivityItem["kind"]) => {
    setActivity((items) => [makeActivity(label, kind), ...items].slice(0, 8));
  };

  useEffect(() => {
    const storage = getStorage();
    const storedWorkflows = parseWorkflows(storage.getItem(WORKFLOWS_STORAGE_KEY));
    setWorkflows(storedWorkflows);
    setSelectedWorkflowId(storedWorkflows[0]?.id ?? null);

    try {
      const preferences = JSON.parse(storage.getItem(PREFERENCES_STORAGE_KEY) ?? "null") as {
        wakePhrase?: WakePhrase;
        language?: string;
        recognitionEngine?: string;
        whisperModel?: string;
        engineUrl?: string;
        midiNote?: number;
      } | null;
      if (preferences?.wakePhrase && WAKE_PHRASES.includes(preferences.wakePhrase)) {
        setWakePhrase(preferences.wakePhrase);
      }
      if (preferences?.language) setLanguage(preferences.language);
      if (preferences?.recognitionEngine === "web-speech" || preferences?.recognitionEngine === "whisper") {
        setRecognitionEngine(preferences.recognitionEngine);
        setRecognitionStatus(preferences.recognitionEngine === "whisper" ? "loading" : "ready");
      }
      const savedWhisperModel = WHISPER_MODELS.find((model) => model.id === preferences?.whisperModel);
      if (savedWhisperModel) setWhisperModel(savedWhisperModel.id);
      if (preferences?.engineUrl) setEngineUrl(preferences.engineUrl);
      if (typeof preferences?.midiNote === "number") setMidiNote(preferences.midiNote);
    } catch {
      storage.removeItem(PREFERENCES_STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const storage = getStorage();
    storage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
    storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({
      wakePhrase,
      language,
      recognitionEngine,
      whisperModel,
      engineUrl,
      midiNote
    }));
  }, [engineUrl, hydrated, language, midiNote, recognitionEngine, wakePhrase, whisperModel, workflows]);

  useEffect(() => {
    lastIntentRef.current = undefined;
    const engine = new MantraEngine({
      url: engineUrl,
      source: "ui",
      handlers: {
        onOpen: () => {
          setConnectionStatus("connected");
          setError(null);
          addActivity("Engine connection opened", "received");
        },
        onClose: () => {
          setConnectionStatus("disconnected");
          addActivity("Engine connection closed", "received");
        },
        onAck: (message) => addActivity(`Accepted ${message.ids.length} action${message.ids.length === 1 ? "" : "s"}`, "received"),
        onResult: (message) => addActivity(`Interpreter ${message.status}: ${message.id}`, message.status === "ok" ? "received" : "error"),
        onError: (message) => {
          setError(message.message);
          addActivity(message.message, "error");
        }
      }
    });
    engineRef.current = engine;
    setConnectionStatus("disconnected");
    return () => {
      engine.disconnect();
      if (engineRef.current === engine) engineRef.current = null;
      connectPromiseRef.current = null;
    };
  }, [engineUrl]);

  const ensureEngineConnected = async (): Promise<MantraEngine | null> => {
    const engine = engineRef.current;
    if (!engine) return null;
    if (connectionStatus === "connected") return engine;
    if (connectPromiseRef.current) return connectPromiseRef.current;

    setConnectionStatus("connecting");
    setError(null);
    const pending = engine.connect()
      .then(() => engine)
      .catch((cause: unknown) => {
        const message = cause instanceof Error ? cause.message : "Unable to connect to the engine";
        setConnectionStatus("error");
        setError(message);
        addActivity(message, "error");
        return null;
      })
      .finally(() => {
        connectPromiseRef.current = null;
      });
    connectPromiseRef.current = pending;
    return pending;
  };

  const runTextAction = (engine: MantraEngine, text: string) => {
    if (!text.trim()) return false;
    const result = engine.sendText(text);
    if (result.errors?.length) {
      const message = result.errors.join("; ");
      setError(message);
      addActivity(message, "error");
      return false;
    }
    if (result.intents.length === 0) return false;
    lastIntentRef.current = result.intents[result.intents.length - 1];
    addActivity(`Sent ${result.intents.length} MIP intent${result.intents.length === 1 ? "" : "s"}`, "sent");
    return true;
  };

  const runWorkflow = async (engine: MantraEngine, workflow: Workflow) => {
    addActivity(`Workflow fired: ${workflow.trigger}`, "sent");
    for (const action of workflow.actions) {
      if (action.type === "text") {
        runTextAction(engine, action.text);
        continue;
      }
      if (!action.port.trim()) {
        setError("Choose an output port for each MIDI action.");
        addActivity("MIDI action has no output port", "error");
        continue;
      }
      try {
        const midiEngine = engine as unknown as {
          sendMidiAction?: (payload: {
            port: string;
            message: "note_on" | "note_off" | "control_change" | "program_change";
            channel: number;
            data: number;
            value: number;
          }) => void;
        };
        if (!midiEngine.sendMidiAction) {
          throw new Error("This Mantra Engine version does not support MIDI actions");
        }
        midiEngine.sendMidiAction({
          port: action.port,
          message: action.message,
          channel: action.channel,
          data: action.data,
          value: action.value
        });
        addActivity(`${action.message.replaceAll("_", " ")} → ${action.port}`, "midi");
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unable to send MIDI action";
        setError(message);
        addActivity(message, "error");
      }
    }
  };

  const handleTranscript = async (text: string) => {
    const transcript = text.trim();
    if (!transcript) return;
    setFinalTranscript(transcript);
    setPartialTranscript("");
    setVoiceStatus("processing");
    const engine = await ensureEngineConnected();
    if (!engine) {
      setVoiceStatus("error");
      return;
    }

    const normalized = normalizeTrigger(transcript);
    const workflow = workflows.find((item) => item.enabled && normalizeTrigger(item.trigger) === normalized);
    if (workflow) {
      await runWorkflow(engine, workflow);
    } else {
      runTextAction(engine, transcript);
    }
    setVoiceStatus(wakeEnabled ? "wake" : "idle");
  };
  processTranscriptRef.current = handleTranscript;

  const startSpeaking = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Speech recognition is not available in this browser.");
      setVoiceStatus("error");
      return;
    }
    if (recognitionEngine === "whisper" && recognitionStatus !== "ready") return;
    wakeRef.current?.stop();
    setError(null);
    setVoiceStatus("recording");
    setIsRecording(true);
    void recognition.start().catch((cause: unknown) => {
      const message = cause instanceof Error ? cause.message : "Could not start speech recognition";
      setError(message);
      setVoiceStatus("error");
      setIsRecording(false);
    });
  };
  startSpeakingRef.current = startSpeaking;

  const stopSpeaking = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    if (wakeEnabled) {
      wakeRef.current?.start();
      setVoiceStatus("wake");
    } else {
      setVoiceStatus("idle");
    }
  };

  useEffect(() => {
    if (!hydrated) return;
    let recognition: SpeechRecognitionEngine;
    try {
      recognition = recognitionEngine === "whisper"
        ? new WhisperRecognitionService({ model: whisperModel, getLastIntent: () => lastIntentRef.current })
        : new RecognitionService({ lang: webSpeechLanguage ?? "en-US", continuous: false });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Web Speech API is not available";
      setError(message);
      setRecognitionStatus("error");
      setVoiceStatus("error");
      return;
    }

    const onPartial = (text: string) => setPartialTranscript(text);
    const onFinal = (text: string) => {
      recognition.stop();
      setIsRecording(false);
      void processTranscriptRef.current(text).finally(() => {
        if (wakeEnabledRef.current) {
          wakeRef.current?.start();
          setVoiceStatus("wake");
        } else {
          setVoiceStatus("idle");
        }
      });
    };
    const onSpeechError = (cause: Error) => {
      setError(cause.message);
      setVoiceStatus("error");
      setIsRecording(false);
    };
    const onRecognitionStatus = (status: { state: RecognitionState; progress?: number; device?: string }) => {
      setRecognitionStatus(status.state);
      if (status.progress !== undefined) setModelProgress(status.progress);
      if (status.device !== undefined) setRecognitionDevice(status.device);
    };

    recognition.on("partial", onPartial);
    recognition.on("final", onFinal);
    recognition.on("error", onSpeechError);
    recognition.on("status", onRecognitionStatus);
    recognitionRef.current = recognition;
    let cancelled = false;
    void recognition.initialize().catch((cause: unknown) => {
      if (cancelled) return;
      const message = cause instanceof Error ? cause.message : "Could not initialize speech recognition";
      setError(message);
      setRecognitionStatus("error");
      setVoiceStatus("error");
    });

    return () => {
      recognition.off("partial", onPartial);
      recognition.off("final", onFinal);
      recognition.off("error", onSpeechError);
      recognition.off("status", onRecognitionStatus);
      cancelled = true;
      recognition.dispose();
      if (recognitionRef.current === recognition) recognitionRef.current = null;
    };
  }, [hydrated, recognitionEngine, webSpeechLanguage, whisperModel]);

  useEffect(() => {
    if (!wakeEnabled) {
      wakeRef.current?.stop();
      wakeRef.current = null;
      return;
    }

    const wake = new WakeWordDetector({ hotword: wakePhrase });
    const onWake = () => startSpeakingRef.current();
    const onWakeError = (cause: Error) => setError(cause.message);
    wake.on("wake", onWake);
    wake.on("error", onWakeError);
    wakeRef.current = wake;
    wake.start();
    setVoiceStatus("wake");

    return () => {
      wake.off("wake", onWake);
      wake.off("error", onWakeError);
      wake.stop();
      if (wakeRef.current === wake) wakeRef.current = null;
    };
  }, [wakeEnabled, wakePhrase]);

  useEffect(() => () => {
    midiRouterRef.current?.detachInput();
  }, []);

  const enableMidi = async () => {
    setError(null);
    try {
      const router = new MidiRouter();
      router.on("message", ({ data, port }) => {
        const status = (data[0] ?? 0) & 0xf0;
        const note = data[1] ?? -1;
        const velocity = data[2] ?? 0;
        if (learningMidiRef.current && status === 0x90 && velocity > 0) {
          learningMidiRef.current = false;
          midiNoteRef.current = note;
          setMidiNote(note);
          setLearningMidi(false);
          addActivity(`Press-to-speak mapped to MIDI note ${note} from ${port}`, "midi");
          return;
        }
        if (status === 0x90 && velocity > 0 && note === midiNoteRef.current) {
          startSpeakingRef.current();
        }
      });
      await router.init({ sysex: false });
      const ports = router.listPorts();
      midiRouterRef.current = router;
      setMidiInputs(ports.inputs);
      setMidiOutputs(ports.outputs);
      setMidiReady(true);
      if (!selectedMidiInput && ports.inputs.length > 0) setSelectedMidiInput(ports.inputs[0]);
      addActivity(`WebMIDI ready: ${ports.inputs.length} input${ports.inputs.length === 1 ? "" : "s"}, ${ports.outputs.length} output${ports.outputs.length === 1 ? "" : "s"}`, "midi");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "WebMIDI access was denied";
      setError(message);
      addActivity(message, "error");
    }
  };

  useEffect(() => {
    if (!selectedMidiInput || !midiRouterRef.current) return;
    try {
      midiRouterRef.current.connectInput(selectedMidiInput);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not connect MIDI input";
      setError(message);
    }
  }, [midiReady, selectedMidiInput]);

  const createNewWorkflow = () => {
    const workflow = createWorkflow();
    setWorkflows((current) => [...current, workflow]);
    setSelectedWorkflowId(workflow.id);
  };

  const updateWorkflow = (id: string, patch: Partial<Pick<Workflow, "trigger" | "enabled">>) => {
    setWorkflows((current) => current.map((workflow) => workflow.id === id ? { ...workflow, ...patch } : workflow));
  };

  const updateWorkflowAction = (
    workflowId: string,
    actionId: string,
    update: (action: WorkflowAction) => WorkflowAction
  ) => {
    setWorkflows((current) => current.map((workflow) => workflow.id !== workflowId ? workflow : {
      ...workflow,
      actions: workflow.actions.map((action) => action.id === actionId ? update(action) : action)
    }));
  };

  const deleteWorkflow = (id: string) => {
    const next = workflows.filter((workflow) => workflow.id !== id);
    setWorkflows(next);
    setSelectedWorkflowId(next[0]?.id ?? null);
  };

  const addWorkflowAction = (workflowId: string, type: WorkflowAction["type"]) => {
    const action = createWorkflowAction(type);
    setWorkflows((current) => current.map((workflow) => workflow.id === workflowId
      ? { ...workflow, actions: [...workflow.actions, action] }
      : workflow));
  };

  const deleteWorkflowAction = (workflowId: string, actionId: string) => {
    setWorkflows((current) => current.map((workflow) => workflow.id === workflowId
      ? { ...workflow, actions: workflow.actions.filter((action) => action.id !== actionId) }
      : workflow));
  };

  const duplicateWorkflowAction = (workflowId: string, actionId: string) => {
    setWorkflows((current) => current.map((workflow) => {
      if (workflow.id !== workflowId) return workflow;
      const index = workflow.actions.findIndex((action) => action.id === actionId);
      if (index < 0) return workflow;
      const copy = { ...workflow.actions[index], id: crypto.randomUUID() } as WorkflowAction;
      const actions = [...workflow.actions];
      actions.splice(index + 1, 0, copy);
      return { ...workflow, actions };
    }));
  };

  const moveAction = (workflowId: string, index: number, offset: -1 | 1) => {
    setWorkflows((current) => current.map((workflow) => workflow.id === workflowId
      ? { ...workflow, actions: moveWorkflowAction(workflow.actions, index, offset) }
      : workflow));
  };

  const connectEngine = async () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (connectionStatus === "connected") return;
    if (connectPromiseRef.current) {
      await connectPromiseRef.current;
      return;
    }

    setConnectionStatus("connecting");
    setError(null);
    const pending = engine.connect()
      .then(() => engine)
      .catch((cause: unknown) => {
        const message = cause instanceof Error ? cause.message : "Could not connect to the Mantra engine";
        setConnectionStatus("error");
        setError(message);
        addActivity(message, "error");
        return null;
      })
      .finally(() => {
        connectPromiseRef.current = null;
      });
    connectPromiseRef.current = pending;
    await pending;
  };

  const handleManualConnect = async () => {
    engineRef.current?.disconnect();
    setConnectionStatus("disconnected");
    connectPromiseRef.current = null;
    await connectEngine();
  };

  const voiceStatusLabel = voiceStatus === "wake"
    ? `Wake word: ${wakePhrase}`
    : voiceStatus === "recording"
      ? "Listening for a command"
      : voiceStatus === "processing"
        ? "Sending command"
        : voiceStatus === "error"
          ? "Voice input needs attention"
          : "Press to speak";
  const recognitionStatusLabel = recognitionEngine === "whisper"
    ? recognitionStatus === "loading"
      ? `Loading ${WHISPER_MODELS.find((model) => model.id === whisperModel)?.label ?? "Whisper"} model (${modelProgress}%)`
      : recognitionStatus === "ready"
        ? `Local Whisper ready${recognitionDevice ? ` (${recognitionDevice})` : ""}`
        : recognitionStatus === "listening"
          ? "Listening with local Whisper"
          : recognitionStatus === "transcribing"
            ? "Transcribing locally…"
            : "Local Whisper needs attention"
    : recognitionStatus === "ready"
      ? "Browser speech recognition ready"
      : recognitionStatus === "listening"
        ? "Listening with browser speech recognition"
        : recognitionStatus === "error"
          ? "Browser speech recognition needs attention"
          : "Preparing browser speech recognition";

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#main" aria-label="Mantra FE home">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span className="brand-name">mantra<span>fe</span></span>
        </a>
        <div className="topbar-status" aria-live="polite">
          <span className={`status-dot status-${connectionStatus}`} aria-hidden="true" />
          <span>ENGINE</span>
          <strong>{connectionStatus}</strong>
        </div>
        <div className="endpoint-control">
          <label htmlFor="engine-url">WebSocket</label>
          <input id="engine-url" value={engineUrl} onChange={(event) => setEngineUrl(event.target.value)} />
          <button className="button button-dark" type="button" onClick={handleManualConnect} disabled={connectionStatus === "connecting"}>
            {connectionStatus === "connecting" ? "Connecting…" : connectionStatus === "connected" ? "Reconnect" : "Connect"}
          </button>
        </div>
      </header>

      <main className="app-main" id="main">
        <aside className="control-rail" aria-label="Voice and device controls">
          <section className="control-section voice-section" aria-labelledby="voice-heading">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">01 / INPUT</p>
                <h2 id="voice-heading">Voice control</h2>
              </div>
              <span className={`voice-indicator voice-${voiceStatus}`} aria-hidden="true" />
            </div>

            <label className="field-label" htmlFor="wake-phrase">Wake word</label>
            <select id="wake-phrase" value={wakePhrase} onChange={(event) => setWakePhrase(event.target.value as WakePhrase)}>
              <option value="bumblebee">Bumblebee</option>
              <option value="computer">Computer</option>
              <option value="jarvis">Jarvis</option>
            </select>
            <label className="field-label" htmlFor="speech-language">Speech language</label>
            <select id="speech-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="en-CA">English (Canada)</option>
              <option value="en-AU">English (Australia)</option>
            </select>
            <label className="field-label" htmlFor="speech-engine">Speech recognition engine</label>
            <select
              id="speech-engine"
              value={recognitionEngine}
              onChange={(event) => {
                setError(null);
                setIsRecording(false);
                setPartialTranscript("");
                setVoiceStatus(wakeEnabled ? "wake" : "idle");
                const selectedEngine = event.target.value;
                if (selectedEngine === "web-speech" || selectedEngine === "whisper") {
                  setRecognitionEngine(selectedEngine);
                  setRecognitionStatus(selectedEngine === "whisper" ? "loading" : "ready");
                }
              }}
            >
              <option value="web-speech">Browser (Web Speech API)</option>
              <option value="whisper">Local Whisper (on this device)</option>
            </select>
            {recognitionEngine === "whisper" && (
              <>
                <label className="field-label" htmlFor="whisper-model">Whisper model</label>
                <select
                  id="whisper-model"
                  value={whisperModel}
                  onChange={(event) => {
                    const selectedModel = WHISPER_MODELS.find((model) => model.id === event.target.value);
                    if (selectedModel) {
                      setError(null);
                      setIsRecording(false);
                      setPartialTranscript("");
                      setVoiceStatus(wakeEnabled ? "wake" : "idle");
                      setRecognitionStatus("loading");
                      setWhisperModel(selectedModel.id);
                    }
                  }}
                >
                  {WHISPER_MODELS.map((model) => <option key={model.id} value={model.id}>{model.label}</option>)}
                </select>
              </>
            )}
            <p className="quiet-copy" role="status">{recognitionStatusLabel}</p>

            <button
              className={`speak-button ${isRecording ? "speak-button-active" : ""}`}
              type="button"
              aria-label={isRecording ? "Stop speaking" : "Press to speak"}
              aria-pressed={isRecording}
              onClick={isRecording ? stopSpeaking : startSpeaking}
              disabled={!hydrated || (!isRecording && recognitionEngine === "whisper" && recognitionStatus !== "ready")}
            >
              <span className="speak-button-core" aria-hidden="true">{isRecording ? "■" : "●"}</span>
              <span>{isRecording ? "Stop capture" : "Press to speak"}</span>
            </button>
            <p className="voice-status" role="status">{voiceStatusLabel}</p>
            <label className="toggle-label wake-toggle">
              <input type="checkbox" checked={wakeEnabled} onChange={(event) => setWakeEnabled(event.target.checked)} />
              <span>Listen for wake word</span>
            </label>
            <div className="transcript-box" aria-live="polite" aria-atomic="false">
              <span className="eyebrow">TRANSCRIPT</span>
              <p>{partialTranscript || finalTranscript || "Spoken commands appear here."}</p>
            </div>
            <form
              className="typed-command-form"
              onSubmit={(event) => {
                event.preventDefault();
                const command = typedCommand;
                setTypedCommand("");
                void handleTranscript(command);
              }}
            >
              <label className="field-label" htmlFor="typed-command">Type a command</label>
              <div className="typed-command-row">
                <input
                  id="typed-command"
                  value={typedCommand}
                  onChange={(event) => setTypedCommand(event.target.value)}
                  placeholder="play, or a workflow trigger"
                />
                <button className="button button-dark" type="submit" disabled={!typedCommand.trim()}>Run</button>
              </div>
            </form>
          </section>

          <section className="control-section device-section" aria-labelledby="device-heading">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">02 / DEVICES</p>
                <h2 id="device-heading">MIDI input</h2>
              </div>
              <span className={`connection-label ${midiReady ? "is-connected" : ""}`}>{midiReady ? "READY" : "OFF"}</span>
            </div>
            {midiInputs.length > 0 ? (
              <label className="field-label" htmlFor="midi-input">Input port
                <select id="midi-input" value={selectedMidiInput} onChange={(event) => setSelectedMidiInput(event.target.value)}>
                  {midiInputs.map((port) => <option key={port} value={port}>{port}</option>)}
                </select>
              </label>
            ) : <p className="quiet-copy">Connect a MIDI input to map a hardware button.</p>}
            <div className="midi-map-row">
              <div><span className="field-label">Speak key</span><strong className="mapped-note">MIDI note {midiNote}</strong></div>
              <button
                className={`button ${learningMidi ? "button-learn-active" : "button-secondary"}`}
                type="button"
                aria-pressed={learningMidi}
                onClick={() => {
                  learningMidiRef.current = !learningMidi;
                  setLearningMidi(learningMidiRef.current);
                }}
              >{learningMidi ? "Press a key…" : "Learn key"}</button>
            </div>
            <button className="button button-full button-secondary" type="button" onClick={() => void enableMidi()}>
              {midiReady ? "Refresh MIDI devices" : "Enable WebMIDI"}
            </button>
            {midiOutputs.length > 0 && <p className="quiet-copy">{midiOutputs.length} MIDI output{midiOutputs.length === 1 ? "" : "s"} available to workflows.</p>}
          </section>

          {error && <div className="error-banner" role="alert">{error}</div>}
        </aside>

        <section className="main-column">
          <WorkflowBuilder
            workflows={workflows}
            selectedWorkflowId={selectedWorkflowId}
            midiOutputs={midiOutputs}
            onCreate={createNewWorkflow}
            onSelect={setSelectedWorkflowId}
            onUpdateWorkflow={updateWorkflow}
            onDeleteWorkflow={deleteWorkflow}
            onAddAction={addWorkflowAction}
            onUpdateAction={updateWorkflowAction}
            onDeleteAction={deleteWorkflowAction}
            onDuplicateAction={duplicateWorkflowAction}
            onMoveAction={moveAction}
          />

          <section className="activity-panel" aria-labelledby="activity-heading">
            <div className="panel-heading activity-heading">
              <div><p className="eyebrow">03 / LIVE FEED</p><h2 id="activity-heading">Activity</h2></div>
              <span className="activity-count">{activity.length} events</span>
            </div>
            {activity.length === 0 ? (
              <p className="quiet-copy">Engine acknowledgements and workflow dispatches will appear here.</p>
            ) : (
              <ol className="activity-list" aria-live="polite">
                {activity.map((item) => (
                  <li className="activity-item" key={item.id}>
                    <span className={`activity-mark activity-${item.kind}`} aria-hidden="true" />
                    <span>{item.label}</span>
                    <time>{item.time}</time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </section>
      </main>
      <footer className="app-footer"><span>MANTRA FE</span><span>VOICE → MIP → WORKFLOW</span></footer>
    </div>
  );
}
