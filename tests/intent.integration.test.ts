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
            "score": 1,
            "target": {
              "id": 0,
              "name": "Glue Compressor",
              "path": undefined,
              "type": "audioDevice",
            },
            "track": {
              "id": 1,
              "name": "track 2",
              "type": "track",
            },
            "transcript": "load glue compressor on track 2",
          },
          "id": "demo",
          "verb": "load",
        },
        "intent": {
          "score": 1,
          "slots": {
            "target": {
              "id": 0,
              "name": "Glue Compressor",
              "path": undefined,
              "type": "audioDevice",
            },
            "track": {
              "id": 1,
              "name": "track 2",
              "type": "track",
            },
          },
          "transcript": "load glue compressor on track 2",
          "verb": "load",
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
            "name": "vox",
            "score": 1,
            "target": {
              "id": 0,
              "name": "track 1",
              "type": "track",
            },
            "transcript": "rename track 1 to vox",
          },
          "id": "demo",
          "verb": "rename",
        },
        "intent": {
          "score": 1,
          "slots": {
            "name": "vox",
            "target": {
              "id": 0,
              "name": "track 1",
              "type": "track",
            },
          },
          "transcript": "rename track 1 to vox",
          "verb": "rename",
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
            "score": 1,
            "target": {
              "id": 0,
              "name": "Cutoff",
              "path": [
                {
                  "id": 1,
                  "type": "track",
                },
                {
                  "id": 0,
                  "type": "device",
                },
              ],
              "type": "parameter",
            },
            "track": undefined,
            "transcript": "increase cutoff to 1200 hz",
            "unit": "hz",
            "value": 1200,
          },
          "id": "demo",
          "verb": "increase",
        },
        "intent": {
          "score": 1,
          "slots": {
            "target": {
              "id": 0,
              "name": "Cutoff",
              "path": [
                {
                  "id": 1,
                  "type": "track",
                },
                {
                  "id": 0,
                  "type": "device",
                },
              ],
              "type": "parameter",
            },
            "track": undefined,
            "unit": "hz",
            "value": 1200,
          },
          "transcript": "increase cutoff to 1200 hz",
          "verb": "increase",
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
            "score": 1,
            "target": {
              "id": 2,
              "name": "clip slot 3",
              "type": "clipSlot",
            },
            "transcript": "launch clip slot 3",
          },
          "id": "demo",
          "verb": "launch",
        },
        "intent": {
          "score": 1,
          "slots": {
            "target": {
              "id": 2,
              "name": "clip slot 3",
              "type": "clipSlot",
            },
          },
          "transcript": "launch clip slot 3",
          "verb": "launch",
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
            "score": 1,
            "target": {
              "id": 1,
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
          "score": 1,
          "slots": {
            "target": {
              "id": 1,
              "name": "Bass",
              "path": undefined,
              "type": "track",
            },
          },
          "transcript": "mute bass",
          "verb": "mute",
        },
        "transcript": "mute bass",
      }
    `);
  });
});
