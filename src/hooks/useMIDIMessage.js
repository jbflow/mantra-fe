import { useEffect, useState } from "react";


export default function useMIDIMessage(input) { 
    const [message, setMessage] = useState();

    const clearMessage = () => {
        setMessage(null)
    }
    
    const handleMessage = (message) => {
        setMessage(message);
    };
    useEffect(() => {
        if (!input) return;
        input.addEventListener("midimessage", handleMessage)
    }, [input]);
    return [message, clearMessage]
}

