import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from "../images/mic-fill.svg";
import { useEffect, useState } from 'react';
import "../styles/SpeechDetector.css"

const SpeechDetector = ({ setTranscript, setAlternatives, setListening }) => {
    const {
        transcript,
        listening
    } = useSpeechRecognition();

    const speechRecognition = SpeechRecognition.getRecognition()
    speechRecognition.maxAlternatives = 10
    speechRecognition.interimResults = false
    speechRecognition.continuous = false
    speechRecognition.lang = "en-GB"
    speechRecognition.onresult = (result) => {
        setAlternatives(result)
    }


    useEffect(() => {
        console.log(transcript)
        if (transcript) {
            setTranscript(transcript)
        }
    }, [transcript])

    useEffect(() => {
        setListening(listening)
    }, [listening])


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
};
export default SpeechDetector;