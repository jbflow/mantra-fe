import { describe, it, expect, vi, beforeEach } from "vitest";
import { DawSocket } from "./DawSocket";

/* -------------------------------------------------- *
 * Mock browser WebSocket
 * -------------------------------------------------- */

/**
 * A test mock implementation of the native WebSocket class,
 * allowing manual triggering of events and inspection.
 */
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  static OPEN = 1;

  readyState = 0;
  onopen: () => void = () => {};
  onmessage: (e: { data: string }) => void = () => {};
  onclose: (e: { code: number; reason: string }) => void = () => {};
  onerror: () => void = () => {};

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  send = vi.fn();

  /** Simulate opening the socket. */
  $open() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen();
  }

  /** Simulate receiving a message. */
  $msg(o: any) {
    this.onmessage({ data: JSON.stringify(o) });
  }

  /** Simulate socket closing. */
  $close() {
    this.onclose({ code: 1000, reason: "bye" });
  }
}

globalThis.WebSocket = MockWebSocket as any;

/* -------------------------------------------------- *
 * Tests
 * -------------------------------------------------- */

describe("DawSocket (minimal)", () => {
  let socket: DawSocket;
  let wsMock: MockWebSocket;

  beforeEach(() => {
    MockWebSocket.instances.length = 0;
    socket = new DawSocket("ws://127.0.0.1");
    socket.connect();
    wsMock = MockWebSocket.instances[0]!;
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
        expect(msg).toEqual({ type: "confirmation", id: "1", status: "ok" });
        resolve();
      });
      wsMock.$open();
      wsMock.$msg({ type: "confirmation", id: "1", status: "ok" });
    });
  });

  it("send() forwards string when open", () => {
    wsMock.$open();
    socket.send("hello");
    expect(wsMock.send).toHaveBeenCalledWith("hello");
  });

  it("rotatePortAndRetry() advances port and reconnects", async () => {
    vi.useFakeTimers();
    const firstUrl = wsMock.url;

    wsMock.$close(); // triggers rotate+retry
    vi.advanceTimersByTime(10_000); // fast-forward the retry timer

    await vi.runAllTimersAsync(); // let everything resolve

    const newWs = MockWebSocket.instances[1];
    expect(newWs).toBeDefined();
    expect(newWs.url).not.toBe(firstUrl);

    vi.useRealTimers();
  });
});
