# Mantra FE

Mantra FE is a browser-based voice control UI for a DAW. It captures wake-word and speech input, manages workflows and MIDI controls, and sends commands to the Mantra Engine for intent parsing and DAW routing.

## What’s included

- Wake-word detection and speech recognition via the Web Speech API
- MIDI input and output plumbing
- Mantra Engine integration over WebSocket
- Minimal UI to start/stop listening and view transcripts
- Workflow builder with text and MIDI actions

For final English Web Speech results, Mantra compares similar recognition alternatives using
engine intents and protocol vocabulary, with a limited bias that respects substantially higher
recognizer confidence. A few command-specific corrections are applied only when the engine
recognizes the corrected command. Interim results and other languages are unchanged.

## MVP checklist (proposed)

- [ ] Start/stop listening UI works consistently
- [ ] Wake phrase triggers command window
- [ ] Final transcript captured and displayed
- [ ] Intent parsing runs on final transcript
- [ ] Command routing to DAW socket stubbed or integrated
- [ ] Basic error handling and retry states

## Requirements

- Node.js 20+
- A Chromium-based browser (Web Speech API support)
- Microphone access enabled

> Note: Web Speech requires HTTPS in production. Localhost works without HTTPS.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` – start dev server (Turbopack)
- `npm run build` – production build
- `npm run start` – start production server
- `npm run lint` – lint
- `npm run test` – run Vitest suite

## Structure (high level)

- [src/components](src/components) – UI components
- [src/domains](src/domains) – speech, MIDI, workflow, and shared UI domains
- [tests](tests) – integration tests
