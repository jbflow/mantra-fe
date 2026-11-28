import type { Intent, Source } from "musical-intent-protocol";

export type DawRequest =
  | { type: "intent"; payload: Intent | Intent[]; source?: Source }
  | { type: "ping" };

export type DawMessage =
  | { type: "ack"; ids: string[]; status: "accepted" }
  | { type: "result"; id: string; status: "ok" | "error"; details?: unknown }
  | { type: "error"; code: "BAD_REQUEST" | "INTERNAL_ERROR"; message: string }
  | { type: "pong" };
