import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { QrReader } from 'react-qr-reader';


export default function DesktopRTC({ code, handleQrResult, startConnection }) {
    useEffect(() => {
        startConnection()
    }, [])
    return <>
        <div className="d-flex justify-content-center">
            <p className="h3 text-secondary px-5 pt-3">Scan the QR Code with your phone then follow instructions to connect</p>
        </div>
        <div className="d-flex flex-row justify-content-around px-5">
            {code && <QRCode value={code} style={{ width: "22.5rem", height: "auto" }} />}
            <div style={{ width: "30rem" }}>
                <QrReader onResult={handleQrResult} />
            </div>
        </div>

    </>
}