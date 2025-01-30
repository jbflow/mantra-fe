// import { wordsToNumbers } from "words-to-numbers"


let phrases = [
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
    "clip slot",
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
    autofilter: "auto filter",
    eq8: "EQ Eight",
    "EQ 8": "EQ Eight",
    eq3: "EQ Three",
    tuna: "tuner",
    cord: "chord",
    base: "bass",
    "notes lengths": "note length",
    "note Lancs": "note length",
    "loaded rhombus": "load a drum buss",
    "drum bus": "drum buss",
    "chorus ensemble": "chorus-ensemble",
    "phaser flanger": "phaser-flanger",
    "phase of lounger": "phaser-flanger",
    "load a saturated": "load a saturator",
    "un solo": "unsolo",
    "on solo": "unsolo",
    "on arm": "unarm",
    "so low": "solo",
    "decreased": "decrease",
    "drywear": "dry/wet",
    "drywall": "dry/wet",
    "drywap": "dry/wet",
    "wave table": "wavetable",
    "analogue": "analog",
    "raw": "roar",
    "attention": "a tension",
    "dry wet": "dry/wet"

};

export class TranscriptParser {
    constructor() {
        this.results = {}
        this.resultIndex = 0
        this.currentResult = {}
        this.transcript = ""
    }


    cleanupTranscript(event, macroCommands) {
        this.currentResult = event.results[event.resultIndex]
        console.log("CURRENT RESULT: ", this.currentResult)
        let filteredResults = this.checkPhrases(this.currentResult, macroCommands)
        console.log("FILTERED RESULTS", filteredResults)
        
        for (let item in replace) {
            filteredResults = this.directReplace(filteredResults, item, replace[item]);
            console.log("FILTERED RESULTS", filteredResults)
        }

        filteredResults = filteredResults.startsWith(' ') ? filteredResults.trimStart() : filteredResults;
        console.log("FILTERED RESULTS", filteredResults)
        return this.replaceWordsWithNumbers(filteredResults)
    }



    checkPhrases(results, macroCommands) {
        let config = JSON.parse(sessionStorage.getItem("config"))
        phrases = phrases.concat(macroCommands)
        phrases = phrases.concat(config?.track)
        phrases = phrases.concat(config?.audioDevice)
        phrases = phrases.concat(config?.instrument)
        phrases = phrases.concat(config?.midiDevice)

        for (let result of results) {
            if (new RegExp(phrases.join("|").toLowerCase()).test(result.transcript.toLowerCase())) {
                return result.transcript.toLowerCase(); // Return them if they are
            }
        }
        return results[0].transcript.toLowerCase(); // Otherwise return the highest confidence
    };
    directReplace = (transcript, find, rep) => {
        return transcript.replace(find, rep);
    };

    replaceWordsWithNumbers(transcript) {
        const wordMap = {
            "zero": 0, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
            "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
            "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
            "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
            "nineteen": 19, "twenty": 20,
            "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60,
            "seventy": 70, "eighty": 80, "ninety": 90,
            "hundred": 100, "thousand": 1000
        };
    
        // Split the sentence into words
        const words = transcript.split(' ');
    
        // Iterate through each word
        const replacedWords = words.map(word => {
            // Check if the word is in the wordMap
            if (wordMap[word.toLowerCase()] !== undefined) {
                // If yes, replace with the numeric equivalent
                return wordMap[word.toLowerCase()].toString();
            } else {
                // If not, keep the word as is
                return word;
            }
        });
    
        // Join the words back into a sentence
        const result = replacedWords.join(' ');
        return result;
    }
}
