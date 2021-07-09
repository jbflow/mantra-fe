import useMidi from "./useMidi";
import useSpeech from "./useSpeech";
import useSocket from "./useSocket";

export default function useServices(userId) {
  const [midiInputOpen, midiOutputOpen, sendMIDIMessage, dawLink, config] =
    useMidi();
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
    dawLink,
    websocket,
    isListening,
    transcript,
  ];
}
