import { convertBytes } from "../utils/utils";
import { CONFIRMATION_VERB_MAP, NOUN_MAP } from "./constants";

export class ConfirmationParser {
    constructor(config){
        this.config = config
    }

    buildConfirmationStr(confirmationBytes) {

    }

    buildNounAdj(bytes){
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
            if (i + 3 < length - 3){
                nounAdjObj.path += "_"
            }
        }
        return nounAdjObj;
    }
        


    extractAdv(advByte) {

    }
    extractUnit(unitByte) {

    }

    getBrowserItem(){

    }

}