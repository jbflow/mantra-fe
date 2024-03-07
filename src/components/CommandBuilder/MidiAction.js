import React, { useContext, useEffect, useState } from "react";
import { IoMdCopy } from "react-icons/io";
import "./Commands.css"
import { MidiContext } from "../../contexts/MidiContext";
import { midiType } from "../../utils/MidiConstants"
export default function MidiAction({
  index,
  data,
  midiActionChanged,
  delAction,
  duplAction,
  provided,
}) {
  const { midiOutputs, midiSettings } = useContext(MidiContext)
  const [availableOutputs, setAvailableOutputs] = useState([])
  const [port, setPort] = useState()
  const [type, setType] = useState()
  const [channel, setChannel] = useState()
  const [midiData, setMidiData] = useState()
  const [value, setValue] = useState()

  const getAvailableOutputNames = () => {
    return midiSettings.cmdPorts?.map(id => midiOutputs.find(obj => obj.id === id)?.name).filter(Boolean);
  }

  const availableMidiType = ["Note On", "Note Off", "CC", "PC"]

  const handlePortChanged = (e, i) => {
    setPort(e.target.value)
    midiActionChanged(e.target.value, type, channel, midiData, value, i)

  }

  const handleTypeChanged = (e, i) => {
    setType(e.target.value)
    midiActionChanged(port, e.target.value, channel, midiData, value, i)

  }

  const handleChannelChanged = (e, i) => {
    setChannel(e.target.value)
    midiActionChanged(port, type, e.target.value, midiData, value, i)
  }


  const handleDataChanged = (e, i) => {
    setMidiData(e.target.value)
    midiActionChanged(port, type, channel, e.target.value, value, i)

  }

  const handleValueChanged = (e, i) => {
    setValue(e.target.value)
    midiActionChanged(port, type, channel, midiData, e.target.value, i)

  }


  useEffect(() => {
    if (midiSettings && midiOutputs) {
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
              <label className="px-3 m-0">port</label>
              <select className="form-select px-3" aria-label="select a port" onChange={(e) => { handlePortChanged(e, index) }}>
                {availableOutputs.map((output) => (
                  <option key={output}>{output}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="px-3 m-0">type</label>
              <select className="form-select px-3" aria-label="select the type of midi message" onChange={(e) => { handleTypeChanged(e, index) }}>
                {availableMidiType.map((mt) => (
                  <option key={mt}>{mt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="px-3 m-0">ch</label>
              <input type="number" defaultValue="0" min="0" max="15" onChange={(e) => { handleChannelChanged(e, index) }} />
            </div>

            <div>
              <label className="px-3 m-0">data</label>
              <input type="number" defaultValue="0" min="0" max="127" onChange={(e) => { handleDataChanged(e, index) }} />

            </div>

            <div>
              <label className="px-3 m-0">value</label>
              <input type="number" defaultValue="0" min="0" max="127" onChange={(e) => { handleValueChanged(e, index) }} />
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
