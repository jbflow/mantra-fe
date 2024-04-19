export const THRESHOLD = 85;
export const THRESH_WEIGHT = 0.1;

export const SYSEX_START = 240;
export const MANUFACTURER_ID = [0, 0, 0, 0, 0];


export const emptyConfig = {
  track: [],
  "return track": [],
  scene: [],
  "cue point": [],
  device: [],
  clip: [],
  parameter: [],
  instrument: [],
  audioDevice: [],
  midiDevice: [],
  browserClip: [],
  favorites: [],
  sel_track: 0,
  sel_device: 0,
};

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
  "return track": 4,
  scene: 5,
  "cue point": 6,
  device: 10,
  clip: 11,
  parameter: 22,
  instrument: 39,
  audioDevice: 40,
  midiDevice: 41,
  browserClip: 42,
  favorites: 43,
};

export const NOUN_MAP = {
  3: "track",
  4: "return track",
  5: "scene",
  6: "cue point",
  10: "device",
  11: "clip",
  22: "parameter",
  39: "instrument",
  40: "audioDevice",
  41: "midiDevice",
  42: "browserClip",
  43: "favorites",
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

export const STATUS_BYTES = {
  noteOn: 0x90,
  noteOff: 0x80,
  cc: 0xb0,
  pc: 0xc0,
  sysex_start: 0xf0,
  sysex_end: 0xf7

};

export const midiType = {
  cc: "CC",
  note: "NOTE",
  pc: "PC"
}

