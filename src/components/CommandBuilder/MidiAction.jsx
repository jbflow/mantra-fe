import React, { useContext } from "react";
import { IoMdCopy } from "react-icons/io";
import "./Commands.css"
import { MidiContext } from "../../contexts/MidiContext";
export default function MidiAction({
  index,
  port,
  channel,
  type,
  data,
  value,
  handlePortChanged,
  handleChannelChanged,
  handleTypeChanged,
  handleDataChanged,
  handleValueChanged,
  delAction,
  duplicateAction,
  provided,
}) {
  const { midiOutputs, midiSettings } = useContext(MidiContext)
  const availableMidiType = ["Note On", "Note Off", "CC", "PC"]
  const availableOutputs = midiSettings.cmdPorts?.map(id => midiOutputs.find(obj => obj.id === id)?.name).filter(Boolean);

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
              <label className="px-3 m-0">port</label>
              <select className="form-select px-3" aria-label="select a port" onChange={(e) => { handlePortChanged(e, index) }} defaultValue={port}>
                {availableOutputs.map((output) => (
                  <option key={output}>{output}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="px-3 m-0">type</label>
              <select className="form-select px-3" aria-label="select the type of midi message" onChange={(e) => { handleTypeChanged(e, index) }} defaultValue={type}>
                {availableMidiType.map((mt) => (
                  <option key={mt}>{mt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="px-3 m-0">ch</label>
              <input type="number" min="0" max="15" onChange={(e) => { handleChannelChanged(e, index) }} defaultValue={channel} />
            </div>

            <div>
              <label className="px-3 m-0">data</label>
              <input type="number" min="0" max="127" onChange={(e) => { handleDataChanged(e, index) }} defaultValue={data} />

            </div>

            <div>
              <label className="px-3 m-0">value</label>
              <input type="number" min="0" max="127" onChange={(e) => { handleValueChanged(e, index) }} defaultValue={value} />
            </div>
          </div>
        </div>
        <div>
          <div
            className="cmd-button cmd-button-dupl"
            onClick={() => {
              duplicateAction(index);
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
