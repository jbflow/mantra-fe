import { describe, it, expect, vi } from 'vitest';
import { WakeWordDetector } from './WakeWordDetector';

describe('WakeWordDetector', () => {
  it('emits wake event with hotword name', () => {
    const det = new WakeWordDetector();
    const spy = vi.fn();
    det.on('wake', spy);
    det.trigger('bumblebee');
    expect(spy).toHaveBeenCalledWith('bumblebee');
  });

  it('defaults to bumblebee hotword', () => {
    const det = new WakeWordDetector();
    const spy = vi.fn();
    det.on('wake', spy);
    det.trigger();
    expect(spy).toHaveBeenCalledWith('bumblebee');
  });

  it('allows setting different hotword', () => {
    const det = new WakeWordDetector({ hotword: 'jarvis' });
    const spy = vi.fn();
    det.on('wake', spy);
    det.trigger('jarvis');
    expect(spy).toHaveBeenCalledWith('jarvis');
  });

  it('throws on invalid hotword', () => {
    const det = new WakeWordDetector();
    expect(() => det.setHotword('invalid')).toThrow();
  });
});
