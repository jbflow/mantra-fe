import { useState, useEffect, useCallback } from 'react';

const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const googleUKEnglishMale = voices.find(voice => voice.name === 'Google UK English Male');

      setSelectedVoice(googleUKEnglishMale || voices.find(voice => voice.default) || voices[0]);
    };

    // Load voices immediately if available; otherwise, listen for voiceschanged
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null; // Clean up listener on unmount
    };
  }, []);

  const speak = useCallback((text) => {
    if (!text || speaking || !selectedVoice) return;



    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [speaking, selectedVoice]);

  const cancel = useCallback(() => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [speaking]);

  return { speak, speaking, cancel };
};

export default useSpeechSynthesis;
