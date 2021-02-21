import React from "react";
import { Howl } from "howler";
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