import { TinyEmitter } from '@/domains/shared/TinyEmitter';

type WakeEvents = { wake: undefined; error: Error };

type SpeechRecCtor = new () => SpeechRecognition;

function getSpeechRecCtor(): SpeechRecCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

type WakeOptions = {
  wakePhrase?: string;
  lang?: string;
};

/**
 * Wake‑word detector using Web Speech (wake‑phrase match on final transcripts).
 */
export class WakeWordDetector {
  private emitter = new TinyEmitter<WakeEvents>();
  private rec?: SpeechRecognition;
  private active = false;
  private wakePhrase: string;
  private lang: string;

  constructor(opts: WakeOptions = {}) {
    this.wakePhrase = (opts.wakePhrase ?? 'talkback').toLowerCase();
    this.lang = opts.lang ?? 'en-GB';
  }

  on = this.emitter.on;
  off = this.emitter.off;

  setWakePhrase(phrase: string) {
    this.wakePhrase = phrase.toLowerCase();
  }

  start() {
    if (typeof window === 'undefined') return;
    const RecCtor = getSpeechRecCtor();
    if (!RecCtor) {
      this.emitter.emit('error', new Error('Web Speech API not supported'));
      return;
    }

    if (!this.rec) {
      this.rec = new RecCtor();
      this.rec.lang = this.lang;
      this.rec.continuous = true;
      this.rec.interimResults = true;

      this.rec.onresult = (event: SpeechRecognitionEvent) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result.isFinal) continue;
          const transcript = result[0]?.transcript?.trim().toLowerCase() ?? '';
          if (this.matchesWakePhrase(transcript)) {
            this.emitter.emit('wake', undefined);
          }
        }
      };

      this.rec.onerror = (e) => {
        const err = new Error((e as any).error || 'speech-error');
        this.emitter.emit('error', err);
      };

      this.rec.onend = () => {
        if (this.active) {
          try {
            this.rec?.start();
          } catch {
            // swallow re-start errors (browser throttling)
          }
        }
      };
    }

    this.active = true;
    try {
      this.rec.start();
    } catch {
      // ignore redundant start() calls
    }
  }

  stop() {
    this.active = false;
    try {
      this.rec?.stop();
    } catch {
      // no-op
    }
  }

  /** Fake call used in tests. */
  trigger() {
    this.emitter.emit('wake', undefined);
  }

  private matchesWakePhrase(transcript: string) {
    if (!this.wakePhrase) return false;
    return transcript.includes(this.wakePhrase);
  }
}
