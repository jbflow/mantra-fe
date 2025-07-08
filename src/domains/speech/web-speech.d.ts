/* Minimal ambient declarations for Web Speech API
   (Only what RecognitionService & tests need.) */

declare class SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
}

interface Window {
  SpeechRecognition?: {
    new(): SpeechRecognition;
  };
  webkitSpeechRecognition?: {
    new(): SpeechRecognition;
  };
}
