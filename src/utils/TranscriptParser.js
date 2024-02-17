import {phrases, replace} from "./speechConstants"

export class TranscriptParser {
    constructor() {
        this.results = {}
        this.resultIndex = 0
        this.currentResult = {}
        this.transcript = ""
    }


    cleanupTranscript(event) {
        this.results = event.results
        this.resultIndex = event.resultIndex
        this.currentResult = this.getCurrentResult()
        console.log("CURRENT RESULT: ", this.currentResult)
        const filteredResults = this.checkPhrases(this.currentResult)
        console.log("FILTERED RESULTS", filteredResults)
        let transcript = ""
        for (let item in replace) {
            transcript = this.directReplace(filteredResults, item, replace[item]);
          }
        return transcript
    }

    getCurrentResult() {
        return this.results[this.resultIndex]

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
