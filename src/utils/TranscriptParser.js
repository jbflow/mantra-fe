import {wordsToNumbers } from "words-to-numbers"


const phrases = [
    "un arm the",
    "un arm track [0-9]",
    "arm track [0-9]",
    "arm the [a-z]*",
    "track [0-9] to",
    "load [a-z]*",
    "load a [a-z]*",
    "load an [a-z]*",
    "load a drum bus",
    "load a reverb",
    "tuner",
    "a reverb",
    "beat [0-9] to beat [0-9]",
    "bar [0-9] to bar [0-9]",
    "[A-Z][0-9] note",
    "[0-9] [A-Z][0-9] notes",
    "eq8",
    "eq3",
  ];
  
  const replace = {
    loading: "load an",
    "load of": "load a",
    "load and": "load a",
    "igloo compressor": "glue compressor",
    autofilter: "Auto Filter",
    eq8: "EQ Eight",
    eq3: "EQ Three",
    tuna: "tuner",
    cord: "chord",
    base: "bass",
    "notes lengths": "note length",
    "note Lancs": "note length",
    "loaded rhombus": "load a Drum buss",
    "drum bus": "Drum Buss",
    "chorus ensemble": "Chorus-Ensemble",
    "phaser flanger": "Phaser-Flanger",
    "phase of lounger": "Phaser-Flanger",
    "load a saturated": "load a Saturator",
    "un solo": "unsolo",
    "on arm": "unarm",
  };

export class TranscriptParser {
    constructor() {
        this.results = {}
        this.resultIndex = 0
        this.currentResult = {}
        this.transcript = ""
    }


    cleanupTranscript(event) {
        this.currentResult = event.results[event.resultIndex]
        // console.log("CURRENT RESULT: ", this.currentResult)
        const filteredResults = this.checkPhrases(this.currentResult)
        // console.log("FILTERED RESULTS", filteredResults)
        let transcript = ""
        for (let item in replace) {
            transcript = this.directReplace(filteredResults, item, replace[item]);
          }
        return wordsToNumbers(transcript)
    }

    checkPhrases(results) {
        // Loop through the alternatives to check if any of our hot phrases are contained in them.
        // console.log("alt", results);
        for (let result in results) {
            if (new RegExp(phrases.join("|")).test(results[result].transcript)) {
                return results[result].transcript; // Return them if they are
            }
        }
        return results[0].transcript; // Otherwise return the highest confidence
    };
    directReplace = (transcript, find, rep) => {
        let finalTranscript = transcript.replace(find, rep);
        return finalTranscript;
    };
}
