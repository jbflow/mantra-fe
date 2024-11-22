import { emptyConfig } from "./MidiConstants";
import { confirmationPhrases } from "../utils/speechConstants";

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

export const convertBytes = (byteArray) => {
  if (byteArray.length === 2) {
    // Convert 2-byte MSB LSB to a single integer
    return (byteArray[0] & 0x7F) | ((byteArray[1] & 0x7F) << 7);
  } else if (byteArray.length === 3) {
    // Convert 3-byte MSB LSB to a single integer
    return (byteArray[0] & 0x7F) | ((byteArray[1] & 0x7F) << 7) | ((byteArray[2] & 0x7F) << 14);
  } else if (byteArray.length === 4) {
    // Convert 4-byte MSB LSB to a single integer
    return (
      (byteArray[0] & 0x7F) |
      ((byteArray[1] & 0x7F) << 7) |
      ((byteArray[2] & 0x7F) << 14) |
      ((byteArray[3] & 0x7F) << 21)
    );
  } else {
    throw new Error('Invalid byte array length');
  }
};


  
export const getRandomResponse = () => {
  const randomIndex = Math.floor(Math.random() * confirmationPhrases.length);
  return confirmationPhrases[randomIndex];
}


