import { IntentDetectionBase } from "./IntentDetectionBase";
export class NounSearchEngine extends IntentDetectionBase {
    constructor() {
        super()
        this.nounAdjArray = [];
        this.fullPath = ""
        this.lastSubject = "";
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
        return this.makeBytesFromFullPath()


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

        // if (parameters.length === 0) {
        //     // if haven't found anything yet, lets look for a parameter in our last subject
        //     console.log("LAST SUBJECT", this.lastSubject)
        //     console.log("CHECKING LAST SUBJECT FOR PARAMS")
        //     const t_pattern = /([track]+_\d+)/g;
        //     const d_pattern = /([device]+_\d+)/g;
        //     const track = this.lastSubject.match(t_pattern);
        //     const device = this.lastSubject.match(d_pattern);
        //     if (track) {
        //         const t = parseInt(track[0].split("_")[1])
        //         const mixerParams = this.getNounAdj("mixer", ['volume', 'pan'].concat(config['return track']), tokenizedInput, [['track', t]]);
        //         parameters.push(...mixerParams)
        //         if (device) {
        //             const d = parseInt(device[0].split("_")[1])
        //             console.log("DEVICE", d)
        //             console.log("TRACK", t)
        //             parameters.push(...this.getNounAdj("parameter", config.parameter[t][d], tokenizedInput, [['track', t], ['device', d]]));
        //         }
        //     }
        // }
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
            const t_pattern = /([track]+_\d+)/g;
            const track = this.lastSubject.match(t_pattern);
            if (track) {
                const t = parseInt(track[0].split("_")[1])
                devices.push(...this.getNounAdj("device", config.device[t], tokenizedInput, [['track', t]]));
            }
        }

        if (clips.length === 0) {
            const t_pattern = /([track]+_\d+)/g;
            const track = this.lastSubject.match(t_pattern);
            if (track) {
                const t = parseInt(track[0].split("_")[1])
                clips.push(...this.getNounAdj("clip", config.clip[t], tokenizedInput, [['track', t]]));
            }

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
        const devices = []
        const tracks = this.getNounAdj("track", config.track.concat, tokenizedInput);
        for (let track of tracks) {
            const t = track.index
            devices.push(...this.getNounAdj("audioDevice", config.audioDevice, tokenizedInput, [['track', t]]))
            devices.push(...this.getNounAdj("midiDevice", config.midiDevice, tokenizedInput, [['track', t]]))
            devices.push(...this.getNounAdj("instrument", config.instrument, tokenizedInput, [['track', t]]))
        }
        if (devices.length === 0 ){
            devices.push(...this.getNounAdj("audioDevice", config.audioDevice, tokenizedInput, [['track', config.sel_track]]))
            devices.push(...this.getNounAdj("midiDevice", config.midiDevice, tokenizedInput, [['track', config.sel_track]]))
            devices.push(...this.getNounAdj("instrument", config.instrument, tokenizedInput, [['track', config.sel_track]]))
        }
        return devices
    }

    getNounAdj(noun, list, tokenizedInput, parents = []) {
        console.log("NOUN: ", noun)
        console.log("list: ", list)
        // console.log("tokenizedInput: ", tokenizedInput)
        // console.log("parents: ", parents)
        const nounAdj = [];
        for (const token of tokenizedInput) {
            const integer = this.integerSearch(token, noun);
            const levi = this.leviSearch(token, list);
            // console.log("LEVI", levi)


            if (integer) {
                nounAdj.push({
                    token: token,
                    index: integer - 1,
                    subject: `${noun}_${integer - 1}`,
                    path: parents.map(parent => parent.join('_')).join('_'),

                });
            } else if (levi) {
                // console.log("LEVI: ", levi)
                for (let l of levi) {
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
        // console.log("NOUN ADJ ARRAY", nounAdjArray)
        for (const nounAdj of nounAdjArray) {
            this.fullPath = `${nounAdj.path}_${nounAdj.subject}`
            if (!uniquePaths.has(this.fullPath)) {
                uniquePaths.add(this.fullPath);
                filteredNouns.push(nounAdj);
            }
        }
        return filteredNouns;
    }

    
    makeBytesFromFullPath() {
        console.log("I AM PATH: ", this.fullPath)
        this.lastSubject = this.fullPath
        const pattern = /([a-zA-Z]+_\d+)/g;
        const matches = this.fullPath.match(pattern);
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
        return bytes


    }
}