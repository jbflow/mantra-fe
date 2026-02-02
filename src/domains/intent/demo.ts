import { IntentEngine } from "./IntentEngine";
import { intentToCommand } from "./intentToCommand";
import type { LiveSetConfig } from "./types";

const config: LiveSetConfig = {
  track: ["Drums", "Bass", "Lead", "Vox"],
  scene: ["Intro", "Chorus", "Bridge"],
  "cue point": ["Start"],
  device: [["EQ Eight", "Compressor"], ["Auto Filter"], ["Reverb"], ["Saturator"]],
  clip: [["Intro", "Fill"], ["Verse"], ["Hook"], ["Vox"]],
  parameter: [
    [["Gain", "Frequency"], ["Threshold"]],
    [["Cutoff"]],
    [["Dry/Wet"]],
    [["Drive"]],
  ],
  instrument: ["Operator"],
  audioDevice: ["Glue Compressor"],
  midiDevice: ["Arpeggiator"],
  browserClip: ["808 Loop"],
  favorites: ["Favorite Rack"],
  send: ["Send A", "Send B"],
  sel_track: 0,
  sel_device: 0,
};

const lexiconOnly: LiveSetConfig = {
  lexicon: {
    track: ["Drums"],
    audioDevice: ["Glue Compressor"],
    device: ["EQ Eight"],
    parameter: ["Gain"],
    clip: ["Intro"],
  },
};

const scenarios: Array<{ label: string; transcript: string; cfg?: LiveSetConfig }> = [
  { label: "Load device", transcript: "load glue compressor on track 2" },
  { label: "Rename track", transcript: "rename track 1 to vox" },
  { label: "Increase parameter", transcript: "increase cutoff to 1200 hz" },
  { label: "Launch clip slot", transcript: "launch clip slot 3" },
  { label: "Mute by name", transcript: "mute bass" },
  { label: "Select device", transcript: "select eq eight" },
  { label: "Lexicon only", transcript: "set gain to 5 db", cfg: lexiconOnly },
];

const engine = new IntentEngine();

for (const scenario of scenarios) {
  const cfg = scenario.cfg ?? config;
  const intent = engine.detect({ transcript: scenario.transcript, config: cfg });
  const cmd = intent ? intentToCommand(intent, { includeMeta: true }) : null;

  console.log("\n===", scenario.label, "===");
  console.log(JSON.stringify({ input: scenario.transcript, intent, cmd }, null, 2));
}
