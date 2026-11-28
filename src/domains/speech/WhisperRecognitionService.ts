import { TinyEmitter } from '@/domains/shared/TinyEmitter';
import type {
  RecognitionEvents,
  SpeechRecognitionEngine,
  WhisperModelId,
} from '@/domains/speech/SpeechRecognitionEngine';
import type { Intent } from 'musical-intent-protocol';
import { normalizeSpeechTranscript, protocolActions, protocolDefinitions } from './musicalNormalization';

type Transcriber = (
  audio: Float32Array,
  options?: Record<string, unknown>
) => Promise<{ text: string } | { text: string }[]>;

type PromptTranscriber = Transcriber & {
  model?: {
    config?: { model_type?: string | null };
    generation_config?: {
      is_multilingual?: boolean;
      decoder_start_token_id?: number;
      no_timestamps_token_id?: number;
    } | null;
  };
  tokenizer?: {
    all_special_ids: number[];
    convert_tokens_to_ids(token: string): number;
    encode(text: string, options: { add_special_tokens: boolean }): number[];
    decode(tokens: number[]): string;
  };
};

const SAMPLE_RATE = 16000;
const VOICE_RMS = 0.01;
const TICK_MS = 1000;
const SILENCE_COMMIT_MS = 1200;
const MAX_SEGMENT_S = 20;

const roles = new Set<string>(protocolDefinitions.Role.enum);

export function whisperVocabulary(lastIntent?: Intent): string {
  const terms = ['quantize', 'metronome', 'chord progression', 'hihat'];
  if (lastIntent) {
    const { intent } = lastIntent;
    if ('target' in intent && intent.target?.role && roles.has(intent.target.role)) {
      terms.unshift(intent.target.role.replace(/_/g, ' '));
    } else if ('role' in intent && intent.role && roles.has(intent.role)) {
      terms.unshift(intent.role.replace(/_/g, ' '));
    }
    if (protocolActions.has(intent.action)) {
      terms.unshift(intent.action.replace(/_/g, ' '));
    }
  }
  return [...new Set(terms)].join(', ') + '.';
}

export function whisperPrompt(transcriber: PromptTranscriber, text: string) {
  const { model, tokenizer } = transcriber;
  const config = model?.generation_config;
  if (model?.config?.model_type !== 'whisper' || config?.is_multilingual !== false ||
      typeof config.decoder_start_token_id !== 'number' ||
      typeof config.no_timestamps_token_id !== 'number' || !tokenizer ||
      !Array.isArray(tokenizer.all_special_ids) ||
      typeof tokenizer.convert_tokens_to_ids !== 'function' ||
      typeof tokenizer.encode !== 'function' || typeof tokenizer.decode !== 'function') return undefined;

  const previous = tokenizer.convert_tokens_to_ids('<|startofprev|>');
  if (!tokenizer.all_special_ids.includes(previous) ||
      tokenizer.decode([previous]) !== '<|startofprev|>' ||
      tokenizer.convert_tokens_to_ids('<|startoftranscript|>') !== config.decoder_start_token_id ||
      tokenizer.convert_tokens_to_ids('<|notimestamps|>') !== config.no_timestamps_token_id) return undefined;
  const tokens = tokenizer.encode(` ${text}`, { add_special_tokens: false });
  if (!tokens.length || tokens.length > 64 || tokens.some((id) => tokenizer.all_special_ids.includes(id))) {
    return undefined;
  }
  const decoded = tokenizer.decode(tokens);
  if (!decoded.trim()) return undefined;
  return {
    decoder_input_ids: [previous, ...tokens, config.decoder_start_token_id, config.no_timestamps_token_id],
    decoded,
  };
}

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
  private transcriber: PromptTranscriber | null = null;
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

  constructor(private readonly options: { model: WhisperModelId; getLastIntent?: () => Intent | undefined }) {}

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
    this.transcriber = transcriber;
    if (!whisperPrompt(this.transcriber, whisperVocabulary())) {
      console.warn('Whisper contextual prompting is unavailable for this model; using unprompted transcription.');
    }
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
      const prompt = audio.length <= SAMPLE_RATE * 30
        ? whisperPrompt(transcriber, whisperVocabulary(this.options.getLastIntent?.()))
        : undefined;
      // Transformers.js exposes decoder prefixes, but its ASR decoder includes their text in the result.
      const output = await transcriber(audio, {
        chunk_length_s: 30,
        ...(prompt ? { decoder_input_ids: prompt.decoder_input_ids } : {}),
      });
      if (this.disposed) return;
      let text = (Array.isArray(output) ? output[0]?.text : output.text) ?? '';
      if (prompt) {
        if (!text.startsWith(prompt.decoded)) {
          console.warn('Whisper did not return the expected prompt prefix; retrying without context.');
          const fallback = await transcriber(audio, { chunk_length_s: 30 });
          if (this.disposed) return;
          text = (Array.isArray(fallback) ? fallback[0]?.text : fallback.text) ?? '';
        } else {
          text = text.slice(prompt.decoded.length);
        }
      }
      text = text.trim();
      if (commit) {
        if (text) this.emitter.emit('final', normalizeSpeechTranscript(text));
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
