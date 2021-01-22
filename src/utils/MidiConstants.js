export const THRESHOLD = 85;
export const THRESH_WEIGHT = 0.1;

export const SYSEX_START = 240;
export const MANUFACTURER_ID = [0, 0, 0, 0, 0];
export const SYSEX_END = 247;

export const VERBS = {
  rename: 1,
  load: 2,
  create: 2,
  make: 2,
  add: 2,
  insert: 2,
  instantiate: 2,
  select: 3,
  grab: 3,
  delete: 4,
  duplicate: 5,
  arm: 6,
  unarm: 7,
  solo: 8,
  unsolo: 9,
  mute: 10,
  unmute: 11,
  increase: 12,
  decrease: 13,
  set: 14,
  move: 15,
};

export const NOUNS = {
  transport: 1,
  track: 3,
  scene: 5,
  device: 10,
  clip: 11,
  parameter: 22,
  instrument: 39,
  audio_device: 40,
  midi_device: 41,
};

export const NOUN_MAP = {
  3: "tracks",
  5: "scenes",
  10: "devices",
  11: "clips",
  22: "parameters",
  39: "instruments",
  40: "audio_devices",
  41: "midi_devices",
};



export const SUB_NOUNS = {
  3: [10, 11, 22],
  10: [22],
};

export const UNITS = {
  db: 1,
  hz: 2,
  ms: 3,
  "%": 4,
};

export const CUES = ["by", "to"];

export const EXCLUDED = ["%"];

export const MIXER_PARAMS = {
  volume: 125,
  pan: 126,
  send: 127,
};
