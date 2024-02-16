import React, { useState } from "react";
import QRCode from "react-qr-code";
import { QrReader } from 'react-qr-reader';
import Peer from "simple-peer"







export default function DesktopRTC() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    let peer = null
    const [code, setCode] = useState("")
    const startConnection = () => {
        peer = new Peer({ initiator: true, trickle: false, config: { iceServers: [] }})
        peer.on('signal', data => {
            if (data.type === "offer") {
                console.log(data)
                setCode(window.location.origin + window.location.pathname + '?' + btoa(JSON.stringify(data))
                )
            }

        })
        peer.on("connect", () => {
            console.log("CONNECTED")

        })
        peer.on("data", (data) => {
            console.log(data)

        })


    }
    const handleQrResult = (data) => {
        
        if (data) {
            console.log("DATA", data.text)
            console.log(JSON.parse(atob(data.text)))
            peer?.signal(JSON.parse(atob(data.text)))
        }
    }

    


    return <>

        <button onClick={startConnection}>Connect</button>
        {code &&
            <QRCode value={code} />

        }
        <div className="w-25">
            <QrReader onResult={handleQrResult} />
        </div>

    </>
}