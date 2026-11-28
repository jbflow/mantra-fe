import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { pipelineMock } = vi.hoisted(() => ({ pipelineMock: vi.fn() }));

vi.mock('@huggingface/transformers', () => ({ pipeline: pipelineMock }));

import { WhisperRecognitionService, whisperPrompt, whisperVocabulary } from './WhisperRecognitionService';
import type { RecognitionEvents } from './SpeechRecognitionEngine';
import type { Intent } from 'musical-intent-protocol';

type PipelineOptions = {
  progress_callback?: (data: { status?: string; progress?: number }) => void;
};

function promptableTranscriber(transcribe: (audio: Float32Array, options?: Record<string, unknown>) => Promise<{ text: string }>) {
  let encoded = '';
  return Object.assign(transcribe, {
    model: {
      config: { model_type: 'whisper' },
      generation_config: { is_multilingual: false, decoder_start_token_id: 2, no_timestamps_token_id: 3 },
    },
    tokenizer: {
      all_special_ids: [1, 2, 3],
      convert_tokens_to_ids: (token: string) => ({
        '<|startofprev|>': 1,
        '<|startoftranscript|>': 2,
        '<|notimestamps|>': 3,
      }[token] ?? 0),
      encode: (text: string) => { encoded = text; return [10, 11]; },
      decode: (tokens: number[]) => tokens[0] === 1 ? '<|startofprev|>' : encoded,
    },
  });
}

describe('WhisperRecognitionService', () => {
  beforeEach(() => {
    pipelineMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('builds a short vocabulary from validated protocol terms and the last intent', () => {
    const intent: Intent = {
      domain: 'structure',
      intent: { action: 'mute', target: { role: 'electric_guitar', track_name: 'private track name' } },
    };
    const baseline = whisperVocabulary();
    const focused = whisperVocabulary(intent);
    expect(baseline).toContain('quantize');
    expect(baseline).toContain('metronome');
    expect(focused).toMatch(/^mute, electric guitar, /);
    expect(focused).not.toContain('private track name');
    expect(focused.length).toBeLessThan(100);
    expect(whisperVocabulary({ domain: 'harmony', intent: { action: 'set_chord_progression', progression: ['C', 'G'] } }))
      .toContain('chord progression');
    expect(whisperVocabulary({
      domain: 'parameters',
      intent: { action: 'increase', target: { role: 'bass', parameter_name: 'attack' }, amount: 5 },
    })).toMatch(/^increase, bass, /);
    expect(whisperVocabulary({ domain: 'pitch', intent: { action: 'transform_series', operation: 'rotate' } }))
      .toContain('transform series');
  });

  it('builds Whisper decoder context and declines unsupported tokenizers or models', () => {
    const transcriber = promptableTranscriber(async () => ({ text: '' }));
    expect(whisperPrompt(transcriber, 'quantize, hihat.')).toEqual({
      decoder_input_ids: [1, 10, 11, 2, 3],
      decoded: ' quantize, hihat.',
    });
    expect(whisperPrompt(async () => ({ text: '' }), 'quantize.')).toBeUndefined();
    transcriber.model.generation_config.is_multilingual = true;
    expect(whisperPrompt(transcriber, 'quantize.')).toBeUndefined();
    transcriber.model.generation_config.is_multilingual = false;
    transcriber.tokenizer.convert_tokens_to_ids = () => 0;
    expect(whisperPrompt(transcriber, 'quantize.')).toBeUndefined();
  });

  it('loads the selected local model and reports loading progress', async () => {
    pipelineMock.mockImplementation(async (_task: unknown, _model: unknown, rawOptions: unknown) => {
      const options = rawOptions as PipelineOptions;
      options.progress_callback?.({ status: 'progress', progress: 42.6 });
      return async () => ({ text: '' });
    });

    const service = new WhisperRecognitionService({ model: 'Xenova/whisper-small.en' });
    const statuses: RecognitionEvents['status'][] = [];
    service.on('status', (status) => statuses.push(status));

    await service.initialize();

    expect(pipelineMock).toHaveBeenCalledWith(
      'automatic-speech-recognition',
      'Xenova/whisper-small.en',
      expect.objectContaining({ device: 'wasm' })
    );
    expect(statuses).toEqual([
      { state: 'loading', progress: 0 },
      { state: 'loading', progress: 43 },
      { state: 'ready', device: 'WASM' },
    ]);
  });

  it('propagates model load failures', async () => {
    pipelineMock.mockRejectedValue(new Error('Model download failed'));
    const service = new WhisperRecognitionService({ model: 'Xenova/whisper-small.en' });

    await expect(service.initialize()).rejects.toThrow('Model download failed');
  });

  it('emits partial transcripts while listening and a final transcript after silence', async () => {
    vi.useFakeTimers();
    const processor = {
      onaudioprocess: null as ((event: AudioProcessingEvent) => void) | null,
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    const stream = { getTracks: () => [{ stop: vi.fn() }] } as unknown as MediaStream;
    const fakeNavigator = Object.create(navigator) as Navigator;
    Object.defineProperty(fakeNavigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn(async () => stream) },
    });
    vi.stubGlobal('navigator', fakeNavigator);
    vi.stubGlobal('AudioContext', class {
      sampleRate = 16000;
      destination = {};
      createMediaStreamSource = () => ({ connect: vi.fn() });
      createScriptProcessor = () => processor as unknown as ScriptProcessorNode;
      close = vi.fn(async () => undefined);
    });
    const transcribe = vi.fn(async () => ({ text: 'add a saw tooth oscillator to the synth' }));
    pipelineMock.mockResolvedValue(transcribe);

    const service = new WhisperRecognitionService({ model: 'Xenova/whisper-small.en' });
    const partials: string[] = [];
    const finals: string[] = [];
    service.on('partial', (text) => partials.push(text));
    service.on('final', (text) => finals.push(text));
    await service.initialize();
    await service.start();

    const emitAudio = (samples: Float32Array) => {
      processor.onaudioprocess?.({
        inputBuffer: { getChannelData: () => samples },
      } as unknown as AudioProcessingEvent);
    };
    emitAudio(new Float32Array(16000).fill(0.1));
    await vi.advanceTimersByTimeAsync(1000);
    emitAudio(new Float32Array(16000));
    await vi.advanceTimersByTimeAsync(2000);

    expect(partials).toContain('add a saw tooth oscillator to the synth');
    expect(finals).toEqual(['add a sawtooth oscillator to the synth']);
    expect(transcribe).toHaveBeenCalledWith(expect.any(Float32Array), { chunk_length_s: 30 });
    service.dispose();
  });

  it('uses the current intent as a hint without emitting the prefix and retries mismatched output unprompted', async () => {
    vi.useFakeTimers();
    const processor = {
      onaudioprocess: null as ((event: AudioProcessingEvent) => void) | null,
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    const fakeNavigator = Object.create(navigator) as Navigator;
    Object.defineProperty(fakeNavigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn(async () => ({ getTracks: () => [{ stop: vi.fn() }] })) },
    });
    vi.stubGlobal('navigator', fakeNavigator);
    vi.stubGlobal('AudioContext', class {
      sampleRate = 16000;
      destination = {};
      createMediaStreamSource = () => ({ connect: vi.fn() });
      createScriptProcessor = () => processor as unknown as ScriptProcessorNode;
      close = vi.fn(async () => undefined);
    });
    let prefix = '';
    let response: 'speech' | 'empty' | 'mismatch' = 'speech';
    const transcribe = vi.fn(async (_audio: Float32Array, options?: Record<string, unknown>) => ({
      text: options?.decoder_input_ids && response !== 'mismatch'
        ? `${prefix}${response === 'speech' ? ' ordinary speech' : ''}` : 'ordinary speech',
    }));
    const transcriber = promptableTranscriber(transcribe);
    const encode = transcriber.tokenizer.encode;
    transcriber.tokenizer.encode = (text: string) => { prefix = text; return encode(text); };
    pipelineMock.mockResolvedValue(transcriber);
    let intent: Intent = { domain: 'structure', intent: { action: 'mute', target: { role: 'bass' } } };
    const service = new WhisperRecognitionService({ model: 'Xenova/whisper-small.en', getLastIntent: () => intent });
    const partials: string[] = [];
    const finals: string[] = [];
    service.on('partial', (text) => partials.push(text));
    service.on('final', (text) => finals.push(text));
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await service.initialize();
    await service.start();
    processor.onaudioprocess?.({
      inputBuffer: { getChannelData: () => new Float32Array(16000).fill(0.1) },
    } as unknown as AudioProcessingEvent);
    await vi.advanceTimersByTimeAsync(1000);
    expect(prefix).toContain('mute, bass');
    expect(transcribe).toHaveBeenCalledWith(expect.any(Float32Array), {
      chunk_length_s: 30, decoder_input_ids: [1, 10, 11, 2, 3],
    });
    expect(partials).toEqual(['ordinary speech']);
    response = 'empty';
    intent = { domain: 'harmony', intent: { action: 'set_chord_progression', progression: ['C', 'G'] } };
    processor.onaudioprocess?.({
      inputBuffer: { getChannelData: () => new Float32Array(16000).fill(0.1) },
    } as unknown as AudioProcessingEvent);
    await vi.advanceTimersByTimeAsync(1000);
    expect(prefix).toContain('set chord progression');
    expect(partials).toEqual(['ordinary speech', '']);
    response = 'mismatch';
    await vi.advanceTimersByTimeAsync(2000);
    expect(finals).toEqual(['ordinary speech']);
    expect(transcribe).toHaveBeenLastCalledWith(expect.any(Float32Array), { chunk_length_s: 30 });
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
    service.dispose();
  });

  it('cancels microphone startup when stopped before permission resolves', async () => {
    let resolveStream: ((stream: MediaStream) => void) | undefined;
    const trackStop = vi.fn();
    const stream = { getTracks: () => [{ stop: trackStop }] } as unknown as MediaStream;
    const fakeNavigator = Object.create(navigator) as Navigator;
    Object.defineProperty(fakeNavigator, 'mediaDevices', {
      value: {
        getUserMedia: () => new Promise<MediaStream>((resolve) => {
          resolveStream = resolve;
        }),
      },
    });
    vi.stubGlobal('navigator', fakeNavigator);
    pipelineMock.mockImplementation(async () => async () => ({ text: '' }));

    const service = new WhisperRecognitionService({ model: 'Xenova/whisper-small.en' });
    await service.initialize();
    const pendingStart = service.start();
    service.stop();
    resolveStream?.(stream);
    await pendingStart;

    expect(trackStop).toHaveBeenCalledOnce();
    service.dispose();
  });
});
