import Mic from "../images/mic-fill.svg";
import { useEffect, useRef, useState } from 'react';
import "../styles/SpeechDetector.css"


const SpeechDetector = ({ setAlternatives, tlkbckSpeaking, listening, handleSetListening }) => {
    const [userInitiatedSpeech, setUserInitiatedSpeech] = useState(false)
    const voicePreferences = JSON.parse(localStorage.getItem("preferences")).voice
    const recognition = useRef()
    const handleSpeechRecognitionToggle = () => {
        if (!listening) {
            recognition.current.start()
            handleSetListening(true)
            setUserInitiatedSpeech(true)
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
        if(!tlkbckSpeaking && voicePreferences.continuous && userInitiatedSpeech){
            recognition.current.start()
            handleSetListening(true)
        }
        
    }, [tlkbckSpeaking])

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {
            
            recognition.current = new window.SpeechRecognition();
            recognition.current.lang = voicePreferences.language
            recognition.current.interimResults = false
            recognition.current.continuous = voicePreferences.continuous
            recognition.current.onresult = handleSpeechRecognitionResult


        }
    }, []);





    return (
        <>
            <div className="speech-detector-container">
                <div className="mic-container" onClick={handleSpeechRecognitionToggle}>
                    <div className={listening ? "mic-outline" : null}>
                    </div>
                    <div className={listening ? "mic-outline" : null} id="delayed">
                    </div>
                    <div className={listening ? "mic-btn mic-btn-listening" : "mic-btn"}>
                    </div>
                    <div className={listening ? "mic-btn circlein circlein-listening" : "mic-btn circlein"}>
                        <img
                            alt="btn to start mic for speech recognition"
                            src="./images/menu-icons/mic-fill.svg"
                            className="w-75 m-auto"
                        />
                    </div>
                </div>
            </div>
        </>

    );
}
export default SpeechDetector;