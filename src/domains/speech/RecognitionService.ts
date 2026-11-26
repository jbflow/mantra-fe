import { TinyEmitter } from '@/domains/shared/TinyEmitter';
import type { RecognitionEvents, SpeechRecognitionEngine } from '@/domains/speech/SpeechRecognitionEngine';
import { parseTextToIntents } from 'mantra-engine';
import { mipSchemaV0_1 } from 'musical-intent-protocol';

type SpeechRecCtor = new () => SpeechRecognition;

const definitions = mipSchemaV0_1.definitions;
const vocabulary = [
  ...definitions.Role.enum,
  ...definitions.ScaleType.enum,
  ...definitions.TimbreAttribute.enum,
  ...definitions.Domain.enum,
].map((term) => term.replace(/_/g, ' ')).sort((a, b) => b.length - a.length);

const commandWords = new Set([
  ...definitions.TransportIntent.oneOf,
  ...definitions.StructureIntent.oneOf,
  ...definitions.MusicIntent.oneOf,
  ...definitions.HarmonyIntent.oneOf,
  ...definitions.RhythmIntent.oneOf,
  ...definitions.PerformanceIntent.oneOf,
  ...definitions.AnalysisIntent.oneOf,
  ...definitions.TimbreIntent.oneOf,
].map((option) => option.properties.action.const.split('_')[0]));

function vocabularyMatches(text: string): number {
  let remaining = ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
  let count = 0;
  for (const term of vocabulary) {
    const phrase = ` ${term} `;
    if (remaining.includes(phrase)) {
      count += term.includes(' ') ? 2 : 1;
      remaining = remaining.replace(phrase, ' ');
    }
  }
  return count;
}

function contextScore(text: string): number {
  const firstWord = text.toLowerCase().match(/^\s*([a-z]+)/)?.[1];
  if (!firstWord || !commandWords.has(firstWord)) return 0;
  const result = parseTextToIntents(text);
  if (!result.intents.length || result.errors?.length) return 0;
  return 0.02 + Math.min(vocabularyMatches(text), 2) * 0.05;
}

function similarTranscripts(a: string, b: string): boolean {
  const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const left = normalize(a);
  const right = normalize(b);
  if (!left || !right || left.length > 256 || right.length > 256) return false;
  if ((a.match(/[+-]?\d+(?:[.,]\d+)?/g) ?? []).join('|') !==
      (b.match(/[+-]?\d+(?:[.,]\d+)?/g) ?? []).join('|')) return false;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    const current = [i];
    for (let j = 1; j <= right.length; j++) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[right.length] / Math.max(left.length, right.length) <= 0.35;
}

function selectTranscript(result: SpeechRecognitionResult): string {
  const first = result[0];
  const firstText = first.transcript.trim();
  let selected = firstText;
  let bestScore = contextScore(firstText);
  for (let i = 1; i < result.length; i++) {
    const alternative = result[i];
    const text = alternative.transcript.trim();
    if (!similarTranscripts(firstText, text)) continue;
    const confidenceDifference = first.confidence > 0 && alternative.confidence > 0
      ? alternative.confidence - first.confidence
      : -0.01 * i;
    const score = confidenceDifference + contextScore(text);
    if (score > bestScore) {
      bestScore = score;
      selected = text;
    }
  }
  return selected;
}

function correctTranscript(text: string): string {
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

  if (!checks.length) return text;
  const result = parseTextToIntents(corrected);
  return !result.errors?.length && checks.every((check) => result.intents.some(check)) ? corrected : text;
}

function getSpeechRecCtor(): SpeechRecCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecCtor;
    webkitSpeechRecognition?: SpeechRecCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export class RecognitionService implements SpeechRecognitionEngine {
  private rec: SpeechRecognition;
  private emitter = new TinyEmitter<RecognitionEvents>();
  private running = false;

  constructor(opts: { lang?: string; continuous?: boolean } = {}) {
    const RecCtor = getSpeechRecCtor();
    if (!RecCtor) throw new Error('Web Speech API not supported in this browser');

    this.rec = new RecCtor();
    this.rec.lang = opts.lang ?? 'en-US';
    this.rec.continuous = !!opts.continuous;
    this.rec.interimResults = true;
    this.rec.maxAlternatives = 5;

    this.rec.onresult = (e: SpeechRecognitionEvent) => {
      const last = e.results[e.results.length - 1];
      const text = last.isFinal && /^en(?:-|$)/i.test(this.rec.lang)
        ? correctTranscript(selectTranscript(last))
        : last[0].transcript.trim();
      if (last.isFinal) {
        this.emitter.emit('final', text);
      } else {
        this.emitter.emit('partial', text);
      }
    };

    this.rec.onerror = (err) => {
      this.running = false;
      this.emitter.emit('error', new Error(err.error || 'speech-error'));
      this.emitter.emit('status', { state: 'error' });
    };

    this.rec.onend = () => {
      this.running = false;
      this.emitter.emit('status', { state: 'ready' });
    };
  }

  on  = this.emitter.on;
  off = this.emitter.off;

  async initialize() {
    this.emitter.emit('status', { state: 'ready' });
  }

  async start() {
    this.rec.start();
    this.running = true;
    this.emitter.emit('status', { state: 'listening' });
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    this.rec.stop();
    this.emitter.emit('status', { state: 'ready' });
  }

  dispose() {
    this.stop();
    this.rec.onresult = null;
    this.rec.onerror = null;
    this.rec.onend = null;
  }
}
