import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from "../images/mic-fill.svg";
import { useEffect, forwardRef, useImperativeHandle } from 'react';
import "../styles/SpeechDetector.css"

const SpeechDetector = forwardRef(({ setTranscript, setAlternatives, setListening }, ref) => {
    const {
        transcript,
        listening
    } = useSpeechRecognition();


    const speechRecognition = SpeechRecognition.getRecognition()

    speechRecognition.maxAlternatives = 100
    speechRecognition.interimResults = false
    
    try {
        speechRecognition.continuous = JSON.parse(localStorage.getItem("preferences")).voice.continuous
    }
    catch {
        speechRecognition.continuous = false
    }
    speechRecognition.lang = JSON.parse(localStorage.getItem("preferences")).voice.language
    speechRecognition.onresult = (result) => {
        console.log(result)
        setAlternatives(result)
    }


    useEffect(() => {
        if (transcript) {
            setTranscript(transcript)
        }
    }, [transcript])

    useEffect(() => {
        setListening(listening)
    }, [listening])

    useImperativeHandle(ref, () => ({
        startListening() {
            SpeechRecognition.startListening()
        },
        stopListening() {
            SpeechRecognition.stopListening()
        }
    }))
    


    return (
        <>
            <div className="speech-detector-container">
                <div className="mic-container" onClick={!listening ? () => { SpeechRecognition.startListening() } : SpeechRecognition.stopListening}>
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
})
export default SpeechDetector;