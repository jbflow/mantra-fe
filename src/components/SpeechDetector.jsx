// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Mic from "../images/mic-fill.svg";
import { useEffect, useState } from 'react';
import "../styles/SpeechDetector.css"
import useSpeechRecognition from "../hooks/useSpeechRecognition";

const SpeechDetector = ({ setAlternatives, setListening, tlkbckSpeaking }) => {
    const [userInitiatedSpeech, setUserInitiatedSpeech] = useState(false)


    const handleSpeechResult = (result) => {
        setAlternatives(result)
        stop()

    }
    const {listen, listening, stop} = useSpeechRecognition(handleSpeechResult);

    

   

    const handleSpeechRecognition = () => {
        if (!listening){
            listen()
            setUserInitiatedSpeech(true)
        }
        else{
            
            stop()
            setUserInitiatedSpeech(false)
        }
    }



    useEffect(() => {
        setListening(listening)
    }, [listening])

    useEffect(() => {
        if(!tlkbckSpeaking && JSON.parse(localStorage.getItem("preferences")).voice.continuous && userInitiatedSpeech && !listening ){
            listen()
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