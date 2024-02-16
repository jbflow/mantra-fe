import React, { useState, useCallback } from "react";
import QRCode from "react-qr-code";
import { QrReader } from 'react-qr-reader';


export default function DesktopRTC() {
    navigator.mediaDevices.getUserMedia({ video: true });
    const [code, setCode] = useState("")
    let localConnection = null

    const startConnection = () => {
        localConnection = new RTCPeerConnection()
        const dataChannel = localConnection.createDataChannel("dataChannel")
        dataChannel.addEventListener('open', () => {
            console.log("DATA CHANNEL OPENED")
        })
        localConnection.createOffer()
            .then((offer) => {
                setCode(window.location.origin + window.location.pathname + '?' + btoa(offer.sdp))
                localConnection.setLocalDescription(offer)
            })
    }

    const getCode = useCallback((data, error) => {
        if (data) {
            const sdp = atob(data.text)
            console.log(sdp)
            localConnection?.setRemoteDescription({ sdp, type: 'answer' })
        }
    })


    return <>

        <button onClick={startConnection}>Connect</button>
        {code &&
            <QRCode value={code} />

        }
        <div className="w-25">
            <QrReader onResult={getCode} />
        </div>
    </>
}