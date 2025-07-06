import { useState } from "react"
import MidiPreferences from "./MidiPreferences"


export default function Preferences() {
  const [page, setPage] = useState("account")
  return (
    <>
      <div className="voice-control-container">
        <div>
          <div className="options-panel d-flex flex-column">
            <p className="p-3" onClick={() => setPage("midi")}>MIDI</p>
            <p className="p-3" onClick={() => setPage("account")}>Account</p>
          </div>
        </div>

        {page === "midi" && <MidiPreferences />}
      </div>
    </>
  )
}

