import type { Listener } from '@/domains/shared/TinyEmitter';

export type RecognitionEngineId = 'web-speech' | 'whisper';

export const WHISPER_MODELS = [
  { id: 'Xenova/whisper-small.en', label: 'Small (English)' },
] as const;

export type WhisperModelId = (typeof WHISPER_MODELS)[number]['id'];

export type RecognitionState = 'loading' | 'ready' | 'listening' | 'transcribing' | 'error';

export type RecognitionEvents = {
  partial: string;
  final: string;
  error: Error;
  status: { state: RecognitionState; progress?: number; device?: string };
};

export interface SpeechRecognitionEngine {
  on<K extends keyof RecognitionEvents>(event: K, listener: Listener<RecognitionEvents[K]>): void;
  off<K extends keyof RecognitionEvents>(event: K, listener: Listener<RecognitionEvents[K]>): void;
  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): void;
  dispose(): void;
}
