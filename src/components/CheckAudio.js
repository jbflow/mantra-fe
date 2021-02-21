import React from "react";
import { Howl } from "howler";

let audioCtx
try {
	audioCtx = new AudioContext();
	console.log('audioCtx: ', audioCtx);
	if (audioCtx.state !== 'running') {
		console.log("blocked, show alert")
	} else {
		console.log("should be able to play")
	}
} catch (error) {
	console.log('AudioContext error: ', error);
}


let emtpy
try {
	emtpy = new Howl({ src: ['/sounds/Audience.mp3'] })
} catch (error) {
	console.log('holer init error: ', error);

}

export default function CheckAudio({ signOut }) {
	try {
		if (!emtpy.playing()) emtpy.play();
		console.log('emtpy: ', emtpy);
	} catch (error) {
		console.log('HOWL error: ', error);
	}
	return <>
	</>
}