import React, { useContext } from "react";
import useMidi from "../hooks/services/useMidi";
import useSpeech from "../hooks/services/useSpeech";
import useSocket from "../hooks/services/useSocket";

export const ServicesContext = React.createContext(null);

export default function ServicesProvider({ children }) {
  // Start setting up the services
  const [
    midiInputOpen,
    midiOutputOpen,
    sendMIDIMessage,
    dawLink,
    config,
    confirm,
    setConfirm,
  ] = useMidi();

  // First initilaize the MIDI. midiInputOpen, midiOutputOpen and dawLink are used in the status bar.
  // sendMIDIMessage sends MIDI to the open talkback output MIDI port.
  // config is the global state for the config, it is updated via MidiToJson utility when a config MIDI message is received
  // confirm and setConfirm are used by the command/macro builder and later the TTS confirmation.
  // They store the confirmation MIDI from Ableton and are used to notify it's safe to send the next macro voice action.

  const [socketDispatch, totalTime, totalCommands] = useSocket(
    sendMIDIMessage,
    config
  );

  // Now open the websocket, passing the config and the MIDI send function.
  // The config is passed to socketDispatch to be sent to the backend with speech.
  // totalTime and totalCommands com back from the backend to update the dashboard
  // they may be removed and set elsewhere as necessary
  // sendMIDIMessage is used to send the MIDI that is received from the backend over the socket.

  const [isListening, transcript] = useSpeech(
    socketDispatch,
    confirm,
    setConfirm
  );
  // Now initilize the speech to text, passing socketDispatch so the transcription can be sent to the backend.
  // confirm and setConfirm are used by the useCommands hook internally, if the transcription matches one of the
  // User macro commands, depending on user specification the actions can all be sent to the backened together.
  // Or the actions can be sent subsequently, every time a confirmation message comes back from Ableton.
  // In this way it is possible to have some actions that depend on previous actions having completed.

  // Below objects are built for all aspects of the services that need to be stored in context, so they can be accessed
  // in the relevent components.
  const status = {
    midiInputOpen,
    midiOutputOpen,
    dawLink,
    isListening,
    transcript,
  };
  const usage = { totalTime, totalCommands }; // << This may become redundant, this data could be updated directly on the UsageContext.

  const confirmation = { confirm, setConfirm };

  return (
    <ServicesContext.Provider
      value={{ config, socketDispatch, status, usage, confirmation }}
    >
      {children}
    </ServicesContext.Provider>
  );
}
