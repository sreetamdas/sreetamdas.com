/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, RefObject } from "react";

type TImageSnapshot = {
	data: Uint8ClampedArray;
	height: number;
	width: number;
};

export const GreenScreen = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current?.getContext(
			"2d"
		) as CanvasRenderingContext2D;
		const video = videoRef.current as HTMLVideoElement;
		const constraints: MediaStreamConstraints = {
			audio: false,
			video: { width: 640, height: 480 },
		};
		const rapidRefresh = (
			video: HTMLVideoElement,
			canvas: CanvasRenderingContext2D
		) => {
			canvas.drawImage(video, 0, 0);
			processImage(canvas, canvasRef);

			setTimeout(() => {
				rapidRefresh(video, canvas);
			}, 0); // rapidly refresh ⚡
		};
		// if (canvas !== null && canvas.getContext) {

		// canvasContext.fillStyle = "green";

		/* 
			0, 0, width and height?
			*/
		// canvasContext.fillRect(0, 0, 470, 350);
		// }
		// if (video !== null) {
		navigator.mediaDevices
			.getUserMedia(constraints)
			.then((mediaStream) => {
				video.srcObject = mediaStream;
				video.onloadedmetadata = () => {
					video.play();

					// Add an event listener in order to set up canvas to stream the video
					video?.addEventListener("loadeddata", () => {
						rapidRefresh(video, canvas);
					});
					// canvasContext?.drawImage(video, 0, 0); // only a single snapshot
				};
			})
			.catch((error) => {
				// eslint-disable-next-line no-console
				console.error({ error });
			});
		// }
	}, []);

	const processImage = (
		canvas: CanvasRenderingContext2D,
		canvasRef: RefObject<HTMLCanvasElement>
	) => {
		const snapshot: TImageSnapshot = canvas.getImageData(
			0,
			0,
			canvasRef.current?.width!,
			canvasRef.current?.height!
		);

		// console.log({ snapshot });

		/* 
		format of snapshot's data:Uint8ClampedArray =>
		0: pixel's Red value
		1: pixel's Green value
		2: pixel's Blue value
		3: Another 8-bit value
		*/

		const numberOfPixels = snapshot.data.length / 4;
		// 172800 // 640 * 480

		// Now the processing
		for (let i = 0; i < numberOfPixels; i++) {
			const red = snapshot.data[i * 4];
			const green = snapshot.data[i * 4 + 1];
			const blue = snapshot.data[i * 4 + 2];
			// const alpha = snapshot.data[i * 4 + 3];

			const colorToRemove = blue;
			// if green has higher concentration // and isnt dark
			if (
				colorToRemove > green &&
				colorToRemove > red &&
				colorToRemove > 100
			) {
				snapshot.data[i * 4 + 3] = 0;
			}
		}
		canvas.putImageData(snapshot, 0, 0);
		return;
	};

	return (
		<React.Fragment>
			<div style={{ border: "1px red solid" }}>
				video
				<video
					ref={videoRef}
					style={{
						border: "4px purple solid",
						transform: "scaleX(-1)",
						width: "auto",
						height: "480px",
					}}
				></video>
				canvas
				<canvas
					ref={canvasRef}
					width="640"
					height="480"
					style={{
						border: "4px green solid",
						transform: "scaleX(-1)",
						width: "auto",
						height: "480px",
					}}
				></canvas>
			</div>
		</React.Fragment>
	);
};
