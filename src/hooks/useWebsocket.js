import { useEffect, useState, useRef, useCallback } from 'react';
import pako from 'pako';

import useSpeechSynthesis from './useSpeechSynthesis';

import { arraysEqual, getRandomResponse } from '../utils/utils';
import { STATUS_BYTES, emptyConfig } from "../utils/MidiConstants";
import { MANUFACTURER_ID } from "../intent_detection/constants";

const useWebSocket = (baseUrl, startTimer, setConfirmation, setConfigTimer, configRef, dawLink, setDawLink, runningWorkflow, startPort = 39031, endPort = 39038, retryInterval = 10000) => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [currentPort, setCurrentPort] = useState(startPort);

  const wsRef = useRef(null);
  const retryTimeout = useRef(null);

  const { speak } = useSpeechSynthesis()

  const handleSocketMessage = (message) => {
    /*/
    Websocket Entry Point - messages from Ableton Live Python come in here
   /*/


    if (message) {
      if (Array.isArray(message)) {
        // If the message is an array - then it is a command
        const init = [STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 127, STATUS_BYTES.sysex_end];
        if (arraysEqual(init, Array.from(message))) { // If Live Remote Script sends Init SysEx handshake
          configRef.current = { ...emptyConfig }
          startTimer()

        }

        else if (message[6] === 96) { // If confirmation
          console.log("Confirmation message received")
          let data = Array.from(message)
          if (message[message.length - 2] === 0 && !runningWorkflow) {
            speak(getRandomResponse())
          }
          else {
            data.splice(message.length - 2, 1)
            setConfirmation(data)
          }
          startTimer()
        }


      }
      else {
        // Otherwise it's a dictionary config message
        setConfigTimer(0)
        let existingConfig = JSON.parse(sessionStorage.getItem("config"))
        let updatedConfig = {
          ...existingConfig,
          ...message
        }
        configRef.current = updatedConfig
        sessionStorage.setItem("config", JSON.stringify(updatedConfig))
        if (!dawLink) {
          setDawLink(true)
        }
      }
    }
  }





  const connectWebSocket = useCallback(() => {
    const url = `${baseUrl}:${currentPort}`;
    console.log(`Attempting to connect to WebSocket at ${url}`);
    const websocket = new WebSocket(url);
    websocket.binaryType = 'arraybuffer';  // Set binary type to handle binary data

    websocket.onopen = () => {
      console.log('WebSocket connection opened');
      setIsConnected(true);
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
        retryTimeout.current = null;
      }
    };

    websocket.onmessage = (event) => {
      console.log('Message received from server:', event.data);
      try {
        // Decompress the received message using pako library
        const inflatedData = pako.inflate(new Uint8Array(event.data), { to: 'string' });
        console.log('Decompressed data:', JSON.parse(inflatedData));
        setMessages(JSON.parse(inflatedData));
      } catch (e) {
        console.error('Failed to decompress message data:', e);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      setIsConnected(false);
      sessionStorage.removeItem("config")
      if (currentPort < endPort) {
        setCurrentPort(currentPort + 1);
      } else {
        setCurrentPort(startPort);
      }
      retryConnection();
    };

    setWs(websocket);
    wsRef.current = websocket;
  }, [baseUrl, currentPort, endPort, startPort]);

  const retryConnection = useCallback(() => {
    if (!retryTimeout.current) {
      retryTimeout.current = setTimeout(() => {
        console.log('Retrying WebSocket connection...');
        connectWebSocket();
      }, retryInterval);
    }
  }, [connectWebSocket, retryInterval]);


  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('Sending message:', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not open. ReadyState:', wsRef.current.readyState);
    }
  };

  const manualConnect = () => {
    if (!isConnected) {
      connectWebSocket();
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0) {
      for (let msg of messages) {
        handleSocketMessage(msg)
      }
    }

  }, [messages]);

  useEffect(() => {
    // When the web socket connects, init the config transfer by sending sysex handshake
    if (isConnected) {
      sendMessage([STATUS_BYTES.sysex_start, ...MANUFACTURER_ID, 1, STATUS_BYTES.sysex_end])
    }
  }, [isConnected])




  return {

    sendMessage,
    isConnected,
    manualConnect,

  };
};

export default useWebSocket;
