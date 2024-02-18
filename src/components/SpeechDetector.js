import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from "../images/mic-fill.svg";
import { useEffect, useState } from 'react';
import "../styles/SpeechDetector.css"

const SpeechDetector = ({ setTranscript, setAlternatives, setListening }) => {
    const {
        listening
    } = useSpeechRecognition();

    const speechRecognition = SpeechRecognition.getRecognition()
    speechRecognition.maxAlternatives = 10
    speechRecognition.interimResults = false
    speechRecognition.lang = "en-GB"
    speechRecognition.onresult = (result) => {
        setAlternatives(result)
    }


    // useEffect(() => {
    //     if (transcript !== "" && !listening) {
    //         setTranscript(transcript)
    //     }
    // }, [transcript, setTranscript, listening])

    const backgroundColor = listening ? "#1477fc" : "#7A7E83"
    useEffect(() => {
        setListening(listening)
    }, [listening, setListening])
    return (
        <>
            <div className="speech-detector-container">
                <p className="h1 pb-5">Press To Speak</p>
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