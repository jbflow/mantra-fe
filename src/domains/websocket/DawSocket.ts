import mitt, { Emitter } from "mitt";
import { DawCommand, DawMessage } from "./MessageTypes";

/**
 * Event types emitted by DawSocket.
 */
type Events = {
  connected: undefined;
  disconnected: { code: number; reason: string };
  message: DawMessage;
  error: Error;
};

/**
 * DawSocket manages a resilient WebSocket connection that automatically rotates ports
 * between a defined range and emits structured events using `mitt`.
 */
export class DawSocket {
  private ws?: WebSocket;
  private port: number;
  private emitter: Emitter<Events> = mitt<Events>();

  /**
   * Create a new DawSocket instance.
   * @param baseUrl - Base WebSocket URL (without port).
   * @param startPort - First port to try connecting to.
   * @param endPort - Last port to try before wrapping around.
   * @param retryMs - Delay before retrying a connection (in ms).
   */
  constructor(
    private baseUrl: string,
    private startPort = 39031,
    private endPort = 39038,
    private retryMs = 10_000
  ) {
    this.port = startPort;
  }

  /** Subscribe to WebSocket events. */
  on = this.emitter.on;

  /** Unsubscribe from WebSocket events. */
  off = this.emitter.off;

  /** Begin the WebSocket connection. */
  connect() {
    this.open();
  }

  /**
   * Send a string message through the socket.
   * @throws If the socket is not currently open.
   */
  send(msg: string) {
    this.sendMsg(msg);
  }

  /** Check if the WebSocket is currently open. */
  isOpen() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /* -------------------- Internals -------------------- */

  /** Attempt to open a WebSocket connection to the current port. */
  private open() {
    const url = `${this.baseUrl}:${this.port}`;
    console.log(`[WS] connecting → ${url}`);
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.emitter.emit("connected", undefined);
    };

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as DawMessage;
        this.emitter.emit("message", msg);
      } catch (err) {
        this.emitter.emit("error", err as Error);
      }
    };

    this.ws.onerror = () => {
      this.emitter.emit("error", new Error("WebSocket error"));
    };

    this.ws.onclose = (e) => {
      console.warn(`[WS] disconnected (${e.code})`);
      this.emitter.emit("disconnected", { code: e.code, reason: e.reason });
      this.rotatePortAndRetry();
    };
  }

  /**
   * Safely send a message string over the WebSocket.
   * @param msg - Message to send.
   */
  private sendMsg(msg: string) {
    if (!this.isOpen()) throw new Error("WebSocket not open");
    this.ws!.send(msg);
  }

  /**
   * Rotate to the next port and schedule a reconnect after `retryMs`.
   */
  private rotatePortAndRetry() {
    this.port = this.port < this.endPort ? this.port + 1 : this.startPort;
    setTimeout(() => this.open(), this.retryMs);
  }
}
