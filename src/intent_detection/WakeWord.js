export function detectWakeWord (transcript) {
    if(transcript[0] === "TalkBack" || transcript.split(' ').slice(0, 2).join(' ') === "talk back"){
        return true
    }
    return false;
}