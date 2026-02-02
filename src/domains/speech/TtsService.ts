import { TinyEmitter } from '@/domains/shared/TinyEmitter';

type TtsEvents = {
  start: undefined;
  end: undefined;
  error: Error;
};

/**
 * Tiny Text‑to‑Speech helper around `speechSynthesis`.
 */
export class TtsService {
  private synth = window.speechSynthesis;
  private emitter = new TinyEmitter<TtsEvents>();
  constructor(){
    
  }

  on  = this.emitter.on;
  off = this.emitter.off;

  speak(text: string, opts: Partial<SpeechSynthesisUtterance> = {}) {
    const utt = new SpeechSynthesisUtterance(text);
    Object.assign(utt, opts);
    utt.onstart = () => this.emitter.emit('start', undefined);
    utt.onend   = () => this.emitter.emit('end', undefined);
    utt.onerror = e => this.emitter.emit('error', e.error as any);
    this.synth.speak(utt);
  }

  cancel() { this.synth.cancel(); }
}
