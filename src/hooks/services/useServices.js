import { useState } from "react";
import useMidi from "./useMidi";
import useSpeech from "./useSpeech";
import useSocket from "./useSocket";
import { emptyConfig } from "../../utils/MidiConstants";

export default function useServices(userId) {
  const [config, setConfig] = useState(emptyConfig);
  const [midiInputOpen, midiOutputOpen, sendMIDIMessage] = useMidi(
    config,
    setConfig
  );
  const [websocket, lastSubject] = useSocket(sendMIDIMessage);
  const [isListening, transcript] = useSpeech(
    websocket,
    config,
    userId,
    lastSubject
  );
  return [
    config,
    midiInputOpen,
    midiOutputOpen,
    websocket,
    isListening,
    transcript,
  ];
}
