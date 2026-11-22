import { describe, expect, it } from "vitest";
import {
  createWorkflow,
  createWorkflowAction,
  moveWorkflowAction,
  parseWorkflows,
  type Workflow
} from "../src/domains/workflows";

describe("workflow model", () => {
  it("loads a starter workflow when storage is empty or invalid", () => {
    expect(parseWorkflows(null)).toHaveLength(1);
    expect(parseWorkflows("not json")).toHaveLength(1);
  });

  it("round-trips persisted voice and MIDI actions", () => {
    const workflow: Workflow = {
      id: "workflow-1",
      trigger: "start the chorus",
      enabled: true,
      actions: [
        { id: "action-1", type: "text", text: "play" },
        {
          id: "action-2",
          type: "midi",
          port: "Ableton",
          message: "note_on",
          channel: 1,
          data: 60,
          value: 100
        }
      ]
    };

    expect(parseWorkflows(JSON.stringify([workflow]))).toEqual([workflow]);
  });

  it("creates typed actions and new workflows", () => {
    expect(createWorkflow("Play drums")).toMatchObject({
      trigger: "Play drums",
      enabled: true,
      actions: []
    });
    expect(createWorkflowAction("text")).toMatchObject({ type: "text", text: "" });
    expect(createWorkflowAction("midi")).toMatchObject({
      type: "midi",
      message: "note_on",
      channel: 1,
      data: 60,
      value: 100
    });
  });

  it("reorders actions without mutating the original", () => {
    const actions = [
      { id: "one", type: "text" as const, text: "play" },
      { id: "two", type: "text" as const, text: "stop" }
    ];

    expect(moveWorkflowAction(actions, 1, -1).map((action) => action.id)).toEqual(["two", "one"]);
    expect(actions.map((action) => action.id)).toEqual(["one", "two"]);
  });
});