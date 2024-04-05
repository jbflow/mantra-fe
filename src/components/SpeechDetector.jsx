// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from "../images/mic-fill.svg";
import { useEffect, useState } from 'react';
import "../styles/SpeechDetector.css"
import useSpeechRecognition from "../hooks/useSpeechRecognition";

const SpeechDetector = ({ setAlternatives, setListening, tlkbckSpeaking }) => {
    const {transcript, listening} = useSpeechRecognition();
    const [userInitiatedSpeech, setUserInitiatedSpeech] = useState(false)

    const speechRecognition = SpeechRecognition.getRecognition()
    speechRecognition.maxAlternatives = 20
    speechRecognition.interimResults = false
    try {
        speechRecognition.continuous = JSON.parse(localStorage.getItem("preferences")).voice.continuous
    }
    catch {
        speechRecognition.continuous = false
    }
    speechRecognition.lang = JSON.parse(localStorage.getItem("preferences")).voice.language
    speechRecognition.onresult = (result) => {
        SpeechRecognition.stopListening()
        setAlternatives(result)
    }

    const handleSpeechRecognition = () => {
        if (!listening){
            SpeechRecognition.startListening()
            setUserInitiatedSpeech(true)
        }
        else{
            console.log("HMM")
            SpeechRecognition.stopListening()
            setUserInitiatedSpeech(false)
        }
    }



    useEffect(() => {
        console.log("LISTENING", listening)
        setListening(listening)
    }, [listening])

    useEffect(() => {
        if(!tlkbckSpeaking && JSON.parse(localStorage.getItem("preferences")).voice.continuous && userInitiatedSpeech && !listening ){
            SpeechRecognition.startListening()
        }
    }, [tlkbckSpeaking, userInitiatedSpeech, listening])


    


    return (
        <>
            <div className="speech-detector-container">
                <div className="mic-container" onClick={handleSpeechRecognition}>
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