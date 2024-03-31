import { Link } from 'aws-amplify-react'
import React from 'react'

export default function PhoneConnect() {
    return (
        <div className="d-flex flex-row">
            <Link className="connect-mobile-btn row" to="/connect-phone">
                <img
                    alt=""
                    className="statusItem"
                    src={SmartPhone}
                    style={{ marginRight: "unset", height: "3rem", filter: "invert(100%) sepia(0%) saturate(0%) hue-rotate(108deg) brightness(110%) contrast(101%)" }}
                />
            </Link>
            <p className="text-white px-4" style={{ margin: "auto" }}>{connectionStatus}</p>
        </div>
    )
}
