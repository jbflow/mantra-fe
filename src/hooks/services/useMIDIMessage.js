export default function useMIDIMessage(input) {
    const [message, setMessage] = useState();
    const handleMessage = (message) => {
        setMessage(message);
    };
    useEffect(() => {
        if (!input) return;
        input.onmidimessage = handleMessage;
    }, [input]);
    return message
}

