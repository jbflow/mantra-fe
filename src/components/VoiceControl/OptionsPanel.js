import React from 'react'
import "../../styles/VoiceControl.css"

export default function OptionsPanel() {
  return (
    <>
      <div className="options-panel d-flex flex-column">
        <div className="d-flex flex-direction-row" style={{ borderBottom: "0.2px solid grey" }}>
          <p className="h4 p-3" >
            Options
          </p>
        </div>


        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Wake word</p>
          <button className="btn-primary h-50">On</button>
        </div>


        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Continuous</p>
          <button className="btn-primary h-50">On</button>
        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">Language</p>
          <select class="form-select" aria-label="Select Language">
            <option selected>English (GB)</option>
            <option value="1">English (US)</option>
            <option value="2">English (DE)</option>
            <option value="3">English (In)</option>
          </select>

        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">MIDI Port</p>
          <select class="form-select" aria-label="Default select example">
            <option selected>Select MIDI port</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>

        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">MIDI Type</p>
          <select class="form-select" aria-label="Default select example">
            <option selected>Select MIDI port</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>

        </div>

        <div className="d-flex p-3 flex-row align-items-center justify-content-between">
          <p className="p-3 text-secondary m-0">MIDI CC/Note</p>
          <select class="form-select" aria-label="Default select example">
            <option selected>Select MIDI port</option>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>

        </div>
      </div>
    </>
  )
}
