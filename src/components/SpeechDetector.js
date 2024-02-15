import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import TlkBckNotListening from "../images/tlkbck-not-listening.svg";
// import TlkBckListening from "../images/tlkbck-listening.svg";
import { useEffect } from 'react';

const SpeechDetector = ({ setTranscript, setAlternatives, setListening, backgroundColor }) => {
    const {
        transcript,
        alternatives,
        listening
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript !== "" && !listening) {
            setTranscript(transcript)
        }
    }, [transcript, setTranscript, listening])


    useEffect(() => {
        if (alternatives.length !== 0) {
            setAlternatives(alternatives)
        }

    }, [alternatives, setAlternatives])


    useEffect(() => {Í
        setListening(listening)
    }, [listening, setListening])



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
                        onClick={!listening ? () => { SpeechRecognition.startListening() } : SpeechRecognition.stopListening}
                    />

                </div>

            </div>

        </>

    );
};
export default SpeechDetector;