import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MidiRouter } from './MidiRouter';

/* ---------- Mock Web‑MIDI helpers ---------- */
class MockPort {
  id = this.name;                                 // MIDIPort requires id
  onmidimessage: ((e: MIDIMessageEvent) => void) | null = null;
  send = vi.fn();
  /* EventTarget no‑ops */
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  dispatchEvent = vi.fn().mockReturnValue(false);
  constructor(public name: string, public type: 'input' | 'output') {}
}

/**
 * Creates a fully‑typed MIDIAccess mock
 * so TS sees .inputs and .outputs during construction.
 */
function makeAccess(): MIDIAccess {
  const inputs  = new Map<string, MIDIInput>();
  const outputs = new Map<string, MIDIOutput>();

  inputs.set('IN',  new MockPort('IN',  'input')  as unknown as MIDIInput);
  outputs.set('OUT', new MockPort('OUT', 'output') as unknown as MIDIOutput);

  return {
    inputs,
    outputs,
    onstatechange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(false),
  } as unknown as MIDIAccess;
}


const requestMIDIAccessMock = vi.fn();
vi.stubGlobal('navigator', { requestMIDIAccess: requestMIDIAccessMock });

describe('MidiRouter', () => {
  let midi: MidiRouter;
  let access: MIDIAccess;

  beforeEach(async () => {
    access = makeAccess();
    requestMIDIAccessMock.mockResolvedValueOnce(access);

    midi = new MidiRouter();
    await midi.init();
  });

  it('lists ports', () => {
    const { inputs, outputs } = midi.listPorts();
    expect(inputs).toEqual(['IN']);
    expect(outputs).toEqual(['OUT']);
  });

  it('receives messages', () => {
    const spy = vi.fn();
    midi.on('message', spy);

    midi.connectInput('IN');
    const port = access.inputs.get('IN')!;
    port.onmidimessage!({ data: new Uint8Array([144, 60, 100]) } as unknown as MIDIMessageEvent);

    expect(spy).toHaveBeenCalledWith({
      port: 'IN',
      data: new Uint8Array([144, 60, 100]),
    });
  });

  it('sends bytes', () => {
    midi.connectOutput('OUT');
    midi.send([176, 1, 127]);

    const port = access.outputs.get('OUT')!;
    expect(port.send).toHaveBeenCalledWith([176, 1, 127]);
  });
});
