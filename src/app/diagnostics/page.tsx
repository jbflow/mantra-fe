'use client';

import { useEffect, useRef, useState } from 'react';
import { WakeWordDetector } from '@/domains/speech/WakeWordDetector';
import { RecognitionService } from '@/domains/speech/RecognitionService';
import { parseTextToIntents } from 'mantra-engine';

export default function Diagnostics() {
  const [wakeStatus, setWakeStatus] = useState('Not started');
  const [speechStatus, setSpeechStatus] = useState('Ready');
  const [transcript, setTranscript] = useState('');
  const [nlpResult, setNlpResult] = useState('');
  const [isWakeTesting, setIsWakeTesting] = useState(false);
  const [isSpeechTesting, setIsSpeechTesting] = useState(false);
  const wakeRef = useRef<WakeWordDetector | null>(null);
  const recRef = useRef<RecognitionService | null>(null);

  useEffect(() => {
    return () => {
      wakeRef.current?.stop();
      recRef.current?.dispose();
    };
  }, []);

  const startWakeTest = () => {
    if (!wakeRef.current) {
      try {
        const wake = new WakeWordDetector({ hotword: 'bumblebee' });
        wake.on('wake', (hotword) => {
          setWakeStatus(`✅ WAKE WORD DETECTED: "${hotword}"`);
        });
        wake.on('error', (err) => {
          setWakeStatus(`❌ Wake error: ${err.message}`);
        });
        wakeRef.current = wake;
      } catch (err) {
        setWakeStatus(`❌ Failed to initialize: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }

    if (isWakeTesting) {
      wakeRef.current?.stop();
      setWakeStatus('Stopped');
      setIsWakeTesting(false);
    } else {
      wakeRef.current?.start();
      setWakeStatus('Listening for "bumblebee"... say the wake word now');
      setIsWakeTesting(true);
    }
  };

  const startSpeechTest = async () => {
    if (!recRef.current) {
      try {
        const rec = new RecognitionService({ lang: 'en-US' });
        rec.on('partial', (text) => {
          setTranscript(`(partial) ${text}`);
        });
        rec.on('final', (text) => {
          setTranscript(`(final) ${text}`);
          setSpeechStatus('Ready');
          setIsSpeechTesting(false);
          // Test NLP
          const result = parseTextToIntents(text);
          if (result.errors?.length) {
            setNlpResult(`Errors: ${result.errors.join(', ')}`);
          } else {
            setNlpResult(`${result.intents.length} intent(s): ${result.intents.map((i) => `${i.domain}:${JSON.stringify(i.intent)}`).join(' | ')}`);
          }
        });
        rec.on('error', (err) => {
          setSpeechStatus(`❌ Error: ${err.message}`);
          setIsSpeechTesting(false);
        });
        recRef.current = rec;
      } catch (err) {
        setSpeechStatus(`❌ Failed to initialize: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }

    if (isSpeechTesting) {
      recRef.current?.stop();
      setSpeechStatus('Ready');
      setIsSpeechTesting(false);
    } else {
      try {
        await recRef.current?.start();
        setSpeechStatus('Listening... speak a command now');
        setTranscript('');
        setNlpResult('');
        setIsSpeechTesting(true);
      } catch (err) {
        setSpeechStatus(`❌ Failed to start: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Mantra Frontend Diagnostics</h1>

      <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>🎤 Wake Word Detector</h2>
        <p>Status: <code style={{ background: '#f0f0f0', padding: '0.5rem' }}>{wakeStatus}</code></p>
        <button
          onClick={startWakeTest}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: isWakeTesting ? '#ff6b6b' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isWakeTesting ? 'Stop Wake Test' : 'Start Wake Test'}
        </button>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Will listen for "bumblebee" using Web Speech API
        </p>
      </section>

      <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>🗣️ Speech Recognition</h2>
        <p>Status: <code style={{ background: '#f0f0f0', padding: '0.5rem' }}>{speechStatus}</code></p>
        <button
          onClick={startSpeechTest}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            background: isSpeechTesting ? '#ff6b6b' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isSpeechTesting ? 'Stop Speech Test' : 'Start Speech Test'}
        </button>
        <div style={{ marginTop: '1rem', background: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
          <p><strong>Transcript:</strong></p>
          <code>{transcript || '(waiting for speech...)'}</code>
        </div>
      </section>

      <section style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem' }}>
        <h2>🧠 NLP Intent Parsing</h2>
        <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px' }}>
          <p><strong>Last parsed intent:</strong></p>
          <code>{nlpResult || '(no intents parsed yet)'}</code>
        </div>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Recognized commands: play, stop, set tempo to [BPM], mute, unmute
        </p>
      </section>

      <section style={{ background: '#f0f7ff', padding: '1rem', borderRadius: '4px' }}>
        <h3>How to test:</h3>
        <ol>
          <li>Click "Start Wake Test" and say "bumblebee" into your microphone</li>
          <li>Click "Start Speech Test" and say a command like "play" or "set tempo to 120"</li>
          <li>Check the transcript and NLP result below</li>
        </ol>
        <p><strong>Requirements:</strong></p>
        <ul>
          <li>✅ Chrome, Edge, Safari (Web Speech API support)</li>
          <li>✅ HTTPS or localhost (some browsers require this)</li>
          <li>✅ Microphone permission granted</li>
        </ul>
      </section>
    </div>
  );
}
