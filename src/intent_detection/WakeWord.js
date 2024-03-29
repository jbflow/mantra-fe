export function detectWakeWord (transcript) {
    if(transcript?.split(' ')[0] === "TalkBack" || transcript?.split(' ').slice(0, 2).join(' ') === "talk back"){
        return true
    }
    return false
    
}