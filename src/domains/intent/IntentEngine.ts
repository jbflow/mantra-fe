import {
  AdjustIntent,
  DetectionInput,
  EntityRef,
  EntityType,
  IntentName,
  IntentResult,
  LaunchIntent,
  LiveSetConfig,
  LoadIntent,
  MoveIntent,
  Preposition,
  RenameIntent,
  SimpleTargetIntent,
  ValueSpec,
} from "./types";
import { buildEntityIndex, EntityIndex } from "./EntityIndex";
import {
  extractAfterKeyword,
  extractValueAndUnit,
  normalizeText,
  tokenizeWithNgrams,
} from "./normalization";

const INTENT_PHRASES: Record<IntentName, string[]> = {
  load: ["load", "add", "insert", "instantiate", "create", "make"],
  select: ["select", "grab"],
  rename: ["rename", "name"],
  delete: ["delete", "remove", "scrap", "get rid of", "bin"],
  duplicate: ["duplicate", "repeat"],
  arm: ["arm", "record enable", "enable record"],
  unarm: ["unarm", "record disable", "disable record", "disable recording"],
  solo: ["solo"],
  unsolo: ["unsolo", "un solo"],
  mute: ["mute"],
  unmute: ["unmute", "un mute"],
  increase: ["increase", "raise", "turn up", "boost"],
  decrease: ["decrease", "reduce", "turn down", "lower"],
  set: ["set"],
  launch: ["launch", "fire", "start"],
  move: ["move"],
};

const ENTITY_PRIORITY: EntityType[] = [
  "track",
  "device",
  "clip",
  "scene",
  "cuePoint",
];

const LOADABLE_TYPES: EntityType[] = [
  "audioDevice",
  "midiDevice",
  "instrument",
  "browserClip",
  "favorites",
];

const PARAM_TYPES: EntityType[] = ["parameter", "mixer"];

type IntentContext = {
  transcript: string;
  tokens: string[];
  config: LiveSetConfig;
  index: EntityIndex;
  intent: IntentName;
};

type IntentResolver = (context: IntentContext) => IntentResult | null;

export class IntentEngine {
  private index?: EntityIndex;
  private lastConfig?: LiveSetConfig;
  private readonly resolvers: Record<IntentName, IntentResolver> = {
    load: (context) => this.resolveLoad(context),
    select: (context) => this.resolveSimpleTarget(context),
    rename: (context) => this.resolveRename(context),
    delete: (context) => this.resolveSimpleTarget(context),
    duplicate: (context) => this.resolveSimpleTarget(context),
    mute: (context) => this.resolveSimpleTarget(context),
    unmute: (context) => this.resolveSimpleTarget(context),
    arm: (context) => this.resolveSimpleTarget(context),
    unarm: (context) => this.resolveSimpleTarget(context),
    solo: (context) => this.resolveSimpleTarget(context),
    unsolo: (context) => this.resolveSimpleTarget(context),
    increase: (context) => this.resolveAdjust(context),
    decrease: (context) => this.resolveAdjust(context),
    set: (context) => this.resolveAdjust(context),
    launch: (context) => this.resolveLaunch(context),
    move: (context) => this.resolveMove(context),
  };

  detect(input: DetectionInput): IntentResult | null {
    const transcripts = Array.isArray(input.transcript)
      ? input.transcript
      : [input.transcript];

    const index = this.getIndex(input.config);
    let best: IntentResult | null = null;

    for (const transcript of transcripts) {
      const result = this.detectOne(transcript, input.config, index);
      if (result && (!best || result.confidence > best.confidence)) {
        best = result;
      }
    }

    return best;
  }

  getSpeechHints(config: LiveSetConfig, macros: string[] = []): string[] {
    const hints = new Set<string>(macros.map(normalizeText));
    const index = this.getIndex(config);
    const types: EntityType[] = [
      "track",
      "scene",
      "cuePoint",
      "device",
      "clip",
      "parameter",
      "mixer",
      "instrument",
      "audioDevice",
      "midiDevice",
      "browserClip",
      "favorites",
    ];
    types.forEach((type) => {
      index.get(type).forEach((entry) => hints.add(entry.entity.name));
    });
    return [...hints];
  }

  private detectOne(
    transcriptRaw: string,
    config: LiveSetConfig,
    index: EntityIndex
  ): IntentResult | null {
    const transcript = normalizeText(transcriptRaw);
    if (!transcript) return null;
    const tokens = tokenizeWithNgrams(transcript, 4);

    const intent = this.findIntent(transcript, tokens);
    if (!intent) return null;

    const resolver = this.resolvers[intent];
    if (!resolver) return null;

    return resolver({ transcript, tokens, config, index, intent });
  }

  private getIndex(config: LiveSetConfig): EntityIndex {
    if (!this.index || this.lastConfig !== config) {
      this.index = buildEntityIndex(config);
      this.lastConfig = config;
    }
    return this.index;
  }

  private findIntent(transcript: string, tokens: string[]): IntentName | null {
    const phraseList = Object.entries(INTENT_PHRASES)
      .flatMap(([intent, phrases]) =>
        phrases.map((phrase) => ({ intent: intent as IntentName, phrase }))
      )
      .sort((a, b) => b.phrase.length - a.phrase.length);

    for (const { intent, phrase } of phraseList) {
      if (transcript.includes(phrase)) return intent;
      if (tokens.includes(phrase)) return intent;
    }
    return null;
  }

  private findEntity(tokens: string[], index: EntityIndex, types: EntityType[]) {
    const candidates = index.findCandidates(tokens, types, 0.84);
    return candidates.length ? candidates[0] : null;
  }

  private findNumericTarget(
    text: string,
    types: EntityType[],
    config: LiveSetConfig
  ): EntityRef | null {
    for (const type of types) {
      const match = text.match(
        new RegExp(`${type.replace(/([A-Z])/g, " $1").toLowerCase()} (\\d+)`)
      );
      if (match) {
        const index = Number(match[1]) - 1;
        return { type, name: this.resolveNameForIndex(type, index, config) };
      }
    }
    return null;
  }

  private findClipSlot(text: string): EntityRef | null {
    const match = text.match(/clip slot (\d+)/);
    if (!match) return null;
    return { type: "clipSlot", name: `clip slot ${match[1]}` };
  }

  private resolveSimpleTarget(context: IntentContext): SimpleTargetIntent | null {
    const { transcript, tokens, config, index, intent } = context;
    const numericTarget = this.findNumericTarget(transcript, ENTITY_PRIORITY, config);
    const target = numericTarget ?? this.findEntity(tokens, index, ENTITY_PRIORITY)?.entity;
    if (!target) return null;
    const confidence = this.score({ target, boost: numericTarget ? 0.2 : 0 });
    return {
      intent: intent as SimpleTargetIntent["intent"],
      transcript,
      confidence,
      target,
    };
  }

  private resolveLoad(context: IntentContext): LoadIntent | null {
    const { transcript, tokens, config, index } = context;
    const target = this.findEntity(tokens, index, LOADABLE_TYPES)?.entity;
    if (!target) return null;

    const destinationSegment = this.extractSegmentAfterPreposition(transcript, ["on", "onto", "into", "to"]);
    const destination = destinationSegment
      ? this.findNumericTarget(destinationSegment, ["track", "scene"], config) ??
        this.findEntityInSegment(destinationSegment, index, ["track", "scene", "device"])
      : this.findNumericTarget(transcript, ["track"], config) ??
        this.findEntity(tokens, index, ["track"])?.entity ??
        null;

    const sourceSegment = this.extractSegmentAfterPreposition(transcript, ["from"]);
    const source = sourceSegment
      ? this.findEntityInSegment(sourceSegment, index, LOADABLE_TYPES)
      : null;

    const preposition = destinationSegment
      ? this.findFirstPreposition(transcript, ["on", "onto", "into", "to"])
      : sourceSegment
        ? "from"
        : undefined;

    const confidence = this.score({ target, destination, source });
    return {
      intent: "load",
      transcript,
      confidence,
      target,
      destination: destination ?? undefined,
      source: source ?? undefined,
      preposition,
    };
  }

  private resolveAdjust(context: IntentContext): AdjustIntent | null {
    const { transcript, tokens, config, index, intent } = context;
    const target = this.findEntity(tokens, index, PARAM_TYPES)?.entity;
    if (!target) return null;

    const { value, unit } = extractValueAndUnit(transcript);
    const valueSpec: ValueSpec | undefined =
      typeof value === "number" ? { amount: value, unit } : undefined;

    const scopeSegment = this.extractSegmentAfterPreposition(transcript, ["on", "in", "at", "for"]);
    const scope = scopeSegment
      ? this.findEntityInSegment(scopeSegment, index, ["track", "device"])
      : this.findNumericTarget(transcript, ["track"], config) ??
        this.findEntity(tokens, index, ["track"])?.entity ??
        null;

    const confidence = this.score({ target, value: valueSpec, scope });
    return {
      intent: intent as AdjustIntent["intent"],
      transcript,
      confidence,
      target,
      value: valueSpec,
      scope: scope ?? undefined,
    };
  }

  private resolveRename(context: IntentContext): RenameIntent | null {
    const { transcript, tokens, config, index } = context;
    const target =
      this.findNumericTarget(transcript, ENTITY_PRIORITY, config) ??
      this.findEntity(tokens, index, ENTITY_PRIORITY)?.entity;
    const name =
      extractAfterKeyword(transcript, "to") ??
      extractAfterKeyword(transcript, "as") ??
      extractAfterKeyword(transcript, "named") ??
      undefined;
    if (!target || !name) return null;

    const confidence = this.score({ target, name });
    return { intent: "rename", transcript, confidence, target, name };
  }

  private resolveLaunch(context: IntentContext): LaunchIntent | null {
    const { transcript, tokens, config, index } = context;
    const scene =
      this.findNumericTarget(transcript, ["scene"], config) ??
      this.findEntity(tokens, index, ["scene"])?.entity ??
      null;
    const clipSlot = this.findClipSlot(transcript);
    const target = clipSlot ?? scene;
    if (!target) return null;

    const confidence = this.score({ target, boost: clipSlot ? 0.2 : 0 });
    return { intent: "launch", transcript, confidence, target };
  }

  private resolveMove(context: IntentContext): MoveIntent | null {
    const { transcript, tokens, index } = context;
    const destinationSegment = this.extractSegmentAfterPreposition(transcript, ["to", "into", "onto"]);
    const sourceSegment = this.extractBetweenKeywords(transcript, "from", "to");
    const targetSegment = this.extractBeforeKeyword(transcript, destinationSegment ? "to" : "from");

    const target =
      (targetSegment
        ? this.findEntityInSegment(targetSegment, index, ENTITY_PRIORITY)
        : null) ?? this.findEntity(tokens, index, ENTITY_PRIORITY)?.entity;
    if (!target) return null;

    const source = sourceSegment
      ? this.findEntityInSegment(sourceSegment, index, ENTITY_PRIORITY)
      : null;
    const destination = destinationSegment
      ? this.findEntityInSegment(destinationSegment, index, ENTITY_PRIORITY)
      : null;

    const preposition = destinationSegment
      ? this.findFirstPreposition(transcript, ["to", "into", "onto"])
      : sourceSegment
        ? "from"
        : undefined;

    const confidence = this.score({ target, source, destination });
    return {
      intent: "move",
      transcript,
      confidence,
      target,
      source: source ?? undefined,
      destination: destination ?? undefined,
      preposition,
    };
  }

  private findEntityInSegment(
    segment: string,
    index: EntityIndex,
    types: EntityType[]
  ): EntityRef | null {
    const segTokens = tokenizeWithNgrams(segment, 4);
    return this.findEntity(segTokens, index, types)?.entity ?? null;
  }

  private extractSegmentAfterPreposition(
    text: string,
    prepositions: Preposition[]
  ): string | null {
    for (const prep of prepositions) {
      const match = text.match(new RegExp(`\\b${prep}\\b (.+)`));
      if (match?.[1]) return match[1].trim();
    }
    return null;
  }

  private extractBetweenKeywords(text: string, start: string, end: string): string | null {
    const startIndex = text.indexOf(`${start} `);
    if (startIndex === -1) return null;
    const slice = text.slice(startIndex + start.length + 1);
    const endIndex = slice.indexOf(` ${end} `);
    const value = endIndex === -1 ? slice : slice.slice(0, endIndex);
    return value.trim() || null;
  }

  private extractBeforeKeyword(text: string, keyword: string): string | null {
    const idx = text.indexOf(` ${keyword} `);
    if (idx === -1) return null;
    const slice = text.slice(0, idx).trim();
    return slice.length ? slice : null;
  }

  private findFirstPreposition(text: string, prepositions: Preposition[]): Preposition | undefined {
    for (const prep of prepositions) {
      if (text.includes(` ${prep} `)) return prep;
    }
    return undefined;
  }

  private resolveNameForIndex(type: EntityType, index: number, config: LiveSetConfig): string {
    if (index < 0) return type;
    switch (type) {
      case "track":
        return config.track?.[index] ?? config.lexicon?.track?.[index] ?? `track ${index + 1}`;
      case "scene":
        return config.scene?.[index] ?? config.lexicon?.scene?.[index] ?? `scene ${index + 1}`;
      case "cuePoint":
        return (
          config["cue point"]?.[index] ??
          config.lexicon?.cuePoint?.[index] ??
          `cue point ${index + 1}`
        );
      case "device":
        return config.lexicon?.device?.[index] ?? `device ${index + 1}`;
      case "clip":
        return config.lexicon?.clip?.[index] ?? `clip ${index + 1}`;
      case "parameter":
        return config.lexicon?.parameter?.[index] ?? `parameter ${index + 1}`;
      default:
        return `${type} ${index + 1}`;
    }
  }

  private score(parts: {
    target?: EntityRef | null;
    value?: ValueSpec;
    name?: string;
    source?: EntityRef | null;
    destination?: EntityRef | null;
    scope?: EntityRef | null;
    boost?: number;
  }): number {
    let score = 0.25;
    if (parts.target) score += 0.35;
    if (parts.value) score += 0.15;
    if (parts.name) score += 0.15;
    if (parts.source || parts.destination || parts.scope) score += 0.1;
    if (parts.boost) score += parts.boost;
    return Math.min(1, score);
  }
}
