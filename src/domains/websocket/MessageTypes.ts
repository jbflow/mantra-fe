export interface DawCommand {
  id: string;
  verb: string;
  args: Record<string, unknown>;
}

export type DawMessage =
  | { type: "confirmation"; id: string; status: "ok" | "error" }
  | { type: "error"; message: string };
