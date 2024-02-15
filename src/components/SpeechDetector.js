import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import TlkBckNotListening from "../images/tlkbck-not-listening.svg";
import TlkBckListening from "../images/tlkbck-listening.svg";
import { useEffect } from 'react';

const SpeechDetector = ({setTranscript}) => {
    const {
        transcript,
        listening
    } = useSpeechRecognition();


    useEffect(() => {
        console.log(listening)
        if (transcript !== "" && !listening) {
            console.log("SETTING")
            setTranscript(transcript)
        }
    }, [transcript, listening])

    const backgroundColor = listening ? "#1477fc" : "#7A7E83"
    return (
        <>
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                paddingTop: "40%"
            }}>
                <p className="h1 pb-5">Press To Speak</p>

                <div style={{ background: backgroundColor, borderRadius: "50%", border: `1px solid ${backgroundColor}`, height: "150px", width: "150px" }}>

                    <img
                        alt=""
                        src={TlkBckNotListening}
                        style={{ height: "150px", width: "150px" }}
                        onClick={!listening ? () => {SpeechRecognition.startListening()} : SpeechRecognition.stopListening}
                    />

                </div>

            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p className="pt-5 px-3 h3 font-italic" style={{ color: backgroundColor }}>{transcript !== "" ? `"${transcript}"` : "..."}</p>
            </div>
        </>

    );
};
export default SpeechDetector;