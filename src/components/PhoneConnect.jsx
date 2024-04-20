// import { Link } from 'aws-amplify-react'
import React from 'react'
import SmartPhone from "../images/smartphone.svg";

export default function PhoneConnect({connectionStatus}) {
    return (
        <div className="phone-connect d-flex flex-row">
            {/* <Link className="connect-mobile-btn row" to="/connect-phone">
                <img
                    alt=""
                    className="statusItem"
                    src={SmartPhone}
                    style={{ marginRight: "unset", height: "3rem"}}
                />
            </Link> */}
            <p className="px-2" style={{ margin: "auto" }}>{connectionStatus}</p>
        </div>
    )
}
