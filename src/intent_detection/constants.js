const THRESHOLD = 85;
const THRESH_WEIGHT = 0.1;

const SYSEX_START = 240;
const MANUFACTURER_ID = [0, 0, 0, 0, 0];
const SYSEX_END = 247;

const VERBS = {
  name: 1,
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
  remove: 4,
  scrap: 4,
  'get rid of': 4,
  bin: 4,
  duplicate: 5,
  repeat: 5,
  arm: 6,
  'record enable': 6,
  'enable record': 6,
  unarm: 7,
  'un arm': 7,
  'record disable': 7,
  'disable record': 7,
  'disable recording': 7,
  solo: 8,
  'un solo': 8,
  unsolo: 9,
  mute: 10,
  unmute: 11,
  'un mute': 11,
  increase: 12,
  decrease: 13,
  reduce: 13,
  set: 14,
  move: 15,
  undo: 17,
  redo: 18,
  play: 19,
  stop: 20,
  record: 21,
  loop: 22,
};

const NOUNS = {
  global: 0,
  transport: 1,
  track: 3,
  'return track': 4,
  scene: 5,
  'cue point': 6,
  device: 10,
  mixer: 10,
  clip: 11,
  parameter: 22,
  instrument: 39,
  audio_device: 40,
  midi_device: 41,
};

const NOUN_MAP = {
  3: 'track',
  4: 'return track',
  5: 'scene',
  6: 'cue point',
  10: 'device',
  11: 'clip',
  22: 'parameter',
  39: 'instrument',
  40: 'audio_device',
  41: 'midi_device',
};

const SUB_NOUN_BYTES = {
  3: Object.values(NOUNS).filter(x => ['device', 'clip', 'instrument', 'audio_device', 'midi_device'].includes(x)),
  10: Object.values(NOUNS).filter(x => ['parameter'].includes(x)),
};

const THRESH = {
  mixer: 90,
  track: 85,
  scene: 85,
  'cue point': 85,
  device: 90,
  clip: 95,
  parameter: 100,
  instrument: 100,
  audio_device: 100,
  midi_device: 100,
};

const UNITS = {
  db: 1,
  DB: 1,
  hz: 2,
  ms: 3,
  '%': 4,
};

const CUES = ['by', 'to'];

const EXCLUDED = ['%'];

const SINGLE_WORD = {
  play: [SYSEX_START, ...MANUFACTURER_ID, 0x1, 1, NOUNS.transport, 0, 0, VERBS.play, 0, 0, 0, SYSEX_END],
  stop: [SYSEX_START, ...MANUFACTURER_ID, 0x1, 1, NOUNS.transport, 0, 0, VERBS.stop, 0, 0, 0, SYSEX_END],
  record: [SYSEX_START, ...MANUFACTURER_ID, 0x1, 1, NOUNS.transport, 0, 0, VERBS.record, 0, 0, 0, SYSEX_END],
  loop: [SYSEX_START, ...MANUFACTURER_ID, 0x1, 1, NOUNS.transport, 0, 0, VERBS.loop, 0, 0, 0, SYSEX_END],
  undo: [SYSEX_START, ...MANUFACTURER_ID, 0x1, 1, NOUNS.global, 0, 0, VERBS.undo, 0, 0, 0, SYSEX_END],
  redo: [SYSEX_START, ...MANUFACTURER_ID, 0x1, 1, NOUNS.global, 0, 0, VERBS.redo, 0, 0, 0, SYSEX_END],
};

export {
  THRESHOLD,
  THRESH_WEIGHT,
  SYSEX_START,
  MANUFACTURER_ID,
  SYSEX_END,
  VERBS,
  NOUNS,
  NOUN_MAP,
  SUB_NOUN_BYTES,
  THRESH,
  UNITS,
  CUES,
  EXCLUDED,
  SINGLE_WORD,
};