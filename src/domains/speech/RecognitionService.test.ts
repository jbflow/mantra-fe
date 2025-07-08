import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecognitionService } from './RecognitionService';

/* ───────────────── Mock Web Speech API ───────────────── */
class MockRec {
  lang = '';
  continuous = false;
  onresult: (e: any) => void = () => {};
  onerror: (e: any) => void = () => {};
  start = vi.fn();
  stop = vi.fn();
}

/* attach to real window (provided by jsdom) */
beforeEach(() => {
  (window as any).SpeechRecognition = MockRec;
});

describe('RecognitionService', () => {
  let svc: RecognitionService;
  let rec: MockRec;

  beforeEach(() => {
    svc = new RecognitionService({ continuous: true });
    rec = svc['rec'] as any;
  });

  it('emits final transcript', () => {
    const spy = vi.fn();
    svc.on('final', spy);

    rec.onresult({
      results: [{ isFinal: true, 0: { transcript: 'hello' } }],
    });

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('emits partial transcript', () => {
    const spy = vi.fn();
    svc.on('partial', spy);

    rec.onresult({
      results: [{ isFinal: false, 0: { transcript: 'hel' } }],
    });

    expect(spy).toHaveBeenCalledWith('hel');
  });
});
