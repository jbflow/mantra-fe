import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AppController from "./AppController";

const speech = vi.hoisted(() => ({ final: undefined as ((text: string) => void) | undefined }));

vi.mock("@/domains/speech/RecognitionService", () => ({
  RecognitionService: class {
    on(event: string, handler: (text: string) => void) {
      if (event === "final") speech.final = handler;
    }
    off() {}
    initialize() { return Promise.resolve(); }
    stop() {}
    dispose() {}
  },
}));

vi.mock("@/domains/speech/WhisperRecognitionService", () => ({
  WhisperRecognitionService: class {},
}));

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static instances: MockWebSocket[] = [];
  readyState = 0;
  send = vi.fn();
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: ((event: { code: number; reason: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  private listeners: Record<string, Array<(event: { data?: string }) => void>> = {};

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: (event: { data?: string }) => void) {
    (this.listeners[type] ??= []).push(listener);
  }

  open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.();
    this.emit("open");
  }

  receive(message: object) {
    const data = JSON.stringify(message);
    this.onmessage?.({ data });
    this.emit("message", data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code: 1000, reason: "closed" });
    this.emit("close");
  }

  private emit(type: string, data?: string) {
    for (const listener of this.listeners[type] ?? []) listener({ data });
  }
}

describe("AppController MIP integration", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.stubGlobal("WebSocket", MockWebSocket);
    const stored = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => stored.get(key) ?? null,
      setItem: (key: string, value: string) => stored.set(key, value),
      removeItem: (key: string) => stored.delete(key),
    });
    MockWebSocket.instances = [];
    speech.final = undefined;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function mount() {
    await act(async () => root.render(createElement(AppController)));
  }

  async function say(text: string) {
    await act(async () => speech.final?.(text));
    const socket = MockWebSocket.instances.at(-1);
    if (socket?.readyState === 0) await act(async () => socket.open());
    return socket;
  }

  async function typeCommand(text: string) {
    const input = container.querySelector<HTMLInputElement>("#typed-command")!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => input.form!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    const socket = MockWebSocket.instances.at(-1);
    if (socket?.readyState === 0) await act(async () => socket.open());
    return socket;
  }

  it("passes ordered v0.3 intents through and displays execution details", async () => {
    await mount();
    const socket = await say("create midi bass track and add a reverb to drums");
    expect(socket?.url).toBe("ws://localhost:39031");
    expect(JSON.parse(socket!.send.mock.calls[0][0])).toEqual({
      type: "intent",
      source: "ui",
      payload: [
        { domain: "structure", intent: { action: "create_track", role: "bass", type: "midi" } },
        { domain: "structure", intent: { action: "load_device", target: { role: "drums" }, device: "reverb", kind: "effect" } },
      ],
    });
    await act(async () => {
      socket!.receive({ type: "ack", ids: ["one", "two"], status: "accepted" });
      socket!.receive({ type: "result", id: "one", status: "ok", details: { track_name: "Bass" } });
      socket!.receive({ type: "result", id: "two", status: "error", details: { message: "Device not found" } });
    });
    expect(container.textContent).toContain("Accepted 2 actions");
    expect(container.textContent).toContain('"track_name":"Bass"');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Device not found");
    await act(async () => socket!.receive({ type: "error", code: "BAD_REQUEST", message: "Missing payload" }));
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("BAD_REQUEST: Missing payload");
  });

  it("passes parameters and resolved pronouns through without rewriting them", async () => {
    await mount();
    const socket = await say("increase attack on Compressor on the bass track by 5 ms and mute bass then solo it");
    expect(JSON.parse(socket!.send.mock.calls[0][0]).payload).toEqual([
      { domain: "parameters", intent: { action: "increase", target: { role: "bass", device_name: "Compressor", parameter_name: "attack" }, amount: 5, unit: "ms" } },
      { domain: "structure", intent: { action: "mute", target: { role: "bass" } } },
      { domain: "structure", intent: { action: "solo", target: { role: "bass" } } },
    ]);
  });

  it("passes series values and track targets through without narrowing the intent", async () => {
    await mount();
    const socket = await typeCommand("set pitch series to 60, 62 on drums");
    expect(JSON.parse(socket!.send.mock.calls[0][0]).payload).toEqual([
      { domain: "pitch", intent: { action: "set_series", series: [60, 62], target: { role: "drums" } } },
    ]);
  });

  it("uses the same engine path for workflow text actions", async () => {
    window.localStorage.setItem("mantra-fe-workflows", JSON.stringify([{
      id: "workflow",
      trigger: "my command",
      enabled: true,
      actions: [{ id: "action", type: "text", text: "add a reverb onto the bass track" }],
    }]));
    await mount();
    const socket = await say("my command");
    expect(JSON.parse(socket!.send.mock.calls[0][0]).payload).toEqual([
      { domain: "structure", intent: { action: "load_device", target: { role: "bass" }, device: "reverb", kind: "effect" } },
    ]);
  });

  it("requests a missing track role and never sends partially valid commands", async () => {
    await mount();
    const socket = await say("create a MIDI track and play");
    expect(socket!.send).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Which track role?");
    await say("mute bass and move it below drums");
    expect(socket!.send).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Unrecognized intent");
  });

  it("reports socket send failures", async () => {
    await mount();
    const socket = await say("play");
    socket!.send.mockImplementationOnce(() => { throw new Error("Send failed"); });
    await say("stop");
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Send failed");
  });

  it("reconnects through DawSocket when the user selects Reconnect", async () => {
    await mount();
    await say("play");
    const reconnect = container.querySelector<HTMLButtonElement>(".endpoint-control button")!;

    await act(async () => reconnect.click());

    const nextSocket = MockWebSocket.instances.at(-1)!;
    expect(MockWebSocket.instances).toHaveLength(2);
    await act(async () => nextSocket.open());
    expect(container.querySelector(".topbar-status")?.textContent).toContain("connected");
  });

  it("preserves a saved endpoint", async () => {
    window.localStorage.setItem("mantra-fe-preferences", JSON.stringify({ engineUrl: "ws://localhost:4321" }));
    await mount();
    const socket = await say("play");
    expect(socket?.url).toBe("ws://localhost:4321");
  });
});
