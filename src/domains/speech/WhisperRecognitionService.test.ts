import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { pipelineMock } = vi.hoisted(() => ({ pipelineMock: vi.fn() }));

vi.mock('@huggingface/transformers', () => ({ pipeline: pipelineMock }));

import { WhisperRecognitionService } from './WhisperRecognitionService';
import type { RecognitionEvents } from './SpeechRecognitionEngine';

type PipelineOptions = {
  progress_callback?: (data: { status?: string; progress?: number }) => void;
};

describe('WhisperRecognitionService', () => {
  beforeEach(() => {
    pipelineMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
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
    pipelineMock.mockImplementation(async () => async () => ({ text: 'local command' }));

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

    expect(partials).toContain('local command');
    expect(finals).toEqual(['local command']);
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
