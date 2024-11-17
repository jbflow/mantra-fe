import React, { createContext, useState, useEffect } from 'react';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [voices, setVoices] = useState([]);
  const [defaultVoice, setDefaultVoice] = useState(null);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const googleUKEnglishMale = availableVoices.find(voice => voice.name === 'Google UK English Male');
      setVoices(availableVoices);
      setDefaultVoice(googleUKEnglishMale || availableVoices[0]);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return (
    <VoiceContext.Provider value={{ voices, defaultVoice }}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoiceContext = () => React.useContext(VoiceContext);
