import { IntentDetectionBase } from "./IntentDetectionBase";
import { arraysEqual } from "../utils/utils";
export class NounSearchEngine extends IntentDetectionBase {
    constructor() {
        super()
        this.nounAdjArray = [];
        this.fullPath = ""
    }
    search(verb, tokenizedInput, config) {
        if ([this.VERBS.increase, this.VERBS.decrease, this.VERBS.set].includes(verb)) {
            this.nounAdjArray = this.getIncremental(config, tokenizedInput);
        } else if (
            [this.VERBS.select, this.VERBS.rename, this.VERBS.delete, this.VERBS.duplicate, this.VERBS.mute, this.VERBS.unmute, this.VERBS.arm, this.VERBS.unarm, this.VERBS.solo, this.VERBS.unsolo].includes(verb) ||
            !verb
        ) {
            this.nounAdjArray = this.getMutatable(config, tokenizedInput);
        } else if (verb === this.VERBS.load) {
            this.nounAdjArray = this.getLoadable(config, tokenizedInput);
        }
        else {
            this.nounAdjArray = this.getMutatable(config, tokenizedInput);
        }
        this.nounAdjArray = this.removeDuplicateResults(this.nounAdjArray)
        this.nounAdjArray = this.sortMultipleResults(this.nounAdjArray)
        if (this.nounAdjArray.length === 0 ){
            return null
        }
        this.fullPath = this.convertNounAdjToPath(this.nounAdjArray)

        return this.makeBytesFromFullPath(this.fullPath)


    }

    getIncremental(config, tokenizedInput) {
        const devices = [];
        const parameters = [];
        // First check if any tracks have been specified
        const tracks = this.getNounAdj("track", config.track, tokenizedInput);
        for (let track of tracks) {
            const t = track.index
            // then check if one of its devices have been mentioned
            devices.push(...this.getNounAdj("device", config.device[t], tokenizedInput, [['track', t]]));
            // console.log("DEVICES", devices)
            // check for mixer params as well
            const mixerParams = this.getNounAdj("mixer", ['volume', 'pan'].concat(config['send']), tokenizedInput, [['track', t]]);
            parameters.push(...mixerParams);

            for (let device of devices) {
                const d = device.index
                // then check the devices to see if its parameters are mentioned
                console.log("CHECKING DEVICE FOR PARAMS")
                parameters.push(...this.getNounAdj("parameter", config.parameter[t][d], tokenizedInput, [['track', t], ['device', d]]));

            }
        }


        if (parameters.length === 0) {
            console.log("CHECKING SEL TRACK AND SEL DEVICE FOR PARAMS")
            // If haven't found a parameter yet, try the selected track and device
            const mixerParams = this.getNounAdj("mixer", ['volume', 'pan'].concat(config['return track']), tokenizedInput, [['track', config.sel_track]]);
            parameters.push(...mixerParams)
            parameters.push(...this.getNounAdj("parameter", config.parameter[config.sel_track][config.sel_device], tokenizedInput, [['track', config.sel_track], ['device', config.sel_device]]));
        }

        return parameters
    }
    getMutatable(config, tokenizedInput) {
        const devices = [];
        const clips = [];
        // Get the tracks, scenes and cuepoints
        const tracks = this.getNounAdj("track", config.track, tokenizedInput);
        const scenes = this.getNounAdj("scene", config.scene, tokenizedInput);
        const cuePoints = this.getNounAdj("cue point", config["cue point"], tokenizedInput);
        for (let track of tracks) {
            let t = track.index
            // Now check the tracks devices and clips
            devices.push(...this.getNounAdj("device", config.device[t], tokenizedInput, [['track', t]]));
            clips.push(...this.getNounAdj("clip", config.clip[t], tokenizedInput, [['track', t]]));
        }

        if (devices.length === 0) {
            devices.push(...this.getNounAdj("device", config.device[config.sel_track], tokenizedInput, [['track', config.sel_track]]));
        }
        if (clips.length === 0) {
            clips.push(...this.getNounAdj("clip", config.clip[config.sel_track], tokenizedInput, [['track', config.sel_track]]));
        }

        return [...tracks, ...scenes, ...cuePoints, ...devices, ...clips]
    }
    getLoadable(config, tokenizedInput) {
        const loadable = []
        loadable.push(...this.getTrackNounAdj(tokenizedInput))
        if (loadable.length === 0) {
            const tracks = this.getNounAdj("track", config.track, tokenizedInput);
            for (let track of tracks) {
                const t = track.index
                loadable.push(...this.getNounAdj("audioDevice", config.audioDevice, tokenizedInput, [['track', t]]))
                loadable.push(...this.getNounAdj("midiDevice", config.midiDevice, tokenizedInput, [['track', t]]))
                loadable.push(...this.getNounAdj("instrument", config.instrument, tokenizedInput, [['track', t]]))
            }
        }
        if (loadable.length === 0) {
            loadable.push(...this.getNounAdj("audioDevice", config.audioDevice, tokenizedInput, [['track', config.sel_track]]))
            loadable.push(...this.getNounAdj("midiDevice", config.midiDevice, tokenizedInput, [['track', config.sel_track]]))
            loadable.push(...this.getNounAdj("instrument", config.instrument, tokenizedInput, [['track', config.sel_track]]))
        }

        return loadable
    }

    getTrackNounAdj(tokenizedInput) {
        const tokensToCheck = {
            "audio track": 16126,
            "midi track": 16382,
            "return track": 16254
        };
        let result = [];
        tokenizedInput.forEach(token => {
            const index = tokensToCheck[token];
            if (index !== undefined) {
                result.push({
                    token: token,
                    index: index,
                    subject: `track_${index}`,
                    path: ''
                });
            }
        });
        return result;
    }

    getNounAdj(noun, list, tokenizedInput, parents = []) {
        // console.log("NOUN: ", noun)
        // console.log("list: ", list)
        // console.log("tokenizedInput: ", tokenizedInput)
        // console.log("parents: ", parents)
        const nounAdj = [];
        for (const token of tokenizedInput) {
            const integer = this.integerSearch(token, noun);
            const levi = this.leviSearch(token, list);
            if (integer) {
                nounAdj.push({
                    token: token,
                    index: integer - 1,
                    subject: `${noun}_${integer - 1}`,
                    path: parents.map(parent => parent.join('_')).join('_'),

                });
            } else if (levi) {
                for (let l of levi) {
                    if (arraysEqual(list, ["audio track", "midi track", "return track"])) { l = [16126, 16382, 16254][l] }
                    nounAdj.push({
                        token: token,
                        index: l,
                        subject: `${noun}_${l}`,
                        path: parents.map(parent => parent.join('_')).join('_'),


                    });
                }

            }
        }
        // console.log("nounAdj: ", nounAdj)
        return nounAdj;
    }
    removeDuplicateResults(nounAdjArray) {
        const uniquePaths = new Set();
        const filteredNouns = [];
        let path;
        // console.log("NOUN ADJ ARRAY", nounAdjArray)
        for (const nounAdj of nounAdjArray) {
            path = `${nounAdj.path}_${nounAdj.subject}`
            if (!uniquePaths.has(path)) {
                uniquePaths.add(path);
                filteredNouns.push(nounAdj);
            }
        }
        return filteredNouns;
    }

    sortMultipleResults(nounAdjArray) {
        const maxWordsArray = nounAdjArray.reduce((maxObjects, obj) => {
            const { token } = obj;
            const words = token.split(' ').length;
    
            if (words > 0) {
                if (!maxObjects.length || words > maxObjects[0].words) {
                    return [{ obj, words }];
                } else if (words === maxObjects[0].words) {
                    maxObjects.push({ obj, words });
                }
            }
    
            return maxObjects;
        }, []);
    
        return maxWordsArray.map(obj => obj.obj);
    }

    convertNounAdjToPath(nounAdjArray) {
        return `${nounAdjArray[0].path}_${nounAdjArray[0].subject}`

    }


    makeBytesFromFullPath(fullPath) {
        console.log("I AM PATH: ", fullPath)
        const pattern = /([a-zA-Z]+_\d+)/g;
        const matches = fullPath.match(pattern);
        let bytes = []
        if (matches) {
            matches.forEach(match => {
                const [word, number] = match.split(/_(\d+)/);
                if (word === "mixer") {
                    bytes.push(10)
                    bytes.push(127)
                    bytes.push(127)
                    bytes.push(22)
                    bytes.push(...this.convertInt(parseInt(number) + 1, true))
                }
                else {
                    bytes.push(this.NOUNS[word])
                    bytes.push(...this.convertInt(parseInt(number) + 1, true))
                    // console.log("NOUNS WORD", this.NOUNS[word])
                    // console.log("CONVERT INT", this.convertInt(number, true))
                }
            })
        }
        console.log("bytes: ", bytes)
        return bytes.length > 0 ? bytes : null


    }
}