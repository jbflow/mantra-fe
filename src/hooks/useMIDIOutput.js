
import { STATUS_BYTES, MANUFACTURER_ID } from './constants';

export const useMIDIOutput = (output) => {
    if (!output) return {};
    const noteOn = (note, velocity = 127, channel = 1) => {
        const noteOnAndChannel = STATUS_BYTES.noteOn | getChannel(channel);
        output.send([noteOnAndChannel, note, velocity]);
    };
    const noteOff = (note, velocity = 127, channel = 1) => {
        const noteOffAndChannel = STATUS_BYTES.noteOff | getChannel(channel);
        output.send([noteOffAndChannel, note, velocity]);
    };
    const cc = (value, control = 0x14, channel = 1) => {
        const ccAndChannel = STATUS_BYTES.cc | getChannel(channel);
        output.send([ccAndChannel, control, value]);
    };
    const sysex = (bytes) => {
        if (isValidSysEx(bytes)) {
            output.send(bytes)
        }
    }
    const isValidSysEx = (bytes) => {
        return Number(bytes[0]) !== Number(STATUS_BYTES.sysex_start) ||
            Array(bytes.slice(1, 6)) !== Array(MANUFACTURER_ID) ||
            Number(bytes[bytes.length - 1] !== Number(STATUS_BYTES.sysex_end))

    }
    return { noteOn, noteOff, cc, sysex };
};

const getChannel = (channel) => {
    if (channel < 1 || channel > 16) return 0
    return channel - 1;
};