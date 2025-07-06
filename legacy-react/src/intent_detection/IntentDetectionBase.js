
import * as fuzz from "fuzzball"

import * as constants from "./constants"

export class IntentDetectionBase {
    constructor() {
        this.MANUFACTURER_ID = constants.MANUFACTURER_ID;
        this.VERBS = constants.VERBS;
        this.NOUNS = constants.NOUNS;
        this.THRESH = constants.THRESH;
        this.UNITS = constants.UNITS;
        this.SYSEX_START = constants.SYSEX_START;
        this.SYSEX_END = constants.SYSEX_END;
        this.SINGLE_WORD = constants.SINGLE_WORD;
        this.CUES = constants.CUES;
        this.EXCLUDED = constants.EXCLUDED;
        this.threshold = 80;
    }

    parseInput(textIn = "", max_n = 3) {
        const splitted = textIn.split(" ");
        const parsed = [...splitted];
        const num_tokens = splitted.length
        Array.from({ length: max_n - 1 }, (_, index) => index + 2).forEach((n, index) => {
            if (num_tokens > index + 1) {
                const nGrams = this.getNgrams(textIn, n);
                this.insertNgrams(index + 1, n, parsed, num_tokens, nGrams);
            }
        });
        return parsed;
    };

    insertNgrams(i, n, filtered, num_tokens, nGrams) {
        while (i < num_tokens) {
            for (const ng of nGrams) {
                filtered.splice(i, 0, ng);
                i += n;
            }
        }
        return filtered
    };

    getNgrams(sample, n) {
        n = parseInt(n);
        const tokens = sample.split(' ');
        const ngrams = [];

        for (let i = 0; i <= tokens.length - n; i++) {
            ngrams.push(tokens.slice(i, i + n).join(' '));
        }
        return ngrams;
    };
    makeSubjObjQuant(obj, subj) { return parseInt(`0x${obj}${subj}`, 16) }

    getSubjObjQuant(quant) { return [quant >> 4, quant & 0x07] }

    convertInt(i, slicing) {
        const bytes = [
            Math.floor(i % 128),
            Math.floor((i / 128) % 128),
            Math.floor((i / Math.pow(128, 2)) % 128)
        ];

        return slicing ? bytes.slice(0, -1) : bytes;
    }

    findAllIndexes(arr, value) {
        const indexes = [];
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] === value) {
            indexes.push(i);
          }
        }
        console.log("INDEXES", indexes)
        return indexes;
      }

    integerSearch(token, cue) {
                const number = token.match(`${cue} (\\d+)`);
        if (number) {
            return parseInt(number[1]);
        } else {
            return null;
        }
    }

    stringSearch(token, cue) {
        const string = token.match(`${cue}.*[a-zA-Z]`);
        if (string) {
            return Array.from(string[0].substring(cue.length + 1), c => c.charCodeAt(0));
        }
    }

    leviSearch(token, word_list, threshold) {
        if (token.split('').some(t => /\d/.test(t)) || this.EXCLUDED.includes(token)) {
            return;
        }
        console.log("TOKEN SENT TO LEVI:", token)
        console.log("WORD_LIST: ", word_list)
        const result = fuzz.extract(token, word_list)[0];
        console.log("LEVI RESULT: ", result)
        console.log("LEVI THRESHOLD SET: ", threshold)
        if (result && result[1] >= threshold) {
            console.log("FUZZ RESULT: ", result)
            this.threshold = result[1];
            const name = result[0];
            return this.findAllIndexes(word_list, name)
        }
    }
}