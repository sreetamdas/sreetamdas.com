/* eslint-disable jsx-a11y/media-has-caption */
import { useRef, useEffect, RefObject } from "react";

type TImageSnapshot = {
	data: Uint8ClampedArray;
	height: number;
	width: number;
};

export const GreenScreen = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current?.getContext("2d") as CanvasRenderingContext2D;
		const video = videoRef.current;
		const constraints: MediaStreamConstraints = {
			audio: false,
			video: { width: 640, height: 480 },
		};
		function rapidRefresh(video: HTMLVideoElement, canvas: CanvasRenderingContext2D) {
			canvas.drawImage(video, 0, 0);
			processImage(canvas, canvasRef);

			setTimeout(() => {
				rapidRefresh(video, canvas);
			}, 0); // rapidly refresh ⚡
		}

		if (video !== null) {
			navigator.mediaDevices
				.getUserMedia(constraints)
				.then((mediaStream) => {
					video.srcObject = mediaStream;
					video.onloadeddata = () => {
						video.play();
						rapidRefresh(video, canvas);
					};
				})
				.catch((error) => {
					// eslint-disable-next-line no-console
					console.error({ error });
				});
		}
	}, []);

	function processImage(canvas: CanvasRenderingContext2D, canvasRef: RefObject<HTMLCanvasElement>) {
		if (canvasRef.current === null) return;

		const snapshot: TImageSnapshot = canvas.getImageData(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);

		/*
		format of snapshot's data:Uint8ClampedArray =>
		0: pixel's Red value
		1: pixel's Green value
		2: pixel's Blue value
		3: the alpha value
		*/
		const numberOfPixels = snapshot.data.length / 4;

		// Now the processing
		for (let i = 0; i < numberOfPixels; i++) {
			const red = snapshot.data[i * 4];
			const green = snapshot.data[i * 4 + 1];
			const blue = snapshot.data[i * 4 + 2];
			// const alpha = snapshot.data[i * 4 + 3];
			const colorToRemove = green;
			// higher concentration and isnt dark
			if (colorToRemove > red && colorToRemove > blue && colorToRemove > 100) {
				snapshot.data[i * 4 + 3] = 0;
			}
		}
		canvas.putImageData(snapshot, 0, 0);
		return;
	}

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gridAutoFlow: "column",
				gridGap: "1rem",
			}}
		>
			<div style={{ border: "5px solid #624de3", width: "max-content" }}>
				video
				<br />
				<video
					ref={videoRef}
					style={{
						transform: "scaleX(-1)",
						width: "640px",
						height: "480px",
					}}
				></video>
			</div>
			<div style={{ border: "5px solid #624de3", width: "max-content" }}>
				canvas
				<br />
				<canvas
					ref={canvasRef}
					width="640"
					height="480"
					style={{
						transform: "scaleX(-1)",
					}}
				></canvas>
			</div>
		</div>
	);
};
