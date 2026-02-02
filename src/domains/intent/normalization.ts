import { Unit } from "./types";

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bun arm\b/g, "unarm"],
  [/\bun solo\b/g, "unsolo"],
  [/\bun mute\b/g, "unmute"],
  [/\bload of\b/g, "load a"],
  [/\bload and\b/g, "load a"],
  [/\bigloo compressor\b/g, "glue compressor"],
  [/\beq8\b/g, "eq eight"],
  [/\beq3\b/g, "eq three"],
];

const NUMBER_WORDS: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
};

export function normalizeText(input: string): string {
  let out = input.toLowerCase().trim();
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  out = replaceNumberWords(out);
  return out.replace(/\s+/g, " ");
}

export function replaceNumberWords(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => {
      const n = NUMBER_WORDS[word];
      return typeof n === "number" ? String(n) : word;
    })
    .join(" ");
}

export function tokenizeWithNgrams(text: string, maxN = 4): string[] {
  const tokens = text.split(" ");
  const ngrams = [...tokens];
  for (let n = 2; n <= maxN; n += 1) {
    for (let i = 0; i <= tokens.length - n; i += 1) {
      ngrams.push(tokens.slice(i, i + n).join(" "));
    }
  }
  return ngrams;
}

export function extractValueAndUnit(text: string): { value?: number; unit?: Unit } {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(db|hz|ms|%|percent)?/);
  if (!match) return {};
  const value = Number(match[1]);
  if (Number.isNaN(value)) return {};
  const unitRaw = match[2];
  if (!unitRaw) return { value };
  const unit = unitRaw === "percent" ? "%" : (unitRaw as Unit);
  return { value, unit };
}

export function extractAfterKeyword(text: string, keyword: string): string | null {
  const idx = text.indexOf(`${keyword} `);
  if (idx === -1) return null;
  const slice = text.slice(idx + keyword.length + 1).trim();
  return slice.length ? slice : null;
}
