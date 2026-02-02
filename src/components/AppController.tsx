"use client";

import { useEffect, useRef, useState } from "react";
import { WakeWordDetector } from "@/domains/speech/WakeWordDetector";
import { RecognitionService } from "@/domains/speech/RecognitionService";

type Status = "idle" | "listening" | "heard" | "error";
const COMMAND_WINDOW_MS = 5000;

export default function AppController() {
  const wakeRef = useRef<WakeWordDetector | null>(null);
  const recRef = useRef<RecognitionService | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [lastFinal, setLastFinal] = useState("");
  const [lastPartial, setLastPartial] = useState("");
  const [error, setError] = useState<string | null>(null);
  const commandTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const wake = new WakeWordDetector({ wakePhrase: "talkback", lang: "en-US" });
    const rec = new RecognitionService({ lang: "en-US", continuous: false });

    const clearCommandTimer = () => {
      if (commandTimerRef.current) {
        window.clearTimeout(commandTimerRef.current);
        commandTimerRef.current = null;
      }
    };

    const startCommandTimer = () => {
      clearCommandTimer();
      commandTimerRef.current = window.setTimeout(() => {
        rec.stop();
        wake.start();
        setStatus("listening");
      }, COMMAND_WINDOW_MS);
    };

    const onWake = () => {
      setStatus("heard");
      setLastPartial("");
      try {
        wake.stop();
        rec.start();
        startCommandTimer();
      } catch (err) {
        setError((err as Error).message);
        setStatus("error");
      }
    };

    const onPartial = (text: string) => {
      setLastPartial(text);
      startCommandTimer();
    };

    const onFinal = (text: string) => {
      setLastFinal(text);
      setLastPartial("");
      setStatus("listening");
      rec.stop();
      clearCommandTimer();
      wake.start();
    };

    const onRecError = (err: Error) => {
      setError(err.message);
      setStatus("error");
    };

    const onWakeError = (err: Error) => {
      setError(err.message);
      setStatus("error");
    };

    wake.on("wake", onWake);
    wake.on("error", onWakeError);
    rec.on("partial", onPartial);
    rec.on("final", onFinal);
    rec.on("error", onRecError);

    wakeRef.current = wake;
    recRef.current = rec;

    return () => {
      wake.off("wake", onWake);
      wake.off("error", onWakeError);
      rec.off("partial", onPartial);
      rec.off("final", onFinal);
      rec.off("error", onRecError);
      clearCommandTimer();
      wake.stop();
      rec.stop();
    };
  }, []);

  const handleStart = () => {
    setError(null);
    setStatus("listening");
    wakeRef.current?.start();
  };

  const handleStop = () => {
    wakeRef.current?.stop();
    recRef.current?.stop();
    setStatus("idle");
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Talkback (Web Speech)</h1>
      <p className="mt-2 text-sm text-gray-600">
        Wake phrase: <strong>“talkback”</strong>
      </p>

      <div className="mt-6 flex gap-3">
        <button
          className="rounded bg-black px-4 py-2 text-white"
          onClick={handleStart}
        >
          Start listening
        </button>
        <button
          className="rounded border border-black px-4 py-2"
          onClick={handleStop}
        >
          Stop
        </button>
      </div>

      <div className="mt-6 space-y-2">
        <div>
          <strong>Status:</strong> {status}
        </div>
        <div>
          <strong>Partial:</strong> {lastPartial || "—"}
        </div>
        <div>
          <strong>Final:</strong> {lastFinal || "—"}
        </div>
        {error && (
          <div className="text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}