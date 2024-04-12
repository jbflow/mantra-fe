import { useEffect, useState } from "react";


export default function useMIDIMessage(input, handleMidiMessage) { 
    const [message, setMessage] = useState();
    const clearMessage = () => {
        setMessage(null)
    }
    useEffect(() => {
        if (!input) return;
        input.addEventListener("midimessage", handleMidiMessage)
    }, [input]);
    return [message, clearMessage]
}

