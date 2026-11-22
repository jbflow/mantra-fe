declare interface MIDIMessageEvent extends Event {
  readonly data: Uint8Array;
}

declare interface MIDIPort extends EventTarget {
  id: string;
  manufacturer?: string;
  name?: string;
  type: 'input' | 'output';
  connection: 'open' | 'closed' | 'pending';
  open(): Promise<MIDIPort>;
  close(): Promise<MIDIPort>;
}

declare interface MIDIInput extends MIDIPort {
  onmidimessage: ((e: MIDIMessageEvent) => void) | null;
}

declare interface MIDIOutput extends MIDIPort {
  send(data: number[] | Uint8Array, timestamp?: number): void;
}

declare interface MIDIAccess extends EventTarget {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
  onstatechange: ((e: Event) => void) | null;
}

declare interface Navigator {
  /** Web MIDI entry‑point */
  requestMIDIAccess(options?: { sysex: boolean }): Promise<MIDIAccess>;
}
