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
