import { MidiToJson } from "./MidiToJson";
import { testmidi1, testmidi2 } from "./testMidiData";

const composeMidiSysEx = (input) => {
	return [...[240, 0, 0, 0, 0, 0], ...input, ...[247]]
}


// let lastConfig1 = null;
// testmidi1.forEach(message => {
// 	lastConfig1 = MidiToJson(composeMidiSysEx(message), lastConfig1);
// });
// const result1 = { "tracks": ["drums", "bass", "3-Audio", "4-Audio"], "scenes": [" 1", " 2", " 3", " 4", " 5", " 6", " 7", " 8"], "devices": [], "clips": ["Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty"], "parameters": [], "instruments": ["Analog", "Collision", "Drum Rack", "Electric", "External Instrument", "Impulse", "Instrument Rack", "Operator", "Sampler", "Simpler", "Tension", "Wavetable"], "audio_devices": ["Amp", "Audio Effect Rack", "Auto Filter", "Auto Pan", "Beat Repeat", "Cabinet", "Channel EQ", "Chorus", "Compressor", "Corpus", "Delay", "Drum Buss", "Dynamic Tube", "Echo", "EQ Eight", "EQ Three", "Erosion", "External Audio Effect", "Filter Delay", "Flanger", "Frequency Shifter", "Gate", "Glue Compressor", "Grain Delay", "Limiter", "Looper", "Multiband Dynamics", "Overdrive", "Pedal", "Phaser", "Redux", "Resonators", "Reverb", "Saturator", "Spectrum", "Tuner", "Utility", "Vinyl Distortion", "Vocoder"], "midi_devices": ["Arpeggiator", "Chord", "MIDI Effect Rack", "Note Length", "Pitch", "Random", "Scale", "Velocity"], "sel_track": 2, "sel_device": null };
// console.log('result1: ', result1);
// console.log('lastConfig1: ', lastConfig1);
// console.log("passed1:", JSON.stringify(lastConfig1) === JSON.stringify(result1))


let lastConfig2 = null;
testmidi2.forEach(message => {
	lastConfig2 = MidiToJson(composeMidiSysEx(message), lastConfig2);
});

const result2 = { "tracks": ["rename track", "drums", "synth"], "scenes": [" 1", " 2", " 3", " 4", " 5", " 6", " 7", " 8"], "devices": [["Compressor", "EQ Eight"], ["Amp"], ["Ext. Audio Effect", "Filter Delay"]], "clips": [["Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty"], ["intro", "potato", "verse drum", "out drum", "Empty", "Empty", "Empty", "Empty"], ["Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty", "Empty"]], "parameters": [[["Device On", "Amp Type", "Bass", "Middle", "Treble", "Presence", "Gain", "Volume", "Dual Mono", "Dry/Wet"], ["Device On", "Cabinet Type", "Microphone Type", "Microphone Position", "Dual Mono", "Dry/Wet"]], [["Device On", "Delay Mode", "Link", "Ping Pong", "L Sync", "R Sync", "L Time", "R Time", "L 16th", "R 16th", "L Offset", "R Offset", "Feedback", "Freeze", "Filter On", "Filter Freq", "Filter Width", "Mod Freq", "Dly < Mod", "Filter < Mod", "Dry/Wet"], ["Device On", "Resonance Type", "Resonator Quality", "Tune", "Transpose", "Fine", "Spread", "Decay", "Material", "Radius", "Brightness", "Inharmonics", "Opening", "Ratio", "Hit", "Listening L", "Listening R", "LFO On/Off", "LFO Shape", "LFO Sync", "LFO Rate", "LFO Sync Rate", "LFO Stereo Mode", "Spin", "Phase", "Offset", "LFO Amount", "Filter On/Off", "Mid Freq", "Width", "MIDI Frequency", "MIDI Mode", "PB Range", "Note Off", "Off Decay", "Gain", "Width", "Bleed", "Dry Wet"]], [["Device On", "Threshold", "Ratio", "Expansion Ratio", "Attack", "Release", "Auto Release On/Off", "Output Gain", "Makeup", "Dry/Wet", "Model", "Env Mode", "Knee", "LookAhead", "S/C Listen", "S/C On", "S/C Gain", "S/C Mix", "S/C EQ Type", "S/C EQ On", "S/C EQ Freq", "S/C EQ Gain", "S/C EQ Q"]], [["Device On", "Dry/Wet", "Output Gain", "Input Gain"], ["Device On", "1 Input On", "1 Filter On", "1 Filter Freq", "1 Filter Width", "1 Delay Mode", "1 Beat Delay", "1 Beat Swing", "1 Time Delay", "1 Feedback", "1 Pan", "1 Volume", "2 Input On", "2 Filter On", "2 Filter Freq", "2 Filter Width", "2 Delay Mode", "2 Beat Delay", "2 Beat Swing", "2 Time Delay", "2 Feedback", "2 Pan", "2 Volume", "3 Input On", "3 Filter On", "3 Filter Freq", "3 Filter Width", "3 Delay Mode", "3 Beat Delay", "3 Beat Swing", "3 Time Delay", "3 Feedback", "3 Pan", "3 Volume", "Dry"]]], "instruments": ["Collision", "Drum Rack", "Electric", "External Instrument", "Impulse", "Instrument Rack", "Operator", "Sampler", "Simpler", "Tension", "Wavetable"], "audio_devices": ["Audio Effect Rack", "Auto Filter", "Auto Pan", "Beat Repeat", "Cabinet", "Channel EQ", "Chorus", "Compressor", "Corpus", "Delay", "Drum Buss", "Dynamic Tube", "Echo", "EQ Eight", "EQ Three", "Erosion", "External Audio Effect", "Filter Delay", "Flanger", "Frequency Shifter", "Gate", "Glue Compressor", "Grain Delay", "Limiter", "Looper", "Multiband Dynamics", "Overdrive", "Pedal", "Phaser", "Redux", "Resonators", "Reverb", "Saturator", "Spectrum", "Tuner", "Utility", "Vinyl Distortion", "Vocoder"], "midi_devices": ["Chord", "MIDI Effect Rack", "Note Length", "Pitch", "Random", "Scale", "Velocity"], "sel_track": 2, "sel_device": null }

console.log('result2: ', result2);
console.log('lastConfig2: ', lastConfig2);
console.log("passed2:", JSON.stringify(lastConfig2) === JSON.stringify(result2))
