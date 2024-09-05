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
            // Increamental confirmation

        }
        else if (
            [VERBS.select, VERBS.rename, VERBS.delete, VERBS.duplicate, VERBS.mute, VERBS.unmute, VERBS.arm, VERBS.unarm, VERBS.solo, VERBS.unsolo].includes(verbByte)
        ) {
            // Mutatable confirmation
        } else if (verbByte === VERBS.load) {
            console.log("LOADABLE CONFIRMATION")
            this.finalStr = this.createLoadable(confirmationBytes)
        }
        else if (verbByte === VERBS.launch) {
            // launchable confirmation
            
        }
        return this.finalStr


    }


    createMutatable(confirmationBytes) {


    }

    createLoadable(confirmationBytes) {
        const deviceNum = convertBytes(confirmationBytes.slice(12, 14)) - 1
        const device = this.config[NOUN_MAP[confirmationBytes[11]]][deviceNum]
        const trackNum = convertBytes(confirmationBytes.slice(9, 11))
        const track = this.config["track"][trackNum - 1]
        const confirmationStr = `${device} loaded on track number ${trackNum} named: ${track}`
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