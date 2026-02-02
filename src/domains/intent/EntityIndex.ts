import { EntityPathItem, EntityRef, EntityType, LiveSetConfig } from "./types";
import { normalizeText } from "./normalization";

type EntityEntry = {
  entity: EntityRef;
  norm: string;
  aliases: string[];
};

export class EntityIndex {
  private byType = new Map<EntityType, EntityEntry[]>();

  add(
    type: EntityType,
    name: string,
    path?: EntityPathItem[],
    aliases: string[] = []
  ) {
    const entry: EntityEntry = {
      entity: { type, name, path },
      norm: normalizeEntityName(name),
      aliases: aliases.map(normalizeEntityName),
    };
    const list = this.byType.get(type) ?? [];
    list.push(entry);
    this.byType.set(type, list);
  }

  get(type: EntityType): EntityEntry[] {
    return this.byType.get(type) ?? [];
  }

  findCandidates(tokens: string[], types: EntityType[], threshold = 0.84) {
    const entries = types.flatMap((t) => this.get(t));
    const candidates: Array<{ entity: EntityRef; score: number; token: string }> = [];

    for (const token of tokens) {
      const normToken = normalizeEntityName(token);
      if (!normToken) continue;
      for (const entry of entries) {
        const score = bestSimilarity(normToken, entry);
        if (score >= threshold) {
          candidates.push({ entity: entry.entity, score, token });
        }
      }
    }

    return candidates.sort((a, b) => b.score - a.score);
  }
}

export function buildEntityIndex(config: LiveSetConfig): EntityIndex {
  const index = new EntityIndex();
  const tracks = config.track ?? config.lexicon?.track ?? [];

  const trackNameForIndex = (indexValue: number) =>
    tracks[indexValue] ?? `track ${indexValue + 1}`;

  tracks.forEach((name, i) => {
    index.add("track", name, undefined, [`track ${i + 1}`]);
  });

  (config.scene ?? config.lexicon?.scene ?? []).forEach((name, i) => {
    index.add("scene", name, undefined, [`scene ${i + 1}`]);
  });

  (config["cue point"] ?? config.lexicon?.cuePoint ?? []).forEach((name, i) => {
    index.add("cuePoint", name, undefined, [`cue point ${i + 1}`]);
  });

  (config.device ?? []).forEach((devices, trackIndex) => {
    devices.forEach((name, deviceIndex) => {
      index.add(
        "device",
        name,
        [{ type: "track", name: trackNameForIndex(trackIndex) }],
        [`device ${deviceIndex + 1}`]
      );
    });
  });

  (config.lexicon?.device ?? []).forEach((name, i) => {
    index.add("device", name, undefined, [`device ${i + 1}`]);
  });

  (config.clip ?? []).forEach((clips, trackIndex) => {
    clips.forEach((name, clipIndex) => {
      if (name.toLowerCase() === "empty") return;
      index.add(
        "clip",
        name,
        [{ type: "track", name: trackNameForIndex(trackIndex) }],
        [`clip ${clipIndex + 1}`]
      );
    });
  });

  (config.lexicon?.clip ?? []).forEach((name, i) => {
    index.add("clip", name, undefined, [`clip ${i + 1}`]);
  });

  (config.parameter ?? []).forEach((devices, trackIndex) => {
    devices.forEach((params, deviceIndex) => {
      params.forEach((name, paramIndex) => {
        const deviceName =
          config.device?.[trackIndex]?.[deviceIndex] ?? `device ${deviceIndex + 1}`;
        index.add(
          "parameter",
          name,
          [
            { type: "track", name: trackNameForIndex(trackIndex) },
            { type: "device", name: deviceName },
          ],
          [`parameter ${paramIndex + 1}`]
        );
      });
    });
  });

  (config.lexicon?.parameter ?? []).forEach((name, i) => {
    index.add("parameter", name, undefined, [`parameter ${i + 1}`]);
  });

  (config.audioDevice ?? config.lexicon?.audioDevice ?? []).forEach((name) => {
    index.add("audioDevice", name);
  });
  (config.midiDevice ?? config.lexicon?.midiDevice ?? []).forEach((name) => {
    index.add("midiDevice", name);
  });
  (config.instrument ?? config.lexicon?.instrument ?? []).forEach((name) => {
    index.add("instrument", name);
  });
  (config.browserClip ?? config.lexicon?.browserClip ?? []).forEach((name) => {
    index.add("browserClip", name);
  });
  (config.favorites ?? config.lexicon?.favorites ?? []).forEach((name) => {
    index.add("favorites", name);
  });

  const sends = config.send ?? config.lexicon?.mixer ?? [];
  tracks.forEach((_, trackIndex) => {
    index.add("mixer", "volume", [{ type: "track", name: trackNameForIndex(trackIndex) }]);
    index.add("mixer", "pan", [{ type: "track", name: trackNameForIndex(trackIndex) }]);
    sends.forEach((sendName) => {
      index.add("mixer", sendName, [{ type: "track", name: trackNameForIndex(trackIndex) }]);
    });
  });

  return index;
}

function normalizeEntityName(name: string): string {
  return normalizeText(name)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bestSimilarity(token: string, entry: EntityEntry): number {
  const base = similarity(token, entry.norm);
  if (entry.aliases.length === 0) return base;
  return Math.max(base, ...entry.aliases.map((alias) => similarity(token, alias)));
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / Math.max(a.length, b.length);
}

function levenshtein(a: string, b: string): number {
  const aLen = a.length;
  const bLen = b.length;
  const dp = Array.from({ length: aLen + 1 }, () => new Array(bLen + 1).fill(0));

  for (let i = 0; i <= aLen; i += 1) dp[i][0] = i;
  for (let j = 0; j <= bLen; j += 1) dp[0][j] = j;

  for (let i = 1; i <= aLen; i += 1) {
    for (let j = 1; j <= bLen; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[aLen][bLen];
}
