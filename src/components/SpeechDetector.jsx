
import { useEffect, useRef, useState } from 'react';
import "../styles/SpeechDetector.css"

const start_sound = new Audio("/sounds/start_sound.mp3")
const stop_sound = new Audio("/sounds/stop_sound.mp3")


const SpeechDetector = ({ setAlternatives, tlkbckSpeaking, listening, handleSetListening }) => {
    const [userInitiatedSpeech, setUserInitiatedSpeech] = useState(false)
    
    const recognition = useRef()


    const initSpeechRecognition = () => {
        const voicePreferences = JSON.parse(localStorage.getItem("preferences")).voice
        if (typeof window === 'undefined') return;
        window.SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (window.SpeechRecognition) {

            recognition.current = new window.SpeechRecognition();
            recognition.current.lang = voicePreferences.language
            recognition.current.interimResults = false
            recognition.current.maxAlternatives = 100
            recognition.current.continuous = false
            recognition.current.onresult = handleSpeechRecognitionResult
            recognition.current.onend = () => {
                stop_sound.play()
                handleSetListening(false)
            }
            recognition.current.onstart = () => {
                start_sound.play()
            }
        }

    }
    const handleSpeechRecognitionToggle = () => {
        if (!listening) {
            try {
                recognition.current.start()
                handleSetListening(true)
                setUserInitiatedSpeech(true)
            }
            catch (err) {
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

        const voicePreferences = JSON.parse(localStorage.getItem("preferences")).voice
        if(result && result.results[result.resultIndex][0].transcript.length === 0 ){return}
        setAlternatives(result)
        if (!voicePreferences.continuous || voicePreferences.feedback) {
            recognition.current.stop()
            handleSetListening(false)
        }
        
    }



    useEffect(() => {
        const voicePreferences = JSON.parse(localStorage.getItem("preferences")).voice
        if (!tlkbckSpeaking && userInitiatedSpeech) {
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
                <button aria-label="click to start speaking" onClick={handleSpeechRecognitionToggle}>
                    <div className="mic-container" id="tlkbck-btn">
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
                            <div aria-live="assertive" aria-atomic="true" className="sr-only">
                                {listening ? "started listening" : "stopped listening"}
                            </div>
                        </div>
                    </div>
                </button>
            </div>

        </>
    );
}
export default SpeechDetector;
