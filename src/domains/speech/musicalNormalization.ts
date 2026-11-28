import { musicalCorrections, musicalNouns, musicalVerbs, productionContext } from './musicalVocabulary';
import { parseTextToIntents } from 'mantra-engine';
import { mipSchemaV0_3 } from 'musical-intent-protocol';

export { musicalContextAnchor } from './musicalVocabulary';

export const protocolDefinitions = mipSchemaV0_3.definitions;
export const protocolActions = new Set(
  Object.values(protocolDefinitions).flatMap((definition) => {
    if (!('oneOf' in definition)) return [];
    return definition.oneOf.flatMap((option) => {
      if (!('properties' in option) || !('action' in option.properties) ||
          !('const' in option.properties.action)) return [];
      return [option.properties.action.const];
    });
  }),
);

const commandVerbs = new Set<string>(musicalVerbs);

function plural(term: string): string {
  if (/synthesis$/.test(term)) return `${term.slice(0, -2)}es`;
  if (/[^aeiou]y$/.test(term)) return `${term.slice(0, -1)}ies`;
  if (/(?:s|ch|sh|x|z)$/.test(term)) return `${term}es`;
  return `${term}s`;
}

export const musicalVocabulary = [...new Set(musicalNouns.flatMap((term) => [term, plural(term)]))];

export function startsMusicalCommand(text: string): boolean {
  const firstWord = text.toLowerCase().match(/^\s*([a-z]+)/)?.[1];
  return !!firstWord && commandVerbs.has(firstWord);
}

// Require an additional, explicit production context before correcting even a known error.
const namedContent = /\b(?:rename|name|named|called|label|titled)\b|["“”]/i;

export function normalizeMusicalTranscript(text: string): string {
  // Quant eyes is itself a misrecognized command verb.
  if ((!startsMusicalCommand(text) && !/^\s*quant eyes\b/i.test(text)) ||
      namedContent.test(text) || !productionContext.test(text)) return text;
  return musicalCorrections.reduce(
    (current, { pattern, replacement }) => current.replace(pattern, replacement),
    text,
  );
}

export function normalizeSpeechTranscript(text: string): string {
  if (namedContent.test(text)) return text;
  let corrected = text;
  const checks: Array<(intent: ReturnType<typeof parseTextToIntents>['intents'][number]) => boolean> = [];

  if (/^quant(?:\s+eyes|ise)\b/i.test(corrected)) {
    corrected = corrected.replace(/^quant(?:\s+eyes|ise)\b/i, 'quantize');
    checks.push(({ domain, intent }) => domain === 'music' && intent.action === 'quantize');
  }
  if (/^(?:mute|unmute|solo|unsolo|arm|disarm|quantize)\s+(?:the\s+)?(?:high|hi)[ -]hat(?:\s+track)?[.!?]?\s*$/i.test(corrected)) {
    corrected = corrected.replace(/\b(?:high|hi)[ -]hat\b/i, 'hihat');
    checks.push(({ domain, intent }) =>
      (domain === 'structure' || domain === 'music') &&
      'target' in intent && intent.target?.role === 'hihat',
    );
  }
  if (/^metro\s+gnome\s+(?:on|off)\b/i.test(corrected)) {
    corrected = corrected.replace(/^metro\s+gnome\b/i, 'metronome');
    checks.push(({ domain, intent }) =>
      domain === 'transport' && (intent.action === 'metronome_on' || intent.action === 'metronome_off'),
    );
  }
  if (/^cord\s+progression\s+/i.test(corrected)) {
    corrected = corrected.replace(/^cord\b/i, 'chord');
    checks.push(({ domain, intent }) => domain === 'harmony' && intent.action === 'set_chord_progression');
  }

  if (checks.length) {
    const result = parseTextToIntents(corrected);
    if (result.errors?.length || !checks.every((check) => result.intents.some(check))) corrected = text;
  }
  return normalizeMusicalTranscript(corrected);
}
