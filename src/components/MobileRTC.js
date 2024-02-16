import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

import Peer from "simple-peer"



export default function MobileRTC() {

    const [code, setCode] = useState("")

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        const peer = new Peer({ initiator: false, trickle: false, config: { iceServers: [] }})
        console.log(peer)
        const data = JSON.parse(atob(window.location.search.substring('?'.length)))
        console.log("DATA: ", data)
        peer.signal(data)

        peer.on('signal', data => {
            console.log("SIGNAL DATA", data)
            if (data.type === "answer") {
                console.log("DATA", data)
                setCode(btoa(JSON.stringify(data)))
            }
        })
        peer.on("connect", () => {
            peer.send("HELLO DESKTOP APP")
        })

    }, [])





    return <>
        <div className="px-5 py-5">
            {code && <QRCode value={code} />}
        </div>
        <input id="messageInputBox"></input>
        <button>SEND</button>
    </>
}