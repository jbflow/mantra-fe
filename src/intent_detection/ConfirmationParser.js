import { convertBytes } from "../utils/utils";
import { CONFIRMATION_VERB_MAP, NOUN_MAP, VERBS } from "./constants";

export class ConfirmationParser {
    constructor() {
        this.config = {};
        this.finalStr = "";
    }

    buildConfirmationStr(confirmationBytes, config) {
        this.config = JSON.parse(sessionStorage.getItem("config"));
        const verbBytePos = 11 + (confirmationBytes[7] - 1) * 3;
        const verbByte = confirmationBytes[verbBytePos];

        switch (verbByte) {
            case VERBS.increase:
                this.finalStr = this.parseIncrease(confirmationBytes);
                break;

            case VERBS.decrease:
                this.finalStr = this.parseDecrease(confirmationBytes);
                break;

            case VERBS.set:
                this.finalStr = this.parseSet(confirmationBytes);
                break;

            case VERBS.select:
                this.finalStr = this.parseSelect(confirmationBytes);
                break;

            case VERBS.rename:
                this.finalStr = this.parseRename(confirmationBytes);
                break;

            case VERBS.delete:
                this.finalStr = this.parseDelete(confirmationBytes);
                break;

            case VERBS.duplicate:
                this.finalStr = this.parseDuplicate(confirmationBytes);
                break;

            case VERBS.mute:
                this.finalStr = this.parseMute(confirmationBytes);
                break;

            case VERBS.unmute:
                this.finalStr = this.parseUnmute(confirmationBytes);
                break;

            case VERBS.arm:
                this.finalStr = this.parseArm(confirmationBytes);
                break;

            case VERBS.unarm:
                this.finalStr = this.parseUnarm(confirmationBytes);
                break;

            case VERBS.solo:
                this.finalStr = this.parseSolo(confirmationBytes);
                break;

            case VERBS.unsolo:
                this.finalStr = this.parseUnsolo(confirmationBytes);
                break;

            case VERBS.load:
                this.finalStr = this.parseLoad(confirmationBytes);
                break;

            case VERBS.launch:
                this.finalStr = this.parseLaunch(confirmationBytes);
                break;

            default:
                this.finalStr = "Unknown command";
                break;
        }

        return this.finalStr;
    }

    parseIncrease(confirmationBytes) {
        // Parse confirmation string for 'increase' action
        return "Confirmation: parameter increased";
    }

    parseDecrease(confirmationBytes) {
        // Parse confirmation string for 'decrease' action
        return "Confirmation: parameter decreased";
    }

    parseSet(confirmationBytes) {
        // Parse confirmation string for 'set' action
        return "Confirmation: parameter set";
    }

    parseSelect(confirmationBytes) {
        // Parse confirmation string for 'select' action
        return "Confirmation: item selected";
    }

    parseRename(confirmationBytes) {
        // Parse confirmation string for 'rename' action
        return "Confirmation: item renamed";
    }

    parseDelete(confirmationBytes) {
        // Parse confirmation string for 'delete' action
        return "Confirmation: item deleted";
    }

    parseDuplicate(confirmationBytes) {
        // Parse confirmation string for 'duplicate' action
        return "Confirmation: item duplicated";
    }

    parseMute(confirmationBytes) {
        // Parse confirmation string for 'mute' action
        return "Confirmation: item muted";
    }

    parseUnmute(confirmationBytes) {
        // Parse confirmation string for 'unmute' action
        return "Confirmation: item unmuted";
    }

    parseArm(confirmationBytes) {
        // Parse confirmation string for 'arm' action
        return "Confirmation: item armed";
    }

    parseUnarm(confirmationBytes) {
        // Parse confirmation string for 'unarm' action
        return "Confirmation: item unarmed";
    }

    parseSolo(confirmationBytes) {
        // Parse confirmation string for 'solo' action
        return "Confirmation: item soloed";
    }

    parseUnsolo(confirmationBytes) {
        // Parse confirmation string for 'unsolo' action
        return "Confirmation: item unsoloed";
    }

    parseLoad(confirmationBytes) {
        let confirmationStr = "";
        if (confirmationBytes[7] == 2) {
            const deviceNum = convertBytes(confirmationBytes.slice(12, 14)) - 1;
            const device = this.config[NOUN_MAP[confirmationBytes[11]]][deviceNum];
            const trackNum = convertBytes(confirmationBytes.slice(9, 11));
            const track = this.config["track"][trackNum - 1];
            confirmationStr = `Confirmation: ${device} loaded on track ${trackNum}`;
        } else if (confirmationBytes[8] === 3) {
            const trackBytes = convertBytes(confirmationBytes.slice(9, 11));
            let trackType = "";
            switch (trackBytes - 1) {
                case 16126:
                    trackType = "an audio";
                    break;
                case 16382:
                    trackType = "a midi";
                    break;
                case 16254:
                    trackType = "a return";
                    break;
                default:
                    trackType = "an unknown";
                    break;
            }

            confirmationStr = `Confirmation: created ${trackType} track`;
        }
        return confirmationStr;
    }

    parseLaunch(confirmationBytes) {
        // Parse confirmation string for 'launch' action
        return "Confirmation: item launched";
    }

    buildNounAdj(bytes) {
        return `${NOUN_MAP[bytes[0]]}_${convertBytes(bytes.slice(1, 3))}`;
    }

    extractNounAdj(nounAdjBytes) {
        const nounAdjObj = {
            path: "",
            subject: ""
        };
        const length = nounAdjBytes.length;
        const subjectBytes = nounAdjBytes.slice(length - 3);
        nounAdjObj.subject = this.buildNounAdj(subjectBytes);
        for (let i = 0; i < length - 3; i += 3) {
            nounAdjObj.path += this.buildNounAdj(nounAdjBytes.slice(i, i + 3));
            if (i + 3 < length - 3) {
                nounAdjObj.path += "_";
            }
        }
        return nounAdjObj;
    }

    extractAdv(advByte) {
        // To be implemented
    }

    extractUnit(unitByte) {
        // To be implemented
    }

    getBrowserItem() {
        // To be implemented
    }
}
