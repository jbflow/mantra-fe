import { useRef, useEffect, useState, useCallback } from 'react';


const useEventCallback = (fn, dependencies) => {
  const ref = useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  useEffect(() => {
    ref.current = fn;
  }, [fn, ...dependencies]);

  return useCallback((args) => {
    const fn = ref.current;
    return fn(args);
  }, [ref]);
};

const useSpeechRecognition = (props = {}) => {
  const { onEnd = () => {}, onResult = () => {}, onError = () => {} } = props;
  const recognition = useRef(null);
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);




  const handleError = (event) => {
    if (event.error === 'not-allowed') {
      recognition.current.onend = () => {};
      setListening(false);
    }
    onError(event);
  };

  const stop = useEventCallback(() => {
    if (!listening || !supported) return;
    recognition.current.onresult = () => {};
    recognition.current.onend = () => {};
    recognition.current.onerror = () => {};
    setListening(false);
    recognition.current.stop();
    onEnd();
  }, [listening, supported, recognition, onEnd]);

  const listen = useEventCallback((args = {}) => {
    if (listening || !supported) return;
    const {
      lang = '',
      interimResults = false,
      continuous = true,
      maxAlternatives = 20,
      grammars,
    } = args;
    setListening(true);
    recognition.current.lang = lang;
    recognition.current.interimResults = interimResults;
    recognition.current.onresult = (result) => {onResult(result, stop)}
    recognition.current.onerror = handleError;
    recognition.current.continuous = continuous;
    recognition.current.maxAlternatives = maxAlternatives;
    if (grammars) {
      recognition.current.grammars = grammars;
    }
    
  }, [listening, supported, recognition]);

  

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (window.SpeechRecognition) {
      setSupported(true);
      recognition.current = new window.SpeechRecognition();
    }
  }, []);

  return {
    listen,
    listening,
    stop,
    supported,
  };
};

export default useSpeechRecognition;