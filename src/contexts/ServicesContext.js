import React, { useContext } from "react";
import useMidi from "../hooks/services/useMidi";
import useSpeech from "../hooks/services/useSpeech";
import useSocket from "../hooks/services/useSocket";

export const ServicesContext = React.createContext(null);

export default function ServicesProvider({ children }) {
  const [
    midiInputOpen,
    midiOutputOpen,
    sendMIDIMessage,
    dawLink,
    config,
    confirm,
    setConfirm,
  ] = useMidi();
  const [socketDispatch, totalTime, totalCommands] = useSocket(
    sendMIDIMessage,
    config
  );
  const [isListening, transcript] = useSpeech(
    socketDispatch,
    confirm,
    setConfirm
  );

  const status = {
    midiInputOpen,
    midiOutputOpen,
    dawLink,
    isListening,
    transcript,
  };
  const usage = { totalTime, totalCommands };

  const confirmation = { confirm, setConfirm };

  return (
    <ServicesContext.Provider
      value={{ config, socketDispatch, status, usage, confirmation }}
    >
      {children}
    </ServicesContext.Provider>
  );
}
