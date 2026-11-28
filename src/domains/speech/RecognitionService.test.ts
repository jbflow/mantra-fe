import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  onspeechstart: ((event: Event) => void) | null = null;
  onspeechend: ((event: Event) => void) | null = null;
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
    vi.useFakeTimers();
    svc = new RecognitionService({ continuous: true });
    rec = (svc as unknown as { rec: MockRec }).rec;
    void svc.start();
  });

  afterEach(() => {
    svc.dispose();
    vi.useRealTimers();
  });

  function end(recognizer = rec) {
    recognizer.onend?.(new Event('end'));
  }

  function result(texts: Array<{ text: string; final: boolean }>, recognizer = rec) {
    recognizer.onresult?.({
      resultIndex: 0,
      results: texts.map(({ text, final }) => Object.assign([{ transcript: text, confidence: 0.8 }], { isFinal: final })),
    } as unknown as SpeechRecognitionEvent);
  }

  it('emits final transcript', () => {
    const spy = vi.fn();
    svc.on('final', spy);

    rec.onresult?.({
      results: [Object.assign([{ transcript: 'hello' }], { isFinal: true })],
    } as unknown as SpeechRecognitionEvent);
    vi.advanceTimersByTime(2500);
    end();

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('emits partial transcript', () => {
    const spy = vi.fn();
    svc.on('partial', spy);

    rec.onresult?.({
      results: [Object.assign([{ transcript: 'hel' }], { isFinal: false })],
    } as unknown as SpeechRecognitionEvent);

    expect(spy).toHaveBeenCalledWith('hel');
  });

  it('enables interim results for responsive transcripts', () => {
    expect(rec.interimResults).toBe(true);
    expect(rec.maxAlternatives).toBeGreaterThan(1);
  });

  function recognize(alternatives: Array<[string, number]>, isFinal = true) {
    const service = new RecognitionService();
    const recognizer = (service as unknown as { rec: MockRec }).rec;
    void service.start();
    const spy = vi.fn();
    service.on(isFinal ? 'final' : 'partial', spy);
    const result = Object.assign(
      alternatives.map(([transcript, confidence]) => ({ transcript, confidence })),
      { isFinal },
    );
    recognizer.onresult?.({ results: [result] } as unknown as SpeechRecognitionEvent);
    if (isFinal) {
      vi.advanceTimersByTime(2500);
      end(recognizer);
    }
    const text = spy.mock.calls[0][0];
    service.dispose();
    return text;
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

  it('uses non-protocol musical vocabulary to rank similar command alternatives', () => {
    expect(recognize([['add river to the track', 0.8], ['add reverb to the track', 0.77]])).toBe('add reverb to the track');
    expect(recognize([['add river to the midi track', 0.8], ['add reverb to the midi track', 0.79]])).toBe('add reverb to the midi track');
    expect(recognize([['adjust the lfo on the escalator', 0.8], ['adjust the lfo on the oscillator', 0.77]])).toBe('adjust the lfo on the oscillator');
    expect(recognize([['add river to the track', 0.95], ['add reverb to the track', 0.6]])).toBe('add river to the track');
    expect(recognize([['move the base', 0.8], ['move the bass', 0.79]])).toBe('move the base');
  });

  it('uses v0.3 parameter and parameter-series commands to rank alternatives', () => {
    expect(recognize([
      ['increase attack on base by 5 ms', 0.8],
      ['increase attack on bass by 5 ms', 0.79],
    ])).toBe('increase attack on bass by 5 ms');
    expect(recognize([
      ['map pitch from base to lead', 0.8],
      ['map pitch from bass to lead', 0.79],
    ])).toBe('map pitch from bass to lead');
  });

  it('normalizes contextual musical terms only in final English results', () => {
    expect(recognize([['add a saw tooth oscillator to the synth', 0.8]])).toBe('add a sawtooth oscillator to the synth');
    expect(recognize([['add a saw tooth oscillator to the synth', 0.8]], false)).toBe('add a saw tooth oscillator to the synth');
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
    void other.start();
    const result = Object.assign([{ transcript: 'mute the base', confidence: 0.8 }, { transcript: 'mute the bass', confidence: 0.79 }], { isFinal: true });
    otherRec.onresult?.({ results: [result] } as unknown as SpeechRecognitionEvent);
    vi.advanceTimersByTime(2500);
    end(otherRec);
    expect(spy).toHaveBeenCalledWith('mute the base');
    other.dispose();
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

  it('keeps revised interim and multiple final results together during long speech', () => {
    const partial = vi.fn();
    const final = vi.fn();
    svc.on('partial', partial);
    svc.on('final', final);
    rec.onspeechstart?.(new Event('speechstart'));
    result([{ text: 'set the tempo', final: true }, { text: 'and play', final: false }]);
    vi.advanceTimersByTime(10000);
    expect(rec.stop).not.toHaveBeenCalled();
    result([{ text: 'set the tempo', final: true }, { text: 'and play the drums', final: false }]);
    result([{ text: 'set the tempo', final: true }, { text: 'and play the drums', final: true }]);
    expect(partial).toHaveBeenLastCalledWith('set the tempo and play the drums');
    expect(final).not.toHaveBeenCalled();
    rec.onspeechend?.(new Event('speechend'));
    vi.advanceTimersByTime(2500);
    end();
    expect(final).toHaveBeenCalledExactlyOnceWith('set the tempo and play the drums');
  });

  it('finalizes promptly after speech ends', () => {
    const final = vi.fn();
    svc.on('final', final);
    rec.onspeechstart?.(new Event('speechstart'));
    result([{ text: 'mute bass and solo drums', final: true }]);
    rec.onspeechend?.(new Event('speechend'));
    vi.advanceTimersByTime(99);
    expect(rec.stop).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(rec.stop).toHaveBeenCalledOnce();
    end();
    expect(final).toHaveBeenCalledExactlyOnceWith('mute bass and solo drums');
  });

  it('resets the fallback while results arrive without speech events', () => {
    const final = vi.fn();
    svc.on('final', final);
    result([{ text: 'mute bass', final: false }]);
    vi.advanceTimersByTime(200);
    result([{ text: 'mute bass and', final: false }]);
    vi.advanceTimersByTime(200);
    result([{ text: 'mute bass and solo drums', final: true }]);
    expect(rec.stop).not.toHaveBeenCalled();
    vi.advanceTimersByTime(299);
    expect(rec.stop).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    end();
    expect(final).toHaveBeenCalledExactlyOnceWith('mute bass and solo drums');
  });

  it('allows pauses and resumes speaking before committing', () => {
    const final = vi.fn();
    svc.on('final', final);
    rec.onspeechstart?.(new Event('speechstart'));
    result([{ text: 'play the', final: false }]);
    rec.onspeechend?.(new Event('speechend'));
    vi.advanceTimersByTime(50);
    rec.onspeechstart?.(new Event('speechstart'));
    vi.advanceTimersByTime(5000);
    result([{ text: 'play the bass', final: true }]);
    expect(rec.stop).not.toHaveBeenCalled();
    rec.onspeechend?.(new Event('speechend'));
    vi.advanceTimersByTime(2500);
    end();
    expect(final).toHaveBeenCalledExactlyOnceWith('play the bass');
  });

  it('restarts unexpected endings and preserves interim and final text without duplicating snapshots', () => {
    const partial = vi.fn();
    const final = vi.fn();
    const status = vi.fn();
    svc.on('partial', partial);
    svc.on('final', final);
    result([{ text: 'turn on', final: false }]);
    end();
    vi.advanceTimersByTime(250);
    expect(rec.start).toHaveBeenCalledTimes(2);
    expect(status).not.toHaveBeenCalledWith({ state: 'ready' });
    rec.onspeechstart?.(new Event('speechstart'));
    result([{ text: 'the metronome', final: false }]);
    result([{ text: 'the metronome', final: true }, { text: 'and play', final: false }]);
    expect(partial).toHaveBeenLastCalledWith('turn on the metronome and play');
    end();
    vi.advanceTimersByTime(250);
    rec.onspeechstart?.(new Event('speechstart'));
    result([{ text: 'the drums', final: true }]);
    rec.onspeechend?.(new Event('speechend'));
    vi.advanceTimersByTime(2500);
    end();
    expect(final).toHaveBeenCalledExactlyOnceWith('turn on the metronome and play the drums');
  });

  it('preserves late final results on stop and does not restart', () => {
    const final = vi.fn();
    svc.on('final', final);
    result([{ text: 'play the', final: false }]);
    svc.stop();
    result([{ text: 'play the bass', final: true }]);
    end();
    vi.advanceTimersByTime(5000);
    expect(final).toHaveBeenCalledExactlyOnceWith('play the bass');
    expect(rec.start).toHaveBeenCalledOnce();
  });

  it('commits during a restart delay after genuine speech end', () => {
    const final = vi.fn();
    svc.on('final', final);
    result([{ text: 'play', final: false }]);
    rec.onspeechend?.(new Event('speechend'));
    end();
    vi.advanceTimersByTime(250);
    end();
    vi.advanceTimersByTime(500);
    end();
    vi.advanceTimersByTime(1000);
    end();
    vi.advanceTimersByTime(750);
    expect(final).toHaveBeenCalledExactlyOnceWith('play');
    vi.advanceTimersByTime(5000);
    expect(rec.start).toHaveBeenCalledOnce();
  });

  it('retries no-speech but stops on fatal errors and repeated disconnects', () => {
    const error = vi.fn();
    const status = vi.fn();
    svc.on('error', error);
    svc.on('status', status);
    rec.onerror?.({ error: 'no-speech' } as SpeechRecognitionErrorEvent);
    end();
    vi.advanceTimersByTime(250);
    expect(rec.start).toHaveBeenCalledTimes(2);
    rec.onerror?.({ error: 'not-allowed' } as SpeechRecognitionErrorEvent);
    end();
    vi.advanceTimersByTime(5000);
    expect(error).toHaveBeenCalledExactlyOnceWith(new Error('not-allowed'));
    expect(status).toHaveBeenLastCalledWith({ state: 'error' });
    expect(rec.start).toHaveBeenCalledTimes(2);
  });

  it('continues waiting through repeated no-speech timeouts with bounded backoff', () => {
    const error = vi.fn();
    svc.on('error', error);
    for (const delay of [250, 500, 1000, 2000, 2000, 2000, 2000]) {
      rec.onerror?.({ error: 'no-speech' } as SpeechRecognitionErrorEvent);
      end();
      vi.advanceTimersByTime(delay);
    }
    expect(rec.start).toHaveBeenCalledTimes(8);
    expect(error).not.toHaveBeenCalled();
  });

  it('commits preserved interim speech after a no-speech timeout', () => {
    const final = vi.fn();
    svc.on('final', final);
    result([{ text: 'play the bass', final: false }]);
    end();
    vi.advanceTimersByTime(250);
    rec.onerror?.({ error: 'no-speech' } as SpeechRecognitionErrorEvent);
    end();
    vi.advanceTimersByTime(500);
    vi.advanceTimersByTime(2000);
    expect(rec.stop).not.toHaveBeenCalled();
    expect(final).toHaveBeenCalledExactlyOnceWith('play the bass');
  });

  it('handles removed interim hypotheses and preserves intentional repeated words', () => {
    const partial = vi.fn();
    const final = vi.fn();
    svc.on('partial', partial);
    svc.on('final', final);
    rec.onspeechstart?.(new Event('speechstart'));
    result([{ text: 'go', final: true }, { text: 'away', final: false }]);
    result([{ text: 'go', final: true }]);
    expect(partial).toHaveBeenLastCalledWith('go');
    end();
    vi.advanceTimersByTime(250);
    rec.onspeechstart?.(new Event('speechstart'));
    result([{ text: 'go', final: true }]);
    rec.onspeechend?.(new Event('speechend'));
    vi.advanceTimersByTime(2500);
    end();
    expect(final).toHaveBeenCalledExactlyOnceWith('go go');
  });

  it('limits repeated disconnects and reports restart failures', async () => {
    const error = vi.fn();
    svc.on('error', error);
    for (const delay of [250, 500, 1000, 2000, 2000]) {
      end();
      vi.advanceTimersByTime(delay);
    }
    end();
    expect(error).toHaveBeenCalledExactlyOnceWith(new Error('Speech recognition repeatedly disconnected'));
    await svc.start();
    rec.start.mockImplementationOnce(() => { throw new Error('restart failed'); });
    end();
    vi.advanceTimersByTime(250);
    expect(error).toHaveBeenLastCalledWith(new Error('restart failed'));
  });

  it('cancels a pending restart on stop or dispose', () => {
    end();
    svc.stop();
    vi.advanceTimersByTime(5000);
    expect(rec.start).toHaveBeenCalledOnce();
    void svc.start();
    end();
    svc.dispose();
    vi.advanceTimersByTime(5000);
    expect(rec.start).toHaveBeenCalledTimes(2);
  });
});
