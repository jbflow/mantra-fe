import { useState } from "react"
import MidiPreferences from "./MidiPreferences"
import AccountPreferences from "./AccountPreferences"

export default function Preferences() {
    const [page, setPage] = useState("account")
    return (
    <>
    <div className="voice-control-container">
     <div className="options-panel d-flex flex-column">
        <div className="d-flex flex-direction-row" style={{ borderBottom: "0.2px solid grey" }}>
          <p className="h4 p-3" >
            Preferences
          </p>
        </div>
        <p className="h5 p-3" onClick={() => setPage("midi")}>MIDI</p>
        <p className="h5 p-3" onClick={() => setPage("account")}>Account</p>
    </div>
    
    {page === "midi" && <MidiPreferences />}
    {page === "account" && <AccountPreferences />}
    </div>
    </>
    )
}

