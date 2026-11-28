import { TinyEmitter } from '@/domains/shared/TinyEmitter';
import type { RecognitionEvents, SpeechRecognitionEngine } from '@/domains/speech/SpeechRecognitionEngine';
import { parseTextToIntents } from 'mantra-engine';
import { musicalContextAnchor, musicalVocabulary, normalizeSpeechTranscript, protocolActions, protocolDefinitions, startsMusicalCommand } from './musicalNormalization';

type SpeechRecCtor = new () => SpeechRecognition;

const SILENCE_COMMIT_MS = 300;
const SPEECH_END_COMMIT_MS = 100;
const MAX_UNEXPECTED_ENDS = 5;

const definitions = protocolDefinitions;
const vocabulary = [...new Set([
  ...definitions.Role.enum,
  ...definitions.ScaleType.enum,
  ...definitions.TimbreAttribute.enum,
  ...definitions.Domain.enum,
  ...musicalVocabulary,
].map((term) => term.replace(/_/g, ' ')))].sort((a, b) => b.length - a.length);

const commandWords = new Set([...protocolActions].map((action) => action.split('_')[0]));

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
  const matches = vocabularyMatches(text);
  const vocabularyScore = Math.min(matches, 2) * 0.05 + Math.min(Math.max(matches - 2, 0), 2) * 0.015;
  if (firstWord && commandWords.has(firstWord)) {
    const result = parseTextToIntents(text);
    if (result.intents.length && !result.errors?.length) {
      return 0.02 + vocabularyScore;
    }
  }
  if (startsMusicalCommand(text) && matches >= 2 && musicalContextAnchor.test(text)) {
    return 0.02 + vocabularyScore;
  }
  return 0;
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
  private listening = false;
  private nativeActive = false;
  private stopping = false;
  private disposed = false;
  private speechActive = false;
  private speechEnded = false;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private emptyRestarts = 0;
  private unexpectedEnds = 0;
  private noSpeech = false;
  private carried = '';
  private sessionText = '';

  constructor(opts: { lang?: string; continuous?: boolean } = {}) {
    const RecCtor = getSpeechRecCtor();
    if (!RecCtor) throw new Error('Web Speech API not supported in this browser');

    this.rec = new RecCtor();
    this.rec.lang = opts.lang ?? 'en-US';
    this.rec.continuous = opts.continuous ?? true;
    this.rec.interimResults = true;
    this.rec.maxAlternatives = 5;

    this.rec.onresult = (e: SpeechRecognitionEvent) => {
      if (!this.listening && !this.stopping) return;
      const parts: string[] = [];
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (!result.length) continue;
        const text = result.isFinal && /^en(?:-|$)/i.test(this.rec.lang)
          ? normalizeSpeechTranscript(selectTranscript(result))
          : result[0].transcript.trim();
        if (text) parts.push(text);
      }
      this.sessionText = parts.join(' ');
      this.emptyRestarts = 0;
      this.unexpectedEnds = 0;
      this.emitter.emit('partial', this.transcript());
      if (this.listening && !this.speechActive && !this.speechEnded && this.sessionText) {
        this.scheduleCommit(SILENCE_COMMIT_MS);
      }
    };

    this.rec.onspeechstart = () => {
      if (!this.listening) return;
      this.speechActive = true;
      this.speechEnded = false;
      this.emptyRestarts = 0;
      this.unexpectedEnds = 0;
      this.clearSilenceTimer();
    };

    this.rec.onspeechend = () => {
      if (!this.listening) return;
      this.speechActive = false;
      this.speechEnded = true;
      this.scheduleCommit(SPEECH_END_COMMIT_MS);
    };

    this.rec.onerror = (err) => {
      if (!this.listening) return;
      if (err.error === 'no-speech') {
        this.noSpeech = true;
        if (this.transcript() && !this.silenceTimer) this.scheduleCommit(SPEECH_END_COMMIT_MS);
        return;
      }
      this.listening = false;
      this.clearTimers();
      this.finish();
      this.emitter.emit('error', new Error(err.error || 'speech-error'));
      this.emitter.emit('status', { state: 'error' });
    };

    this.rec.onend = () => {
      this.nativeActive = false;
      this.speechActive = false;
      if (this.stopping) {
        this.stopping = false;
        this.finish();
      } else if (this.listening) {
        this.carried = this.transcript();
        this.sessionText = '';
        this.emptyRestarts++;
        this.unexpectedEnds = this.noSpeech ? 0 : this.unexpectedEnds + 1;
        if (this.unexpectedEnds > MAX_UNEXPECTED_ENDS) {
          this.fail(new Error('Speech recognition repeatedly disconnected'));
          return;
        }
        const delay = Math.min(250 * 2 ** (this.emptyRestarts - 1), 2000);
        this.restartTimer = setTimeout(() => {
          this.restartTimer = null;
          if (!this.listening) return;
          try {
            this.noSpeech = false;
            this.rec.start();
            this.nativeActive = true;
          } catch (cause) {
            this.fail(cause instanceof Error ? cause : new Error('Could not restart speech recognition'));
          }
        }, delay);
      }
    };
  }

  on  = this.emitter.on;
  off = this.emitter.off;

  async initialize() {
    this.emitter.emit('status', { state: 'ready' });
  }

  async start() {
    if (this.disposed) throw new Error('Speech recognition has been disposed');
    if (this.listening) return;
    if (this.nativeActive || this.stopping) throw new Error('Speech recognition is still stopping');
    this.carried = '';
    this.sessionText = '';
    this.emptyRestarts = 0;
    this.unexpectedEnds = 0;
    this.noSpeech = false;
    this.speechActive = false;
    this.speechEnded = false;
    this.rec.start();
    this.nativeActive = true;
    this.listening = true;
    this.emitter.emit('status', { state: 'listening' });
  }

  stop() {
    if (!this.listening) return;
    this.listening = false;
    this.clearTimers();
    if (this.nativeActive) {
      this.stopping = true;
      this.rec.stop();
    } else {
      this.finish();
    }
  }

  dispose() {
    this.disposed = true;
    this.listening = false;
    this.stopping = false;
    this.clearTimers();
    this.rec.onresult = null;
    this.rec.onerror = null;
    this.rec.onend = null;
    this.rec.onspeechstart = null;
    this.rec.onspeechend = null;
    if (this.nativeActive) this.rec.stop();
    this.nativeActive = false;
  }

  private transcript() {
    return [this.carried, this.sessionText].filter(Boolean).join(' ');
  }

  private scheduleCommit(delay: number) {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      this.silenceTimer = null;
      if (!this.speechActive && this.transcript()) this.stop();
    }, delay);
  }

  private clearSilenceTimer() {
    if (this.silenceTimer !== null) clearTimeout(this.silenceTimer);
    this.silenceTimer = null;
  }

  private clearTimers() {
    this.clearSilenceTimer();
    if (this.restartTimer !== null) clearTimeout(this.restartTimer);
    this.restartTimer = null;
  }

  private finish() {
    const text = this.transcript();
    this.carried = '';
    this.sessionText = '';
    this.emitter.emit('status', { state: 'ready' });
    if (text) this.emitter.emit('final', text);
  }

  private fail(error: Error) {
    this.listening = false;
    this.clearTimers();
    this.emitter.emit('error', error);
    this.emitter.emit('status', { state: 'error' });
  }
}
