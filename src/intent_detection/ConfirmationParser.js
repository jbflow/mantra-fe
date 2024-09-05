import { convertBytes } from "../utils/utils";
import { CONFIRMATION_VERB_MAP, NOUN_MAP, VERBS } from "./constants";

export class ConfirmationParser {
    constructor() {
        this.config = {}
        this.finalStr = ""
    }

    buildConfirmationStr(confirmationBytes, config) {
        this.config = JSON.parse(sessionStorage.getItem("config"))
        console.log("HELLO")
        console.log(confirmationBytes)
        const verbBytePos = 11 + (confirmationBytes[7] - 1) * 3
        const verbByte = confirmationBytes[verbBytePos]

        if ([VERBS.increase, VERBS.decrease, VERBS.set].includes(verbByte)) {
            console.log("INCREMENTAL CONFIRMATION")
            this.finalStr = this.createIncremental(confirmationBytes)

        }
        else if (
            [VERBS.select, VERBS.rename, VERBS.delete, VERBS.duplicate, VERBS.mute, VERBS.unmute, VERBS.arm, VERBS.unarm, VERBS.solo, VERBS.unsolo].includes(verbByte)
        ) {
            // Mutatable confirmation
            this.finalStr = "Command confirmed"
        } else if (verbByte === VERBS.load) {
            this.finalStr = this.createLoadable(confirmationBytes)
        }
        else if (verbByte === VERBS.launch) {
            this.finalStr = "Scene launched"
            
        }
        return this.finalStr


    }


    createMutatable(confirmationBytes) {


    }

    createLoadable(confirmationBytes) {
        let confirmationStr = ""
        if (confirmationBytes[7] == 2) {
            const deviceNum = convertBytes(confirmationBytes.slice(12, 14)) - 1
            const device = this.config[NOUN_MAP[confirmationBytes[11]]][deviceNum]
            const trackNum = convertBytes(confirmationBytes.slice(9, 11))
            const track = this.config["track"][trackNum - 1]
            confirmationStr = `${device} loaded on track ${trackNum}`
        }
        else if(confirmationBytes[8] === 3){
            const trackBytes = convertBytes(confirmationBytes.slice(9, 11))
            let trackType = "";
            switch (trackBytes - 1) {
                case 16126:
                    trackType = "an audio"
                    break
                case 16382:
                    trackType = "a midi"
                    break
                case 16254:
                    trackType = "a return" 
                    break
            }

            confirmationStr = `created ${trackType} track`
        
        }
        return confirmationStr
        

    }

    createIncremental(confirmationBytes) {



    }

    buildNounAdj(bytes) {
        return `${NOUN_MAP[bytes[0]]}_${convertBytes(bytes.slice(1, 3))}`;
    }

    extractVerb(verbByte) {
        return CONFIRMATION_VERB_MAP[verbByte]
    }

    extractNounAdj(nounAdjBytes) {
        const nounAdjObj = {
            path: "",
            subject: ""
        };
        const length = nounAdjBytes.length;
        const subjectBytes = nounAdjBytes.slice(length - 3)
        nounAdjObj.subject = this.buildNounAdj(subjectBytes)
        for (let i = 0; i < length - 3; i += 3) {
            nounAdjObj.path += this.buildNounAdj(nounAdjBytes.slice(i, i + 3))
            if (i + 3 < length - 3) {
                nounAdjObj.path += "_"
            }
        }
        return nounAdjObj;
    }



    extractAdv(advByte) {

    }
    extractUnit(unitByte) {

    }

    getBrowserItem() {

    }

}