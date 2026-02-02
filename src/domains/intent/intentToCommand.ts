import type { DawCommand } from "@/domains/websocket/MessageTypes";
import type { IntentResult } from "./types";

export type IntentCommandOptions = {
  id?: string;
  includeMeta?: boolean;
};

export function intentToCommand(
  intent: IntentResult,
  options: IntentCommandOptions = {}
): DawCommand {
  const { id = makeId(), includeMeta = true } = options;
  const { intent: action, transcript, confidence, ...args } = intent;

  return {
    id,
    verb: action,
    args: {
      ...args,
      ...(includeMeta
        ? {
            transcript,
            confidence,
          }
        : {}),
    },
  };
}

function makeId() {
  return `intent_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}