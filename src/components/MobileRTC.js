import React from "react";
import QRCode from "react-qr-code";




export default function MobileRTC({ code }) {
    return (
        <>
            <div className="d-flex justify-content-center">
                <p className="h3 text-secondary text-center pt-5 px-5">Scan QR code with computer to complete connection</p>
            </div>
            <div className="px-5 py-5 w-100 h-auto">
                {code && <QRCode value={code} style={{ width: "100%", height: "auto" }} />}
            </div>
        </>
    )
}