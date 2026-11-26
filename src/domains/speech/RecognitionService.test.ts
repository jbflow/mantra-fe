import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecognitionService } from './RecognitionService';

/* ───────────────── Mock Web Speech API ───────────────── */
class MockRec {
  lang = '';
  continuous = false;
  interimResults = false;
  maxAlternatives = 1;
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
    expect(rec.maxAlternatives).toBeGreaterThan(1);
  });

  function recognize(alternatives: Array<[string, number]>, isFinal = true) {
    const spy = vi.fn();
    svc.on(isFinal ? 'final' : 'partial', spy);
    const result = Object.assign(
      alternatives.map(([transcript, confidence]) => ({ transcript, confidence })),
      { isFinal },
    );
    rec.onresult?.({ results: [result] } as unknown as SpeechRecognitionEvent);
    return spy.mock.calls[0][0];
  }

  it('prefers a similar actionable alternative with a protocol role', () => {
    expect(recognize([['mute the base', 0.8], ['mute the bass', 0.76]])).toBe('mute the bass');
  });

  it('matches whole multi-word vocabulary terms without substring matches', () => {
    expect(recognize([['mute electric guitar', 0.7], ['mute eclectic guitar', 0.7]])).toBe('mute electric guitar');
    expect(recognize([['mute eclectic guitar', 0.7], ['mute electric guitar', 0.7]])).toBe('mute electric guitar');
    expect(recognize([['the bassoon is loud', 0.7], ['the bass is loud', 0.7]])).toBe('the bassoon is loud');
  });

  it('respects a clear confidence advantage and does not change unrelated speech', () => {
    expect(recognize([['mute the base', 0.95], ['mute the bass', 0.6]])).toBe('mute the base');
    expect(recognize([['play outside', 0.8], ['play the drums', 0.79]])).toBe('play outside');
    expect(recognize([['the base is covered', 0.8], ['the bass is covered', 0.79]])).toBe('the base is covered');
  });

  it('does not change numbers and uses recognizer order when confidence is missing', () => {
    expect(recognize([['set tempo to 120', 0.7], ['set tempo to 130', 0.9]])).toBe('set tempo to 120');
    expect(recognize([['transpose bass by -2', 0.7], ['transpose bass by 2', 0.9]])).toBe('transpose bass by -2');
    expect(recognize([['hello world', 0], ['hello word', 0]])).toBe('hello world');
    expect(recognize([['mute the base', 0], ['mute the bass', 0]])).toBe('mute the bass');
  });

  it('keeps interim and non-English transcripts unchanged', () => {
    expect(recognize([['mute the base', 0.8], ['mute the bass', 0.79]], false)).toBe('mute the base');
    const other = new RecognitionService({ lang: 'fr-FR' });
    const otherRec = (other as unknown as { rec: MockRec }).rec;
    const spy = vi.fn();
    other.on('final', spy);
    const result = Object.assign([{ transcript: 'mute the base', confidence: 0.8 }, { transcript: 'mute the bass', confidence: 0.79 }], { isFinal: true });
    otherRec.onresult?.({ results: [result] } as unknown as SpeechRecognitionEvent);
    expect(spy).toHaveBeenCalledWith('mute the base');
  });

  it('corrects command-shaped misrecognitions using engine-valid terminology', () => {
    expect(recognize([['mute the high hat', 0.8]])).toBe('mute the hihat');
    expect(recognize([['quant eyes the hi-hat', 0.8]])).toBe('quantize the hihat');
    expect(recognize([['metro gnome on', 0.8]])).toBe('metronome on');
    expect(recognize([['cord progression C G Am F', 0.8]])).toBe('chord progression C G Am F');
  });

  it('does not correct ordinary speech, names, partials, or invalid commands', () => {
    expect(recognize([['I bought a high hat', 0.8]])).toBe('I bought a high hat');
    expect(recognize([['rename track one to high hat', 0.8]])).toBe('rename track one to high hat');
    expect(recognize([['mute the high hat shop', 0.8]])).toBe('mute the high hat shop');
    expect(recognize([['quant eyes everything', 0.8]])).toBe('quant eyes everything');
    expect(recognize([['metro gnome on', 0.8]], false)).toBe('metro gnome on');
  });
});
