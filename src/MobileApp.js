import React, { useState, useEffect } from 'react';


import Peer from "simple-peer"

import TopBar from "./components/TopBar";
import SpeechDetector from "./components/SpeechDetector";
import { emptyConfig } from './utils/MidiConstants';



import { TranscriptParser } from "./utils/TranscriptParser";

import MobileRTC from './components/MobileRTC';
import { QrReader } from 'react-qr-reader';

const transcriptParser = new TranscriptParser()


function MobileApp({ signOut }) {
  let peer
  const [transcript, setTranscript] = useState("")
  const [alternatives, setAlternatives] = useState([])
  const [listening, setListening] = useState(false)
  const [code, setCode] = useState("")
  const [connected, setConnected] = useState(false)
  const [showQr, setShowQr] = useState(false)
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: {
          exact: "environment"
        }
      }, audio: true
    })
    peer = new Peer({ initiator: false, trickle: false, config: { iceServers: [] } })
    peer.on('signal', data => {
      if (data.type === "answer") {
        setCode(btoa(JSON.stringify(data)))
      }
    })
    peer.on("connect", () => {
      setConnected(true)
    })
    peer.on("close", () => {
      window.location.reload()
    })
    peer.on("error", () => {
      window.location.reload()
      
    })
    let data = window.location.search.substring('?'.length)
    if (data) {
      data = JSON.parse(atob(data))
      peer.signal(data)
      setShowQr(true)
    }
  }, [])


  const handleQrResult = (data) => {
    if (data) {
      let offer = data.text.split("?")[1]
      offer = JSON.parse(atob(offer))
      peer.signal(offer)
      setShowQr(true)
    }
  }

  useEffect(() => {
    if (alternatives.length !== 0) {
      const final = transcriptParser.cleanupTranscript(alternatives);
      if (final) {
        // peer.send(final)
        setTranscript(final);
      }

    }
  }, [alternatives])




  return (
    <>
      {connected ?
        <div>
          <TopBar />
          <SpeechDetector setTranscript={setTranscript} setAlternatives={setAlternatives} setListening={setListening}/>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p className="pt-5 px-3 mt-5 h3 font-italic">{transcript !== "" ? `"${transcript}"` : "..."}</p>
          </div>
        </div>
        : showQr ?
          <MobileRTC code={code} />
          :
          <>
            <div className="d-flex justify-content-center">
              <p className="h3 text-secondary text-center pt-5 px-5">Scan QR code in desktop to start connection</p>
            </div>

            <QrReader onResult={handleQrResult} constraints={{ facingMode: "environment" }} />
          </>
      }
    </>
  );
}

export default MobileApp;
