import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecognitionService } from './RecognitionService';

/* ───────────────── Mock Web Speech API ───────────────── */
class MockRec {
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((event: SpeechRecognitionEvent) => void) | null = null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null;
  onend: ((event: Event) => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
}

/* attach to real window (provided by jsdom) */
beforeEach(() => {
  Object.defineProperty(window, 'SpeechRecognition', { configurable: true, value: MockRec });
});

describe('RecognitionService', () => {
  let svc: RecognitionService;
  let rec: MockRec;

  beforeEach(() => {
    svc = new RecognitionService({ continuous: true });
    rec = (svc as unknown as { rec: MockRec }).rec;
  });

  it('emits final transcript', () => {
    const spy = vi.fn();
    svc.on('final', spy);

    rec.onresult?.({
      results: [{ isFinal: true, 0: { transcript: 'hello' } }],
    } as unknown as SpeechRecognitionEvent);

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('emits partial transcript', () => {
    const spy = vi.fn();
    svc.on('partial', spy);

    rec.onresult?.({
      results: [{ isFinal: false, 0: { transcript: 'hel' } }],
    } as unknown as SpeechRecognitionEvent);

    expect(spy).toHaveBeenCalledWith('hel');
  });

  it('enables interim results for responsive transcripts', () => {
    expect(rec.interimResults).toBe(true);
  });
});
