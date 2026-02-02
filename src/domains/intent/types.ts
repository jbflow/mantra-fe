export type IntentName =
  | "load"
  | "select"
  | "rename"
  | "delete"
  | "duplicate"
  | "mute"
  | "unmute"
  | "arm"
  | "unarm"
  | "solo"
  | "unsolo"
  | "increase"
  | "decrease"
  | "set"
  | "launch"
  | "move";

export type EntityType =
  | "track"
  | "scene"
  | "cuePoint"
  | "device"
  | "clip"
  | "clipSlot"
  | "parameter"
  | "mixer"
  | "instrument"
  | "audioDevice"
  | "midiDevice"
  | "browserClip"
  | "favorites";

export type Unit = "db" | "%" | "hz" | "ms";

export type Preposition =
  | "to"
  | "on"
  | "onto"
  | "into"
  | "from"
  | "at"
  | "in"
  | "for";

export type EntityPathItem = { type: EntityType; name: string };

export type EntityRef = {
  type: EntityType;
  name: string;
  path?: EntityPathItem[];
};

export type ValueSpec = {
  amount: number;
  unit?: Unit;
};

export type BaseIntent = {
  intent: IntentName;
  transcript: string;
  confidence: number;
};

export type SimpleTargetIntent = BaseIntent & {
  intent:
    | "select"
    | "delete"
    | "duplicate"
    | "mute"
    | "unmute"
    | "arm"
    | "unarm"
    | "solo"
    | "unsolo";
  target: EntityRef;
};

export type LoadIntent = BaseIntent & {
  intent: "load";
  target: EntityRef;
  destination?: EntityRef;
  source?: EntityRef;
  preposition?: Preposition;
};

export type RenameIntent = BaseIntent & {
  intent: "rename";
  target: EntityRef;
  name: string;
};

export type AdjustIntent = BaseIntent & {
  intent: "increase" | "decrease" | "set";
  target: EntityRef;
  value?: ValueSpec;
  scope?: EntityRef;
};

export type LaunchIntent = BaseIntent & {
  intent: "launch";
  target: EntityRef;
};

export type MoveIntent = BaseIntent & {
  intent: "move";
  target: EntityRef;
  source?: EntityRef;
  destination?: EntityRef;
  preposition?: Preposition;
};

export type IntentResult =
  | SimpleTargetIntent
  | LoadIntent
  | RenameIntent
  | AdjustIntent
  | LaunchIntent
  | MoveIntent;

export type LexiconConfig = Partial<Record<EntityType, string[]>> & {
  cuePoint?: string[];
};

export type LiveSetConfig = {
  track?: string[];
  scene?: string[];
  "cue point"?: string[];
  device?: string[][];
  clip?: string[][];
  parameter?: string[][][];
  instrument?: string[];
  audioDevice?: string[];
  midiDevice?: string[];
  browserClip?: string[];
  favorites?: string[];
  send?: string[];
  sel_track?: number;
  sel_device?: number;
  lexicon?: LexiconConfig;
};

export type DetectionInput = {
  transcript: string | string[];
  config: LiveSetConfig;
  macros?: string[];
};
