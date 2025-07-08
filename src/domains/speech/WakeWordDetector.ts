import mitt, { Emitter } from 'mitt';

type WakeEvents = { wake: undefined; error: Error };

/**
 * Stub wake‑word detector. Swap `detect()` with real engine (Porcupine, VAD, etc.).
 */
export class WakeWordDetector {
  private emitter: Emitter<WakeEvents> = mitt<WakeEvents>();

  on  = this.emitter.on;
  off = this.emitter.off;

  /** Fake call used in tests; real impl will stream audio & detect. */
  trigger() { this.emitter.emit('wake', undefined); }

  /** Example placeholder for engine errors */
  fail(err: Error) { this.emitter.emit('error', err); }
}
