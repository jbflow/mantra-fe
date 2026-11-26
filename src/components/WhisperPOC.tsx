"use client";

import { useEffect, useRef, useState } from "react";
import { pipeline } from "@huggingface/transformers";

type WhisperState = "idle" | "loading" | "ready" | "listening" | "transcribing" | "error";
type Transcriber = (audio: Float32Array, options?: Record<string, unknown>) => Promise<{ text: string } | { text: string }[]>;

const MODEL = "Xenova/whisper-base.en";
const SAMPLE_RATE = 16000;
const VOICE_RMS = 0.01;
const TICK_MS = 1000;
const SILENCE_COMMIT_MS = 1200;
const MAX_SEGMENT_S = 20;

const downsample = (input: Float32Array, inputRate: number): Float32Array => {
  if (inputRate === SAMPLE_RATE) return input.slice();
  const ratio = inputRate / SAMPLE_RATE;
  const out = new Float32Array(Math.floor(input.length / ratio));
  for (let i = 0; i < out.length; i++) {
    const pos = i * ratio;
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, input.length - 1);
    out[i] = input[lo] + (input[hi] - input[lo]) * (pos - lo);
  }
  return out;
};

const concat = (chunks: Float32Array[]): Float32Array => {
  const out = new Float32Array(chunks.reduce((n, c) => n + c.length, 0));
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
};

export default function WhisperPOC() {
  const [state, setState] = useState<WhisperState>("idle");
  const [partialText, setPartialText] = useState("");
  const [finalText, setFinalText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [device, setDevice] = useState("");

  const transcriberRef = useRef<Transcriber | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const hasVoiceRef = useRef(false);
  const lastVoiceRef = useRef(0);
  const busyRef = useRef(false);
  const activeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setState("loading");
        const useGpu = typeof navigator !== "undefined" && "gpu" in navigator;
        setDevice(useGpu ? "WebGPU" : "WASM");
        const transcriber = await pipeline("automatic-speech-recognition", MODEL, {
          device: useGpu ? "webgpu" : "wasm",
          dtype: useGpu ? "fp32" : undefined,
          progress_callback: (data: { status?: string; progress?: number }) => {
            if (data.status === "progress" && typeof data.progress === "number") setProgress(Math.round(data.progress));
          },
        } as Record<string, unknown>);
        if (cancelled) return;
        transcriberRef.current = transcriber as unknown as Transcriber;
        setState("ready");
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "Failed to load Whisper model");
        setState("error");
      }
    };
    void load();
    return () => {
      cancelled = true;
      teardownAudio();
    };
  }, []);

  const teardownAudio = () => {
    activeRef.current = false;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
    processorRef.current?.disconnect();
    processorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
  };

  const transcribeWindow = async (commit: boolean) => {
    const transcriber = transcriberRef.current;
    if (!transcriber || busyRef.current || !hasVoiceRef.current) return;
    const audio = concat(chunksRef.current);
    if (audio.length < SAMPLE_RATE * 0.8) return;

    busyRef.current = true;
    setState("transcribing");
    try {
      const output = await transcriber(audio, { chunk_length_s: 30 });
      const text = (Array.isArray(output) ? output[0]?.text : output.text)?.trim() ?? "";
      if (commit) {
        if (text) setFinalText((prev) => (prev ? `${prev} ${text}` : text));
        setPartialText("");
        chunksRef.current = [];
        hasVoiceRef.current = false;
      } else {
        setPartialText(text);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Transcription failed");
    } finally {
      busyRef.current = false;
      if (activeRef.current) setState("listening");
    }
  };

  const start = async () => {
    if (state !== "ready") return;
    try {
      setError(null);
      setPartialText("");
      setFinalText("");
      chunksRef.current = [];
      hasVoiceRef.current = false;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (event) => {
        if (!activeRef.current) return;
        const samples = downsample(event.inputBuffer.getChannelData(0), ctx.sampleRate);
        let sum = 0;
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        if (Math.sqrt(sum / samples.length) > VOICE_RMS) {
          hasVoiceRef.current = true;
          lastVoiceRef.current = Date.now();
        }
        chunksRef.current.push(samples);
        if (!hasVoiceRef.current && chunksRef.current.length > 3) chunksRef.current.shift();
      };
      source.connect(processor);
      processor.connect(ctx.destination);

      streamRef.current = stream;
      audioCtxRef.current = ctx;
      processorRef.current = processor;
      activeRef.current = true;
      setState("listening");

      tickRef.current = setInterval(() => {
        const segmentSeconds = chunksRef.current.reduce((n, c) => n + c.length, 0) / SAMPLE_RATE;
        const silent = Date.now() - lastVoiceRef.current > SILENCE_COMMIT_MS;
        void transcribeWindow(silent || segmentSeconds > MAX_SEGMENT_S);
      }, TICK_MS);
    } catch (cause) {
      teardownAudio();
      setError(cause instanceof Error ? cause.message : "Failed to access microphone");
      setState("ready");
    }
  };

  const stop = () => {
    teardownAudio();
    if (partialText) {
      setFinalText((prev) => (prev ? `${prev} ${partialText}` : partialText));
      setPartialText("");
    }
    setState("ready");
  };

  const label =
    state === "idle" ? "Model not loaded"
    : state === "loading" ? `Loading model (${progress}%)`
    : state === "ready" ? `Model ready (${device})`
    : state === "listening" ? "Listening…"
    : state === "transcribing" ? "Transcribing…"
    : "Error";

  return (
    <section className="control-section whisper-poc-section" aria-labelledby="whisper-heading">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">WHISPER POC</p>
          <h2 id="whisper-heading">Browser STT</h2>
        </div>
      </div>

      <p className="quiet-copy" role="status">{label}</p>

      <div className="transcript-box" aria-live="polite" aria-atomic="false">
        <span className="eyebrow">TRANSCRIPT</span>
        <p>
          {finalText}
          {partialText && <em style={{ opacity: 0.6 }}>{finalText ? " " : ""}{partialText}</em>}
          {!finalText && !partialText && "Whisper transcription will appear here."}
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0" }}>
        <button className="button button-dark" type="button" onClick={() => void start()} disabled={state !== "ready"}>Start</button>
        <button className="button button-secondary" type="button" onClick={stop} disabled={state !== "listening" && state !== "transcribing"}>Stop</button>
      </div>

      {error && <p style={{ color: "#e74c3c", fontSize: "0.875rem" }}>{error}</p>}
    </section>
  );
}
