import { emptyConfig } from "../utils/MidiConstants";
import { IntentDetectionBase } from "./IntentDetectionBase";
import { NounSearchEngine } from "./NounClasses"
// import { config } from "./test_data"
export class IntentDetection extends IntentDetectionBase {
    constructor() {
        super();
        this.textInput = "";
        this.config = {}
        this.lastSubject = "";
        this.tokenizedInput = [];
        
    }

    runDetection(textInput = "", config = emptyConfig) {
        console.log("RUNNING DETECTION")
        this.textInput = textInput;
        this.config = config
        // console.log("CONFIG", config)
        this.tokenizedInput = this.parseInput(textInput, 3)
        if (textInput.split(" ").length === 1 && Object.keys(this.SINGLE_WORD).includes(textInput)) {
            return this.SINGLE_WORD[textInput]
        }

        const verb = this.getVerb();
        this.nounSearcher = new NounSearchEngine()
        const nounAdj = this.nounSearcher.search(verb, this.tokenizedInput, this.config)
        console.log("verb: ", verb)
        console.log("potential nouns found: ", nounAdj)
        const adverb = this.getAdverb(verb);
        console.log("adverb: ", adverb)
        const units = this.getUnits();
        console.log("units: ", units)
        if (verb || nounAdj) {
            const modifiedVerb = this.VERBS['select'] && nounAdj && !verb ? this.VERBS['select'] : verb;
            return this.encodeMidi(nounAdj, modifiedVerb, adverb, units)
        }
        else {
            console.log("DIDsfdds")
            return null
        }
    }

    getVerb() {
        for (const v in this.VERBS) {
            if (this.tokenizedInput.includes(v)) {
                return this.VERBS[v];
            }
        }
        return null
    }

    getAdverb(verb) {
        if (verb === 1) {
            this.CUES.push('track /d+', 'device /d+', 'clip /d+', 'track /d+ to', 'device /d+ to', 'clip /d+ to');
        }
        for (const token of this.tokenizedInput) {
            for (const cue of this.CUES) {
                let adverb;
                if (verb === 1) {
                    adverb = this.stringSearch(token, cue);
                    if (adverb) {
                        return adverb;
                    }
                } else {
                    adverb = this.integerSearch(token, cue);
                    if (adverb) {
                        return this.convertInt(adverb, false);
                    }
                }
            }
        }
    }
    getUnits() {
        for (const token of this.tokenizedInput) {
            const units = token.match(/(\d+) *[a-zA-Z%]+/);
            if (units) {
                const unit = units[0].replace(/\d+/g, '').trim();
                if (unit in this.UNITS) {
                    return this.UNITS[unit];
                }
            }
        }
    }

    encodeMidi(nounAdj, verb, adverb, unit) {
        if (nounAdj && verb) {
            const msg = [this.SYSEX_START, ...this.MANUFACTURER_ID];
            // console.log("MSG", msg)
            const ttByte = 1;
            // console.log("CIOAOD", nounAdj)
            const tqByte = this.makeSubjObjQuant(0, Math.floor(nounAdj.length / 3));
            msg.push(ttByte);
            msg.push(tqByte);
            msg.push(...nounAdj);
            msg.push(verb);
            // console.log("VERB", verb)

            if (adverb) {
                // console.log("ADVERB")
                msg.push(...adverb);
                if (unit) {
                    msg.push(unit);
                } else {
                    msg.push(0);
                }
            } else {
                msg.push(10, 0, 0, 0); // Insert default adverb (10, 0, 0) and unit 0 = step
            }

            msg.push(this.SYSEX_END);


            return msg;
        }
    }
}