import { describe, expect, it } from "vitest";
import { IntentEngine, intentToCommand } from "@/domains/intent";
import type { LiveSetConfig } from "@/domains/intent";

const demoConfig: LiveSetConfig = {
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

describe("IntentEngine", () => {
  it("works with simplified lexicon config", () => {
    const engine = new IntentEngine();
    const result = engine.detect({
      transcript: "load glue compressor on track 1",
      config: {
        lexicon: {
          track: ["Drums"],
          audioDevice: ["Glue Compressor"],
          device: ["EQ Eight"],
          parameter: ["Gain"],
        },
      },
    });

    expect(result?.intent).toBe("load");
    if (!result || result.intent !== "load") throw new Error("Expected load intent");
    expect(result.destination?.name).toBe("Drums");
    expect(result.target.type).toBe("audioDevice");
  });

  it("detects load device on track", () => {
    const engine = new IntentEngine();
    const result = engine.detect({
      transcript: "load glue compressor on track 2",
      config: demoConfig,
    });

    expect(result?.intent).toBe("load");
    if (!result || result.intent !== "load") throw new Error("Expected load intent");
    expect(result.destination?.type).toBe("track");
    expect(result.destination?.name).toBe("Bass");
    expect(result.target.type).toBe("audioDevice");
  });

  it("detects increase parameter with value", () => {
    const engine = new IntentEngine();
    const result = engine.detect({
      transcript: "increase cutoff to 1200 hz",
      config: demoConfig,
    });

    expect(result?.intent).toBe("increase");
    if (!result || result.intent !== "increase") throw new Error("Expected increase intent");
    expect(result.target.type).toBe("parameter");
    expect(result.value?.amount).toBe(1200);
    expect(result.value?.unit).toBe("hz");
  });

  it("detects rename with new name", () => {
    const engine = new IntentEngine();
    const result = engine.detect({
      transcript: "rename track 1 to vocals",
      config: demoConfig,
    });

    expect(result?.intent).toBe("rename");
    if (!result || result.intent !== "rename") throw new Error("Expected rename intent");
    expect(result.target.type).toBe("track");
    expect(result.target.name).toBe("Drums");
    expect(result.name).toBe("vocals");
  });

  it("chooses best alternative transcript", () => {
    const engine = new IntentEngine();
    const result = engine.detect({
      transcript: ["load glue compress on track 2", "load glue compressor on track 2"],
      config: demoConfig,
    });

    expect(result?.intent).toBe("load");
    if (!result || result.intent !== "load") throw new Error("Expected load intent");
    expect(result.target.type).toBe("audioDevice");
  });

  it("emits a JSON command payload", () => {
    const engine = new IntentEngine();
    const result = engine.detect({
      transcript: "rename track 1 to vox",
      config: demoConfig,
    });

    expect(result).not.toBeNull();
    const cmd = intentToCommand(result!, { id: "test" });

    expect(cmd).toMatchObject({
      id: "test",
      verb: "rename",
      args: {
        name: "vox",
      },
    });
  });
});
