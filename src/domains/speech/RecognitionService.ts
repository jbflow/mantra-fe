import mitt, { Emitter } from 'mitt';

/* ------------------------------------------------------------------ *
 *  Event map
 * ------------------------------------------------------------------ */
type RecEvents = {
  partial: string;
  final: string;
  error: Error;
};

/* ------------------------------------------------------------------ *
 *  Helper: get SpeechRecognition constructor in a typed‑safe way
 * ------------------------------------------------------------------ */
type SpeechRecCtor = new () => SpeechRecognition;

/**
 * Returns the browser's SpeechRecognition constructor (vendor‑prefixed if necessary).
 * Casts `window` to include vendor properties so TypeScript is satisfied.
 */
function getSpeechRecCtor(): SpeechRecCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

/* ------------------------------------------------------------------ *
 *  RecognitionService
 * ------------------------------------------------------------------ */
/**
 * Thin wrapper around the Web Speech API that emits `"partial"` and `"final"`
 * transcript events via `mitt`.
 */
export class RecognitionService {
  private rec: SpeechRecognition;
  private emitter: Emitter<RecEvents> = mitt<RecEvents>();

  constructor(opts: { lang?: string; continuous?: boolean } = {}) {
    const RecCtor = getSpeechRecCtor();
    if (!RecCtor) throw new Error('Web Speech API not supported in this browser');

    this.rec = new RecCtor();
    this.rec.lang = opts.lang ?? 'en-US';
    this.rec.continuous = !!opts.continuous;

    this.rec.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript.trim();
      last.isFinal
        ? this.emitter.emit('final', text)
        : this.emitter.emit('partial', text);
    };

    this.rec.onerror = (err) =>
      this.emitter.emit('error', new Error((err as any).error || 'speech-error'));
  }

  /* ---------------- public API ---------------- */
  on  = this.emitter.on;
  off = this.emitter.off;

  start() { this.rec.start(); }
  stop()  { this.rec.stop(); }
}
