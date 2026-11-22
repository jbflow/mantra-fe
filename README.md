# Mantra FE

Mantra FE is a browser-based voice control UI for a DAW. This app wires wake-word detection, speech recognition, and intent parsing into a lightweight MVP interface.

## What’s included

- Wake-word detection and speech recognition via the Web Speech API
- Intent parsing engine with tests and a local demo runner
- MIDI and websocket domain plumbing
- Minimal UI to start/stop listening and view transcripts

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
- `npm run demo:intent` – run the intent engine demo

## Structure (high level)

- [src/components](src/components) – UI components
- [src/domains](src/domains) – speech, intent, midi, websocket domains
- [src/engine](src/engine) – app engine wiring
- [tests](tests) – integration tests
