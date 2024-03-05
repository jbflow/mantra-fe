import React, { useContext, useEffect, useState } from "react";
import { IoMdCopy } from "react-icons/io";
import "./Commands.css"
import { MidiContext } from "../../contexts/MidiContext";
export default function MidiAction({
  index,
  data,
  actionChanged,
  delAction,
  duplAction,
  provided,
}) {
  const {midiOutputs, midiSettings} = useContext(MidiContext)
  const [availableOutputs, setAvailableOutputs] = useState([])


  const getAvailableOutputNames = () => {
    return midiSettings.cmdPorts.map(id => midiOutputs.find(obj => obj.id === id)?.name).filter(Boolean);
  }


  useEffect(() => {
    if(midiSettings && midiOutputs){
      setAvailableOutputs(getAvailableOutputNames())
    }
  }, [midiSettings, midiOutputs])
  return (
    <>
      <div className="action-container">
        <div className="action-input">
          <div className="action-icon">
            <img alt="" src="./images/menu-icons/midi.svg" />
          </div>
          <div className="action-grab" {...provided.dragHandleProps}>
            <img alt="" src="./images/menu-icons/grip.svg" />
          </div>

          <div className="midi-action">
            <div>
              <label className="px-3">port</label>
              <select className="form-select px-3" aria-label="Default select example">
                {availableOutputs.map((output) => (
                  <option key={output}>{output}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="px-3">ch</label>
              <select className="form-select px-3" aria-label="Default select example">
                <option>-</option>
              </select>
            </div>

            <div>
              <label className="px-3">type</label>
              <select className="form-select px-3" aria-label="Default select example">
                <option>-</option>
              </select>
            </div>

            <div>
              <label className="px-3">data</label>
              <select className="form-select px-3" aria-label="Default select example">
                <option>-</option>
              </select>
            </div>

            <div>
              <label className="px-3">value</label>
              <select className="form-select px-3" aria-label="Default select example">
                <option>-</option>
              </select>
            </div>
          </div>







        </div>
        <div>
          <div
            className="cmd-button cmd-button-dupl"
            onClick={() => {
              duplAction(index);
            }}
          >
            <IoMdCopy />
          </div>
          <div
            className="cmd-button cmd-button-close"
            onClick={() => {
              delAction(index);
            }}
          >
            <img alt="" className="close-button" src="./images/menu-icons/close.svg" />
          </div>
        </div>
      </div>
    </>
  );
}
