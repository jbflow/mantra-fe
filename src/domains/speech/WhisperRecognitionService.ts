import { TinyEmitter } from '@/domains/shared/TinyEmitter';
import type {
  RecognitionEvents,
  SpeechRecognitionEngine,
  WhisperModelId,
} from '@/domains/speech/SpeechRecognitionEngine';

type Transcriber = (
  audio: Float32Array,
  options?: Record<string, unknown>
) => Promise<{ text: string } | { text: string }[]>;

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
  const out = new Float32Array(chunks.reduce((n, chunk) => n + chunk.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
};

export class WhisperRecognitionService implements SpeechRecognitionEngine {
  private readonly emitter = new TinyEmitter<RecognitionEvents>();
  private transcriber: Transcriber | null = null;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private tick: ReturnType<typeof setInterval> | null = null;
  private chunks: Float32Array[] = [];
  private hasVoice = false;
  private lastVoiceAt = 0;
  private busy = false;
  private active = false;
  private stopRequested = false;
  private startRequest = 0;
  private disposed = false;

  constructor(private readonly options: { model: WhisperModelId }) {}

  on = this.emitter.on;
  off = this.emitter.off;

  async initialize() {
    this.emitter.emit('status', { state: 'loading', progress: 0 });
    const { pipeline } = await import('@huggingface/transformers');
    if (this.disposed) return;
    const useGpu = typeof navigator !== 'undefined' && 'gpu' in navigator;
    const device = useGpu ? 'WebGPU' : 'WASM';
    const transcriber = await pipeline('automatic-speech-recognition', this.options.model, {
      device: useGpu ? 'webgpu' : 'wasm',
      dtype: useGpu ? 'fp32' : undefined,
      progress_callback: (data: { status?: string; progress?: number }) => {
        if (this.disposed) return;
        if (data.status === 'progress' && typeof data.progress === 'number') {
          this.emitter.emit('status', { state: 'loading', progress: Math.round(data.progress) });
        }
      },
    } as Record<string, unknown>);

    if (this.disposed) return;
    this.transcriber = transcriber as unknown as Transcriber;
    this.emitter.emit('status', { state: 'ready', device });
  }

  async start() {
    if (this.disposed) throw new Error('Whisper recognition has been disposed');
    if (!this.transcriber) throw new Error('Whisper model is not ready');
    if (this.active) return;

    this.chunks = [];
    this.hasVoice = false;
    this.lastVoiceAt = 0;
    this.stopRequested = false;
    const requestId = ++this.startRequest;

    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
      if (this.disposed || requestId !== this.startRequest) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      const audioContext = new AudioContext();
      context = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (event) => {
        if (!this.active) return;
        const samples = downsample(event.inputBuffer.getChannelData(0), audioContext.sampleRate);
        let sum = 0;
        for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
        if (Math.sqrt(sum / samples.length) > VOICE_RMS) {
          this.hasVoice = true;
          this.lastVoiceAt = Date.now();
        }
        this.chunks.push(samples);
        if (!this.hasVoice && this.chunks.length > 3) this.chunks.shift();
      };
      source.connect(processor);
      processor.connect(audioContext.destination);

      this.stream = stream;
      this.audioContext = audioContext;
      this.processor = processor;
      this.active = true;
      this.emitter.emit('status', { state: 'listening' });
      this.tick = setInterval(() => {
        const segmentSeconds = this.chunks.reduce((total, chunk) => total + chunk.length, 0) / SAMPLE_RATE;
        const silent = Date.now() - this.lastVoiceAt > SILENCE_COMMIT_MS;
        void this.transcribeWindow(silent || segmentSeconds > MAX_SEGMENT_S);
      }, TICK_MS);
    } catch (cause) {
      stream?.getTracks().forEach((track) => track.stop());
      if (context && context !== this.audioContext) void context.close();
      this.teardownAudio();
      if (this.disposed || requestId !== this.startRequest) return;
      throw cause;
    }
  }

  stop() {
    this.startRequest++;
    this.teardownAudio();
    if (this.busy) {
      this.stopRequested = true;
      return;
    }
    if (this.hasVoice) {
      void this.transcribeWindow(true);
    } else {
      this.emitter.emit('status', { state: 'ready' });
    }
  }

  dispose() {
    this.disposed = true;
    this.startRequest++;
    this.teardownAudio();
  }

  private teardownAudio() {
    this.active = false;
    if (this.tick) clearInterval(this.tick);
    this.tick = null;
    this.processor?.disconnect();
    this.processor = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    const context = this.audioContext;
    this.audioContext = null;
    if (context) void context.close();
  }

  private async transcribeWindow(commit: boolean) {
    const transcriber = this.transcriber;
    if (!transcriber || this.busy || !this.hasVoice) return;
    const audio = concat(this.chunks);
    if (audio.length < SAMPLE_RATE * 0.8) {
      if (commit && !this.active) this.emitter.emit('status', { state: 'ready' });
      return;
    }

    this.busy = true;
    this.emitter.emit('status', { state: 'transcribing' });
    try {
      const output = await transcriber(audio, { chunk_length_s: 30 });
      if (this.disposed) return;
      const text = (Array.isArray(output) ? output[0]?.text : output.text)?.trim() ?? '';
      if (commit) {
        if (text) this.emitter.emit('final', text);
        this.chunks = [];
        this.hasVoice = false;
      } else {
        this.emitter.emit('partial', text);
      }
    } catch (cause) {
      if (!this.disposed) {
        const error = cause instanceof Error ? cause : new Error('Transcription failed');
        this.emitter.emit('error', error);
        this.emitter.emit('status', { state: 'error' });
      }
    } finally {
      this.busy = false;
      if (this.disposed) return;
      if (this.stopRequested) {
        this.stopRequested = false;
        if (this.hasVoice) void this.transcribeWindow(true);
        else this.emitter.emit('status', { state: 'ready' });
      } else if (this.active) {
        this.emitter.emit('status', { state: 'listening' });
      } else if (commit) {
        this.emitter.emit('status', { state: 'ready' });
      }
    }
  }
}
