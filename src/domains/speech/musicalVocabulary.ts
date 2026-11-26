// Speech vocabulary is independent of the protocol: entries are recognition hints,
// not a claim that the intent parser supports every term.
export const musicalNouns = [
  // Instruments and sources
  'acoustic guitar', 'bass guitar', 'electric piano', 'grand piano', 'piano', 'keyboard',
  'organ', 'synthesizer', 'synth', 'sampler', 'drum machine', 'drum kit', 'drum', 'kick',
  'snare', 'hihat', 'hi hat', 'high hat', 'cymbal', 'clap', 'tom', 'percussion', 'vocal', 'voice', 'choir',
  'violin', 'viola', 'cello', 'double bass', 'flute', 'saxophone', 'trumpet', 'trombone',
  'clarinet', 'harp', 'ukulele', 'mandolin', 'banjo', 'microphone', 'audio sample',
  // Synthesis and modulation
  'oscillator', 'waveform', 'sine wave', 'sawtooth wave', 'square wave', 'triangle wave',
  'pulse wave', 'noise generator', 'white noise', 'pink noise', 'wavetable', 'sub oscillator',
  'synthesis', 'subtractive synthesis', 'fm synthesis', 'frequency modulation',
  'amplitude modulation', 'modulation', 'modulator', 'lfo', 'low frequency oscillator', 'envelope', 'adsr',
  'attack', 'decay', 'sustain', 'release', 'filter', 'low pass filter', 'high pass filter',
  'band pass filter', 'notch filter', 'cutoff', 'resonance', 'filter envelope',
  'pitch bend', 'portamento', 'glide', 'unison', 'detune', 'arpeggiator', 'pulse width',
  'filter sweep', 'modulation wheel', 'mod wheel', 'modulation matrix', 'ring modulation',
  'granular synthesis', 'sample and hold', 'frequency', 'hertz', 'phase',
  // Effects and mixing
  'equalizer', 'eq', 'compressor', 'compression', 'limiter', 'gate', 'noise gate',
  'expander', 'reverb', 'delay', 'echo', 'chorus', 'flanger', 'phaser', 'distortion',
  'saturation', 'overdrive', 'bitcrusher', 'transient shaper', 'sidechain', 'sidechain compression',
  'gain', 'volume', 'fader', 'panning', 'pan', 'stereo', 'mono', 'width', 'headroom',
  'clipping', 'threshold', 'ratio', 'dry wet', 'send',
  'return', 'auxiliary', 'bus', 'master bus', 'mix', 'mastering', 'meter', 'decibel',
  'gain staging', 'noise floor', 'frequency spectrum', 'high shelf', 'low shelf',
  'multiband compressor', 'parallel compression', 'ducking', 'stereo image', 'crossfade',
  // MIDI, arrangement and DAW
  'midi', 'midi controller', 'midi note', 'velocity', 'aftertouch', 'control change',
  'cc', 'piano roll', 'sequencer', 'step sequencer', 'sequence', 'arrangement', 'song',
  'composition', 'section', 'intro', 'verse', 'chorus section', 'bridge', 'outro',
  'track', 'audio track', 'midi track', 'clip', 'scene', 'region', 'loop', 'device',
  'plugin', 'instrument rack', 'effect rack', 'rack', 'chain', 'automation', 'automation lane',
  'parameter', 'preset', 'session view', 'arrangement view', 'playhead', 'timeline',
  'audio interface', 'audio input', 'audio output', 'track group', 'return track',
  'master track', 'instrument track', 'audio effect', 'plugin device', 'mixer', 'channel strip',
  'take', 'sample rate', 'buffer size', 'latency', 'routing', 'monitoring',
  // Theory and timing
  'note', 'pitch', 'pitch class', 'octave', 'semitone', 'whole tone', 'interval',
  'key signature', 'time signature', 'scale', 'major scale', 'minor scale', 'pentatonic scale',
  'chromatic scale', 'mode', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian',
  'ionian', 'locrian', 'harmony', 'chord', 'chord progression', 'triad', 'inversion',
  'arpeggio', 'melody', 'counterpoint', 'rhythm', 'beat', 'bar', 'measure', 'tempo',
  'bpm', 'metronome', 'subdivision', 'sixteenth note', 'eighth note', 'quarter note',
  'triplet', 'swing', 'syncopation', 'groove', 'downbeat', 'upbeat', 'rest', 'tie',
  'quantization', 'quantisation', 'root note', 'tonic',
  'dominant', 'subdominant', 'minor third', 'major third', 'perfect fifth', 'seventh chord',
  'suspended chord', 'diminished chord', 'augmented chord', 'in key', 'pickup',
  'polyrhythm', 'note length', 'duration', 'sustain pedal', 'tempo map',
] as const;

// Generic words such as "track" and "bass" are not sufficient to bias ordinary speech.
export const musicalContextAnchor = /\b(?:midi|synth(?:esizer|esiser|s)?|oscillators?|waveforms?|wavetable|lfo|adsr|arpeggiators?|sequencers?|quantiz(?:e|ation)|quantis(?:e|ation)|semitones?|metronome|chords?|pentatonic|mixolydian|dorian|phrygian|lydian|aeolian|ionian|locrian|reverb|compressors?|sidechain|equalizers?|equalisers?|automation|plugins?|piano roll|hihats?|bpm)\b/i;
export const productionContext = /\b(?:tracks?|clips?|notes?|guitars?|instruments?|synths?|synthesizers?|synthesisers?|oscillators?|oscillaters?|waves?|waveforms?|filters?|envelopes?|arpeggiators?|arpegiators?|sequencers?|seaquencers?|piano|midi|controllers?|compressors?|compression|signals?|inputs?|audio|mix|music|chords?|progressions?|scales?|beats?|bars?|rhythm|tempo|metronome|metro gnome|automation|effects?|devices?|racks?|plugins?|samples?|semitones?)\b/i;

export const musicalVerbs = [
  'create', 'load', 'add', 'remove', 'delete', 'adjust', 'change', 'move', 'duplicate',
  'transpose', 'quantize', 'quantise', 'modify', 'insert', 'replace', 'select', 'set',
  'increase', 'decrease', 'raise', 'lower', 'turn', 'enable', 'disable', 'mute', 'unmute',
  'solo', 'unsolo', 'arm', 'disarm', 'record', 'play', 'stop', 'loop', 'split', 'trim',
  'stretch', 'shift', 'copy', 'paste', 'cut', 'merge', 'group', 'ungroup', 'route',
  'automate', 'pan', 'fade', 'normalize', 'normalise', 'reverse', 'render', 'bounce',
  'export', 'import', 'humanize', 'humanise', 'tune', 'detune', 'modulate', 'filter',
] as const;

// Each substitution includes its own musical context, rather than globally replacing homophones.
export const musicalCorrections: ReadonlyArray<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bsaw[ -]tooth(?=\s+(?:waves?|oscillators?|waveforms?))\b/gi, replacement: 'sawtooth' },
  { pattern: /\bsign(?=\s+waves?\b)/gi, replacement: 'sine' },
  { pattern: /\b(?:low|lo)[ -]pass(?=\s+filters?\b)/gi, replacement: 'low pass' },
  { pattern: /\bhi[ -]pass(?=\s+filters?\b)/gi, replacement: 'high pass' },
  { pattern: /\bband[ -]past(?=\s+filters?\b)/gi, replacement: 'band pass' },
  { pattern: /\boscillaters\b/gi, replacement: 'oscillators' },
  { pattern: /\boscillater\b/gi, replacement: 'oscillator' },
  { pattern: /\barpegiator\b/gi, replacement: 'arpeggiator' },
  { pattern: /\barpegiators\b/gi, replacement: 'arpeggiators' },
  { pattern: /\bsynthesiser\b/gi, replacement: 'synthesizer' },
  { pattern: /\bsynthesisers\b/gi, replacement: 'synthesizers' },
  { pattern: /\bequaliser\b/gi, replacement: 'equalizer' },
  { pattern: /\bequalisers\b/gi, replacement: 'equalizers' },
  { pattern: /\bside[ -]chain(?=\s+(?:compression|compressors?|inputs?|signals?))\b/gi, replacement: 'sidechain' },
  { pattern: /\bre verb(?=\s+(?:effects?|devices?|plugins?))\b/gi, replacement: 'reverb' },
  { pattern: /\bsea?quencer\b/gi, replacement: 'sequencer' },
  { pattern: /\bsea?quencers\b/gi, replacement: 'sequencers' },
  { pattern: /\bmid ee(?=\s+(?:notes?|tracks?|clips?|controllers?)\b)/gi, replacement: 'MIDI' },
  { pattern: /\bpiano role(?=\b)/gi, replacement: 'piano roll' },
  { pattern: /\bcord(?=\s+progressions?\b)/gi, replacement: 'chord' },
  { pattern: /\bkey board(?=\s+(?:tracks?|instruments?|controllers?))\b/gi, replacement: 'keyboard' },
  { pattern: /\bbase(?=\s+guitars?\b)/gi, replacement: 'bass' },
  { pattern: /\bsemi[ -]tones\b/gi, replacement: 'semitones' },
  { pattern: /\bsemi[ -]tone\b/gi, replacement: 'semitone' },
  { pattern: /\bquant eyes\b/gi, replacement: 'quantize' },
  { pattern: /\bquantise\b/gi, replacement: 'quantize' },
  { pattern: /\bhumanise\b/gi, replacement: 'humanize' },
];
