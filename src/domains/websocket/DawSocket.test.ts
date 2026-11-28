import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DawSocket } from "./DawSocket";

/* -------------------------------------------------- *
 * Mock browser WebSocket
 * -------------------------------------------------- */

type MockWebSocketEventData = Record<string, unknown>;

/**
 * A test mock implementation of the native WebSocket class,
 * allowing manual triggering of events and inspection.
 */
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static OPEN = 1;
  static CLOSED = 3;

  readyState = 0;
  onopen: () => void = () => {};
  onmessage: (e: { data: string }) => void = () => {};
  onclose: (e: { code: number; reason: string }) => void = () => {};
  onerror: () => void = () => {};

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send = vi.fn();
  close = vi.fn(() => this.$close());

  /** Simulate opening the socket. */
  $open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen();
  }

  /** Simulate receiving a message. */
  $msg(o: MockWebSocketEventData) {
    this.onmessage({ data: JSON.stringify(o) });
  }

  /** Simulate socket closing. */
  $close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose({ code: 1000, reason: "bye" });
  }
}

globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

/* -------------------------------------------------- *
 * Tests
 * -------------------------------------------------- */

describe("DawSocket (minimal)", () => {
  let socket: DawSocket;
  let wsMock: MockWebSocket;

  beforeEach(() => {
    MockWebSocket.instances.length = 0;
    socket = new DawSocket("ws://127.0.0.1");
    void socket.connect().catch(() => undefined);
    wsMock = MockWebSocket.instances[0]!;
  });

  afterEach(() => {
    socket.disconnect();
    vi.useRealTimers();
  });

  it("emits connected event", async () => {
    await new Promise<void>((resolve) => {
      socket.on("connected", resolve);
      wsMock.$open();
    });
  });

  it("emits message event with parsed JSON", async () => {
    await new Promise<void>((resolve) => {
      socket.on("message", (msg) => {
        expect(msg).toEqual({ type: "ack", ids: ["one"], status: "accepted" });
        resolve();
      });
      wsMock.$open();
      wsMock.$msg({ type: "ack", ids: ["one"], status: "accepted" });
    });
  });

  it("resolves connect when the WebSocket opens and sends protocol JSON", async () => {
    const connected = socket.connect();
    wsMock.$open();
    await connected;
    socket.send({ type: "intent", payload: { domain: "transport", intent: { action: "play" } } });
    expect(wsMock.send).toHaveBeenCalledWith(JSON.stringify({
      type: "intent",
      payload: { domain: "transport", intent: { action: "play" } },
    }));
  });

  it("throws when sending before the socket opens", () => {
    expect(() => socket.send({ type: "ping" })).toThrow(/WebSocket not open/);
  });

  it("rotatePortAndRetry() advances port and reconnects", async () => {
    vi.useFakeTimers();
    const firstUrl = wsMock.url;

    wsMock.$close(); // triggers rotate+retry
    vi.advanceTimersByTime(10_000); // fast-forward the retry timer

    const newWs = MockWebSocket.instances[1];
    expect(newWs).toBeDefined();
    expect(newWs.url).not.toBe(firstUrl);
    newWs!.$open();
  });
});
