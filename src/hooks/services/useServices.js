import useMidi from "./useMidi";
import useSpeech from "./useSpeech";
import useSocket from "./useSocket";

export default function useServices(userId) {
  const [midiInputOpen, midiOutputOpen, sendMIDIMessage, dawLink, config] =
    useMidi();
  const [websocket, lastSubject, totalTime, totalCommands] =
    useSocket(sendMIDIMessage);
  const [isListening, transcript] = useSpeech(
    websocket,
    config,
    userId,
    lastSubject
  );

  const status = {
    midiInputOpen,
    midiOutputOpen,
    dawLink,
    isListening,
    transcript,
  };
  const usage = { totalTime, totalCommands };

  return {
    config,
    websocket,
    status,
    usage,
  };
}
