import { TinyEmitter } from '@/domains/shared/TinyEmitter';

type WakeEvents = { wake: string; error: Error };

type BumblebeeInstance = {
  addHotword: (name: string) => void;
  setHotword: (name: string | null) => void;
  setSensitivity: (sensitivity: number) => void;
  setWorkersPath: (path: string) => void;
  start: () => void;
  stop: () => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
};

type WakeOptions = {
  hotword?: string;
  sensitivity?: number;
};

const AVAILABLE_HOTWORDS = [
  'bumblebee',
  'computer',
  'jarvis',
  'alexa',
  'hey_google',
  'hey_siri',
  'ok_google',
  'grasshopper',
  'hey_edison',
  'porcupine',
  'terminator'
];

/**
 * Hotword detector using Bumblebee (audio-based wake-word detection).
 * No transcription needed — detects hotwords directly from audio stream.
 */
export class WakeWordDetector {
  private emitter = new TinyEmitter<WakeEvents>();
  private bumblebee: BumblebeeInstance | null = null;
  private initPromise: Promise<void> | null = null;
  private active = false;
  private hotword: string;
  private sensitivity: number;

  constructor(opts: WakeOptions = {}) {
    this.hotword = opts.hotword ?? 'bumblebee';
    this.sensitivity = opts.sensitivity ?? 0.5;
  }

  on = this.emitter.on;
  off = this.emitter.off;

  setHotword(word: string) {
    if (!AVAILABLE_HOTWORDS.includes(word)) {
      throw new Error(`Invalid hotword: ${word}`);
    }
    this.hotword = word;
    if (this.bumblebee) {
      this.bumblebee.setHotword(word);
    }
  }

  setSensitivity(sensitivity: number) {
    if (sensitivity < 0 || sensitivity > 1) {
      throw new Error('Sensitivity must be between 0 and 1');
    }
    this.sensitivity = sensitivity;
  }

  start() {
    if (typeof window === 'undefined') return;
    if (this.active) return;

    if (!this.bumblebee) {
      this.ensureInitialized().then(() => {
        if (this.active) {
          this.bumblebee?.start();
        }
      }).catch((cause) => {
        const err = cause instanceof Error ? cause : new Error('Failed to initialize');
        this.emitter.emit('error', err);
        this.active = false;
      });
    } else {
      this.active = true;
      try {
        this.bumblebee.start();
      } catch (cause) {
        const err = cause instanceof Error ? cause : new Error('Failed to start hotword detection');
        this.emitter.emit('error', err);
        this.active = false;
      }
    }

    this.active = true;
  }

  stop() {
    this.active = false;
    try {
      this.bumblebee?.stop();
    } catch {
      // no-op
    }
  }

  /** Fake call used in tests. */
  trigger(hotword: string = this.hotword) {
    this.emitter.emit('wake', hotword);
  }

  private ensureInitialized(): Promise<void> {
    if (this.bumblebee) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.initialize().finally(() => {
      this.initPromise = null;
    });
    return this.initPromise;
  }

  private async initialize(): Promise<void> {
    try {
      const { default: Bumblebee } = await import('bumblebee-hotword');
      const bb = new Bumblebee() as BumblebeeInstance;

      bb.setWorkersPath('/bumblebee-workers');
      bb.setSensitivity(this.sensitivity);

      AVAILABLE_HOTWORDS.forEach((word) => {
        bb.addHotword(word);
      });

      bb.setHotword(this.hotword);

      const handleHotword = (detected: string) => {
        if (this.active) {
          this.emitter.emit('wake', detected);
        }
      };

      const handleError = (err: Error) => {
        this.emitter.emit('error', err instanceof Error ? err : new Error(String(err)));
      };

      bb.on('hotword', handleHotword);
      bb.on('error', handleError);

      this.bumblebee = bb;
    } catch (cause) {
      const err = cause instanceof Error ? cause : new Error('Failed to initialize Bumblebee');
      this.emitter.emit('error', err);
      throw err;
    }
  }
}
