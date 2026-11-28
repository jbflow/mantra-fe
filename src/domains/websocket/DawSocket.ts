import { TinyEmitter } from "@/domains/shared/TinyEmitter";
import type { DawMessage, DawRequest } from "./MessageTypes";

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
 * between a defined range and emits structured events using a tiny emitter.
 */
export class DawSocket {
  private ws?: WebSocket;
  private port: number;
  private emitter = new TinyEmitter<Events>();
  private retryTimer?: ReturnType<typeof setTimeout>;
  private stopped = true;
  private connectionPromise?: Promise<void>;
  private pendingConnection?: { resolve: () => void; reject: (error: Error) => void };

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

  /** Begin connecting and resolve when a connection opens. */
  connect(): Promise<void> {
    if (this.isOpen()) return Promise.resolve();
    this.stopped = false;
    if (!this.connectionPromise) {
      this.connectionPromise = new Promise<void>((resolve, reject) => {
        this.pendingConnection = { resolve, reject };
      });
    }
    if (!this.ws && this.retryTimer === undefined) this.open();
    return this.connectionPromise;
  }

  /** Stop reconnecting and close the current connection. */
  disconnect() {
    this.stopped = true;
    if (this.retryTimer !== undefined) {
      clearTimeout(this.retryTimer);
      this.retryTimer = undefined;
    }
    const ws = this.ws;
    this.ws = undefined;
    this.rejectPendingConnection(new Error("WebSocket disconnected before connecting"));
    ws?.close();
  }

  /** Send a request using the remote script's JSON protocol. */
  send(message: DawRequest) {
    this.sendMsg(JSON.stringify(message));
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
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (cause) {
      this.emitter.emit("error", cause instanceof Error ? cause : new Error("WebSocket connection error"));
      this.rotatePortAndRetry();
      return;
    }
    this.ws = ws;

    ws.onopen = () => {
      this.emitter.emit("connected", undefined);
      this.pendingConnection?.resolve();
      this.pendingConnection = undefined;
      this.connectionPromise = undefined;
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(String(e.data)) as DawMessage;
        this.emitter.emit("message", msg);
      } catch (cause) {
        this.emitter.emit("error", cause instanceof Error ? cause : new Error("Invalid WebSocket message"));
      }
    };

    ws.onerror = () => {
      this.emitter.emit("error", new Error("WebSocket error"));
    };

    ws.onclose = (e) => {
      if (this.ws !== ws) return;
      console.warn(`[WS] disconnected (${e.code})`);
      this.ws = undefined;
      this.emitter.emit("disconnected", { code: e.code, reason: e.reason });
      if (!this.stopped) this.rotatePortAndRetry();
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
    if (this.stopped || this.retryTimer !== undefined) return;
    this.port = this.port < this.endPort ? this.port + 1 : this.startPort;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      this.open();
    }, this.retryMs);
  }

  private rejectPendingConnection(error: Error) {
    this.pendingConnection?.reject(error);
    this.pendingConnection = undefined;
    this.connectionPromise = undefined;
  }
}
