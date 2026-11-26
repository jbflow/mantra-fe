import { TinyEmitter } from '@/domains/shared/TinyEmitter';
import type { RecognitionEvents, SpeechRecognitionEngine } from '@/domains/speech/SpeechRecognitionEngine';

type SpeechRecCtor = new () => SpeechRecognition;

function getSpeechRecCtor(): SpeechRecCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export class RecognitionService implements SpeechRecognitionEngine {
  private rec: SpeechRecognition;
  private emitter = new TinyEmitter<RecognitionEvents>();
  private running = false;

  constructor(opts: { lang?: string; continuous?: boolean } = {}) {
    const RecCtor = getSpeechRecCtor();
    if (!RecCtor) throw new Error('Web Speech API not supported in this browser');

    this.rec = new RecCtor();
    this.rec.lang = opts.lang ?? 'en-US';
    this.rec.continuous = !!opts.continuous;
    this.rec.interimResults = true;

    this.rec.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const text = last[0].transcript.trim();
      if (last.isFinal) {
        this.emitter.emit('final', text);
      } else {
        this.emitter.emit('partial', text);
      }
    };

    this.rec.onerror = (err) => {
      this.running = false;
      this.emitter.emit('error', new Error(err.error || 'speech-error'));
      this.emitter.emit('status', { state: 'error' });
    };

    this.rec.onend = () => {
      this.running = false;
      this.emitter.emit('status', { state: 'ready' });
    };
  }

  on  = this.emitter.on;
  off = this.emitter.off;

  async initialize() {
    this.emitter.emit('status', { state: 'ready' });
  }

  async start() {
    this.rec.start();
    this.running = true;
    this.emitter.emit('status', { state: 'listening' });
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.rec.stop();
    this.emitter.emit('status', { state: 'ready' });
  }

  dispose() {
    this.stop();
    this.rec.onresult = null;
    this.rec.onerror = null;
    this.rec.onend = null;
  }
}
