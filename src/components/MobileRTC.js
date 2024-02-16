import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";


export default function MobileRTC() {
    navigator.mediaDevices.getUserMedia({ video: true });
    const [code, setCode] = useState("")
    useEffect(() => {
        const remoteConnection = new RTCPeerConnection()
        const dataChannel = remoteConnection.createDataChannel("dataChannel")
        const sdp = atob(window.location.search.substring('?'.length))
        remoteConnection.setRemoteDescription({ sdp, type: 'offer' });
        remoteConnection.createAnswer().then((answer) => {
            remoteConnection.setLocalDescription(answer)
            setCode(btoa(answer.sdp))

        })

    }, [])


    return <>
        <div class="px-5 py-5">
            {code && <QRCode value={code} />}
        </div>
    </>
}