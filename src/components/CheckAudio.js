import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";



export default function CheckAudio({ signOut }) {
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		let audioCtx
		try {
			audioCtx = new AudioContext();
			console.log('audioCtx: ', audioCtx);
			if (audioCtx.state !== 'running') {
				console.log("blocked, show alert")
				setShowModal(true);
			} else {
				console.log("should be able to play")
			}
		} catch (error) {
			console.log('AudioContext error: ', error);
		}
	})

	const handleClose = () => {
		setShowModal(false);
	}

	return <>
		{showModal &&
			(
				<Modal.Dialog>
					<Modal.Header closeButton>
						<Modal.Title>Audio playback</Modal.Title>
					</Modal.Header>

					<Modal.Body>
						<p>TLKBCK will play audio</p>
					</Modal.Body>

					<Modal.Footer>
						<Button variant="primary" onClick={() => setShowModal(false)}>OK</Button>
					</Modal.Footer>
				</Modal.Dialog>
			)
		}
	</>
}