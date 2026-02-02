import { TinyEmitter } from '@/domains/shared/TinyEmitter';

type MidiEvents = {
  connected: { port: string };
  disconnected: { port: string };
  message: { port: string; data: Uint8Array };
  error: Error;
};

/** Thin wrapper around the Web MIDI API */
export class MidiRouter {
  private access?: MIDIAccess;
  private emitter = new TinyEmitter<MidiEvents>();
  private input?: MIDIInput;
  private output?: MIDIOutput;

  /* ---------------- observers ---------------- */
  on  = this.emitter.on;
  off = this.emitter.off;

  /* ---------------- lifecycle ---------------- */
  async init(opts: { sysex?: boolean } = {}) {
    try {
      this.access = await navigator.requestMIDIAccess({ sysex: !!opts.sysex });
    } catch (err) {
      this.emit('error', err as Error);
      throw err;
    }
  }

  listPorts() {
    if (!this.access) throw new Error('MidiRouter.init() not called');
    const ins = [...this.access.inputs.values()].map(p => p.name ?? p.id);
    const outs = [...this.access.outputs.values()].map(p => p.name ?? p.id);
    return { inputs: ins, outputs: outs };
  }

  connectInput(name: string) {
    const port = this.findPort('input', name) as MIDIInput;
    this.detachInput();
    port.onmidimessage = (e: MIDIMessageEvent) =>
      this.emit('message', { port: name, data: e.data as Uint8Array });
    this.input = port;
    this.emit('connected', { port: name });
  }

  connectOutput(name: string) {
    this.output = this.findPort('output', name) as MIDIOutput;
  }

  send(data: Uint8Array | number[]) {
    if (!this.output) throw new Error('No MIDI output selected');
    this.output.send(data);
  }

  detachInput() {
    if (this.input) {
      this.input.onmidimessage = null;
      this.emit('disconnected', { port: this.input.name ?? this.input.id });
      this.input = undefined;
    }
  }

  /* ---------------- helpers ---------------- */
  private findPort(type: 'input' | 'output', name: string): MIDIPort {
    if (!this.access) throw new Error('init() first');
    const map = type === 'input' ? this.access.inputs : this.access.outputs;
    const port = [...map.values()].find(p => p.name === name);
    if (!port) throw new Error(`MIDI ${type} "${name}" not found`);
    return port;
  }

  private emit = this.emitter.emit;
}
