import { describe, expect, it } from 'vitest';
import { musicalVocabulary, normalizeSpeechTranscript } from './musicalNormalization';

describe('musical speech vocabulary', () => {
  it('covers representative production and theory terms and their plural forms', () => {
    expect(musicalVocabulary).toEqual(expect.arrayContaining([
      'cellos', 'drum machines', 'oscillators', 'low pass filters', 'envelopes',
      'compressors', 'midi controllers', 'sequencers', 'chord progressions',
      'semitones', 'triplets', 'automation lanes', 'devices', 'racks',
    ]));
  });

  it.each([
    ['add a saw tooth oscillator to the synth', 'add a sawtooth oscillator to the synth'],
    ['change the sign wave on the oscillator', 'change the sine wave on the oscillator'],
    ['adjust the hi pass filter on the track', 'adjust the high pass filter on the track'],
    ['load two oscillaters into the synthesiser', 'load two oscillators into the synthesizer'],
    ['add an arpegiator to the midi track', 'add an arpeggiator to the midi track'],
    ['add re verb effect to the vocal track', 'add reverb effect to the vocal track'],
    ['adjust the side chain compression on the track', 'adjust the sidechain compression on the track'],
    ['move the notes in the piano role', 'move the notes in the piano roll'],
    ['create a mid ee track', 'create a MIDI track'],
    ['change the cord progression on the piano', 'change the chord progression on the piano'],
    ['transpose the bass guitar by two semi tones', 'transpose the bass guitar by two semitones'],
    ['quant eyes the midi clips', 'quantize the midi clips'],
    ['humanise the midi notes', 'humanize the midi notes'],
  ])('normalizes contextual musical speech: %s', (input, expected) => {
    expect(normalizeSpeechTranscript(input)).toBe(expected);
  });

  it.each([
    'I bought a high hat',
    'the sign wave was on the beach',
    'change the sign on the road',
    'move the base',
    'create a middle track',
    'quant eyes everything',
    'rename track one to high hat',
    'create a track called piano role',
    'load the preset named oscillater',
    'add "sign wave" to the track',
    'mute the high hat shop',
  ])('preserves ordinary speech and names: %s', (text) => {
    expect(normalizeSpeechTranscript(text)).toBe(text);
  });
});
