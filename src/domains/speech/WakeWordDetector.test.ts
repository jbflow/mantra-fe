import { describe, it, expect, vi } from 'vitest';
import { WakeWordDetector } from './WakeWordDetector';

describe('WakeWordDetector', () => {
  it('emits wake event', () => {
    const det = new WakeWordDetector();
    const spy = vi.fn();
    det.on('wake', spy);
    det.trigger();
    expect(spy).toHaveBeenCalled();
  });
});
