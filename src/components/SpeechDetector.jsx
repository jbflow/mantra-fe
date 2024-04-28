
import { useEffect, useRef, useState } from 'react';
import "../styles/SpeechDetector.css"


const SpeechDetector = ({ setAlternatives, tlkbckSpeaking, listening, handleSetListening }) => {
    const [userInitiatedSpeech, setUserInitiatedSpeech] = useState(false)
    const voicePreferences = JSON.parse(localStorage.getItem("preferences")).voice
    const recognition = useRef()


    const initSpeechRecognition = () => {
        if (typeof window === 'undefined') return;
        window.SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {

            recognition.current = new window.SpeechRecognition();
            recognition.current.lang = voicePreferences.language
            recognition.current.interimResults = false
            recognition.current.maxAlternatives = 100
            recognition.current.continuous = voicePreferences.continuous
            recognition.current.onresult = handleSpeechRecognitionResult
        }

    }
    const handleSpeechRecognitionToggle = () => {
        console.log("LISTENING", listening)
        if (!listening) {
            console.log(recognition.current)
            try {
                recognition.current.start()
                handleSetListening(true)
                setUserInitiatedSpeech(true)
                
            }
            catch (err) {
                console.log("ERRROR", err)
                handleSetListening(false)
                setUserInitiatedSpeech(false)
                recognition.current.abort()
                initSpeechRecognition()

            }
        }
        else {
            recognition.current.stop()
            handleSetListening(false)
            setUserInitiatedSpeech(false)
        }
    }

    const handleSpeechRecognitionResult = (result) => {
        setAlternatives(result)
        recognition.current.stop()
        handleSetListening(false)
    }



    useEffect(() => {
        if (!tlkbckSpeaking && voicePreferences.continuous && userInitiatedSpeech) {
            try {
                recognition.current.start()
            }
            catch (err) {
                recognition.current.abort()
                initSpeechRecognition()
                recognition.current.start()
            }
            handleSetListening(true)
        }

    }, [tlkbckSpeaking])

    useEffect(() => {
        initSpeechRecognition()
    }, []);






    return (
        <>
            <div className="speech-detector-container">
                <div className="mic-container" onClick={handleSpeechRecognitionToggle} id="tlkbck-btn">
                    <div className={listening ? "mic-outline" : null}>
                    </div>
                    <div className={listening ? "mic-outline" : null} id="delayed">
                    </div>
                    <div className={listening ? "mic-btn mic-btn-listening" : "mic-btn"}>
                    </div>
                    <div className={listening ? "mic-btn circlein circlein-listening" : "mic-btn circlein"}>
                        <button aria-label="click to start speaking">
                            <img
                                alt="btn to start mic for speech recognition"
                                src="./images/menu-icons/mic-fill.svg"
                                className="w-75 m-auto"
                            /></button>
                        <div aria-live="polite" aria-atomic="true" class="sr-only">
                            {listening ? "started listening" : "stopped listening"}
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
}
export default SpeechDetector;