import { emptyConfig } from "./MidiConstants";
export const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const isEmpty = (obj) => {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return JSON.stringify(obj) === JSON.stringify({});
};

export const clearConfig = () => {
  for (let key in emptyConfig) {
    if (emptyConfig[key] === "sel_track" || emptyConfig[key] === "sel_device") {
      emptyConfig[key] = null;
    } else {
      emptyConfig[key] = [];
    }
  }
  return emptyConfig;
};


const midiNoteToName = (dataByte) => {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const octave = Math.floor(dataByte / 12) - 1;
  const noteIndex = dataByte % 12;
  return noteNames[noteIndex] + octave;
}

// Function to convert MIDI channel number to channel name
const midiChannelToName = (statusByte) => {
  return statusByte & 0x0F;
}

// Function to convert MIDI data to note and channel names
export const midiDataToNames = ([statusByte, dataByte]) => {
  const note = midiNoteToName(dataByte);
  const channel = midiChannelToName(statusByte);
  return `Note: ${note} Ch: ${channel}`
    
  
}

