import { useState, useCallback } from 'react';
import { useVoiceContext } from '../contexts/VoiceContext';

const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const { defaultVoice } = useVoiceContext();

  const speak = useCallback((text) => {
    if (!text || speaking) return;

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.voice = defaultVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speaking, defaultVoice]);

  const cancel = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [speaking]);

  return { speak, speaking, cancel };
};

export default useSpeechSynthesis;
