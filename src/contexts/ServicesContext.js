import React, { useContext } from "react";
import useMidi from "../hooks/services/useMidi";
import useSpeech from "../hooks/services/useSpeech";


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


  const [isListening, transcript] = useSpeech(
    config,
    sendMIDIMessage
  );
  // Now initilize the speech to text, passing the config and sendMIDIMessage so intent detection can take place and send the message
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

  const confirmation = { confirm, setConfirm };

  return (
    <ServicesContext.Provider
      value={{ config, status, confirmation, sendMIDIMessage }}
    >
      {children}
    </ServicesContext.Provider>
  );
}
