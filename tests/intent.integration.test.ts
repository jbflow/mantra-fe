import { describe, expect, it } from "vitest";
import { IntentEngine, intentToCommand } from "@/domains/intent";
import type { LiveSetConfig } from "@/domains/intent";

const config: LiveSetConfig = {
  track: ["Drums", "Bass", "Lead"],
  scene: ["Intro", "Chorus"],
  "cue point": ["Start"],
  device: [["EQ Eight", "Compressor"], ["Auto Filter"], ["Reverb"]],
  clip: [["Intro", "Fill"], ["Verse"], ["Hook"]],
  parameter: [
    [["Gain", "Frequency"], ["Threshold"]],
    [["Cutoff"]],
    [["Dry/Wet"]],
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

describe("intent integration", () => {
  it("shows input and output for a load command", () => {
    const engine = new IntentEngine();
    const transcript = "load glue compressor on track 2";

    const intent = engine.detect({ transcript, config });
    expect(intent).not.toBeNull();

    const cmd = intentToCommand(intent!, { id: "demo" });

    expect({ transcript, intent, cmd }).toMatchInlineSnapshot(`
      {
        "cmd": {
          "args": {
            "confidence": 0.7,
            "destination": {
              "name": "Bass",
              "type": "track",
            },
            "preposition": "on",
            "source": undefined,
            "target": {
              "name": "Glue Compressor",
              "path": undefined,
              "type": "audioDevice",
            },
            "transcript": "load glue compressor on track 2",
          },
          "id": "demo",
          "verb": "load",
        },
        "intent": {
          "confidence": 0.7,
          "destination": {
            "name": "Bass",
            "type": "track",
          },
          "intent": "load",
          "preposition": "on",
          "source": undefined,
          "target": {
            "name": "Glue Compressor",
            "path": undefined,
            "type": "audioDevice",
          },
          "transcript": "load glue compressor on track 2",
        },
        "transcript": "load glue compressor on track 2",
      }
    `);
  });

  it("shows input and output for a rename command", () => {
    const engine = new IntentEngine();
    const transcript = "rename track 1 to vox";

    const intent = engine.detect({ transcript, config });
    expect(intent).not.toBeNull();

    const cmd = intentToCommand(intent!, { id: "demo" });

    expect({ transcript, intent, cmd }).toMatchInlineSnapshot(`
      {
        "cmd": {
          "args": {
            "confidence": 0.75,
            "name": "vox",
            "target": {
              "name": "Drums",
              "type": "track",
            },
            "transcript": "rename track 1 to vox",
          },
          "id": "demo",
          "verb": "rename",
        },
        "intent": {
          "confidence": 0.75,
          "intent": "rename",
          "name": "vox",
          "target": {
            "name": "Drums",
            "type": "track",
          },
          "transcript": "rename track 1 to vox",
        },
        "transcript": "rename track 1 to vox",
      }
    `);
  });

  it("shows input and output for a parameter change", () => {
    const engine = new IntentEngine();
    const transcript = "increase cutoff to 1200 hz";

    const intent = engine.detect({ transcript, config });
    expect(intent).not.toBeNull();

    const cmd = intentToCommand(intent!, { id: "demo" });

    expect({ transcript, intent, cmd }).toMatchInlineSnapshot(`
      {
        "cmd": {
          "args": {
            "confidence": 0.75,
            "scope": undefined,
            "target": {
              "name": "Cutoff",
              "path": [
                {
                  "name": "Bass",
                  "type": "track",
                },
                {
                  "name": "Auto Filter",
                  "type": "device",
                },
              ],
              "type": "parameter",
            },
            "transcript": "increase cutoff to 1200 hz",
            "value": {
              "amount": 1200,
              "unit": "hz",
            },
          },
          "id": "demo",
          "verb": "increase",
        },
        "intent": {
          "confidence": 0.75,
          "intent": "increase",
          "scope": undefined,
          "target": {
            "name": "Cutoff",
            "path": [
              {
                "name": "Bass",
                "type": "track",
              },
              {
                "name": "Auto Filter",
                "type": "device",
              },
            ],
            "type": "parameter",
          },
          "transcript": "increase cutoff to 1200 hz",
          "value": {
            "amount": 1200,
            "unit": "hz",
          },
        },
        "transcript": "increase cutoff to 1200 hz",
      }
    `);
  });

  it("shows input and output for launch and mute", () => {
    const engine = new IntentEngine();
    const transcript = "launch clip slot 3";

    const intent = engine.detect({ transcript, config });
    expect(intent).not.toBeNull();

    const cmd = intentToCommand(intent!, { id: "demo" });

    expect({ transcript, intent, cmd }).toMatchInlineSnapshot(`
      {
        "cmd": {
          "args": {
            "confidence": 0.8,
            "target": {
              "name": "clip slot 3",
              "type": "clipSlot",
            },
            "transcript": "launch clip slot 3",
          },
          "id": "demo",
          "verb": "launch",
        },
        "intent": {
          "confidence": 0.8,
          "intent": "launch",
          "target": {
            "name": "clip slot 3",
            "type": "clipSlot",
          },
          "transcript": "launch clip slot 3",
        },
        "transcript": "launch clip slot 3",
      }
    `);

    const transcript2 = "mute bass";
    const intent2 = engine.detect({ transcript: transcript2, config });
    expect(intent2).not.toBeNull();
    const cmd2 = intentToCommand(intent2!, { id: "demo" });

    expect({ transcript: transcript2, intent: intent2, cmd: cmd2 }).toMatchInlineSnapshot(`
      {
        "cmd": {
          "args": {
            "confidence": 0.6,
            "target": {
              "name": "Bass",
              "path": undefined,
              "type": "track",
            },
            "transcript": "mute bass",
          },
          "id": "demo",
          "verb": "mute",
        },
        "intent": {
          "confidence": 0.6,
          "intent": "mute",
          "target": {
            "name": "Bass",
            "path": undefined,
            "type": "track",
          },
          "transcript": "mute bass",
        },
        "transcript": "mute bass",
      }
    `);
  });
});
