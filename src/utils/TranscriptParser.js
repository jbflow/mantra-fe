import {phrases, replace} from "./speechConstants"
import {wordsToNumbers } from "words-to-numbers"

export class TranscriptParser {
    constructor() {
        this.results = {}
        this.resultIndex = 0
        this.currentResult = {}
        this.transcript = ""
    }


    cleanupTranscript(event) {
        this.currentResult = event.results[event.resultIndex]
        console.log("CURRENT RESULT: ", this.currentResult)
        const filteredResults = this.checkPhrases(this.currentResult)
        console.log("FILTERED RESULTS", filteredResults)
        let transcript = ""
        for (let item in replace) {
            transcript = this.directReplace(filteredResults, item, replace[item]);
          }
        return wordsToNumbers(transcript)
    }

    checkPhrases(results) {
        // Loop through the alternatives to check if any of our hot phrases are contained in them.
        console.log("alt", results);
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
