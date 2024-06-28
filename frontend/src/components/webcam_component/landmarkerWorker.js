// landmarkerWorker.ts

/* eslint-disable no-restricted-globals */

// import {
//   DrawingUtils,
//   FilesetResolver,
//   PoseLandmarker,
// } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

let poseLandmarker = null;
let drawingUtils = null;
let module = null;
let DrawingUtilsModule = null;
let offscreenCanvas = null;
let POSE_CONNECTIONS = null;

const LANDMARKS = {
	NOSE: 0,
	LEFT_EYE_INNER: 1,
	LEFT_EYE: 2,
	LEFT_EYE_OUTER: 3,
	RIGHT_EYE_INNER: 4,
	RIGHT_EYE: 5,
	RIGHT_EYE_OUTER: 6,
	LEFT_EAR: 7,
	RIGHT_EAR: 8,
	LEFT_MOUTH: 9,
	RIGHT_MOUTH: 10,
	LEFT_SHOULDER: 11,
	RIGHT_SHOULDER: 12,
	LEFT_ELBOW: 13,
	RIGHT_ELBOW: 14,
	LEFT_WRIST: 15,
	RIGHT_WRIST: 16,
	LEFT_PINKY: 17,
	RIGHT_PINKY: 18,
	LEFT_INDEX: 19,
	RIGHT_INDEX: 20,
	LEFT_THUMB: 21,
	RIGHT_THUMB: 22,
	LEFT_HIP: 23,
	RIGHT_HIP: 24,
	LEFT_KNEE: 25,
	RIGHT_KNEE: 26,
	LEFT_ANKLE: 27,
	RIGHT_ANKLE: 28,
	LEFT_HEEL: 29,
	RIGHT_HEEL: 30,
	LEFT_FOOT_INDEX: 31,
	RIGHT_FOOT_INDEX: 32,
};

const detectVrikshasanaLeft = (landmarks) => {
	const leftHeelY = landmarks[LANDMARKS.LEFT_HEEL].y;
	const rightHeelY = landmarks[LANDMARKS.RIGHT_HEEL].y;
	const rightAnkleY = landmarks[LANDMARKS.RIGHT_ANKLE].y;
	const rightKneeY = landmarks[LANDMARKS.RIGHT_KNEE].y;
	const leftPalmY = landmarks[LANDMARKS.LEFT_WRIST].y;
	const rightPalmY = landmarks[LANDMARKS.RIGHT_WRIST].y;
	const leftPalmX = landmarks[LANDMARKS.LEFT_WRIST].x;
	const rightPalmX = landmarks[LANDMARKS.RIGHT_WRIST].x;
	const leftHipY = landmarks[LANDMARKS.LEFT_HIP].y;
	const rightHipY = landmarks[LANDMARKS.RIGHT_HIP].y;
	const leftShoulderY = landmarks[LANDMARKS.LEFT_SHOULDER].y;
	const rightShoulderY = landmarks[LANDMARKS.RIGHT_SHOULDER].y;
	const leftElbowY = landmarks[LANDMARKS.LEFT_ELBOW].y;
	const rightElbowY = landmarks[LANDMARKS.RIGHT_ELBOW].y;
	const leftEyeY = landmarks[LANDMARKS.LEFT_EYE].y;
	const rightEyeY = landmarks[LANDMARKS.RIGHT_EYE].y;

	// Calculate midpoints
	const midHipY = (leftHipY + rightHipY) / 2;
	const midPalmY = (leftPalmY + rightPalmY) / 2;
	const midShoulderY = (leftShoulderY + rightShoulderY) / 2;
	const midElbowY = (leftElbowY + rightElbowY) / 2;
	const midEyeY = (leftEyeY + rightEyeY) / 2;

	let legPositionMessage = "";
	let marksMessage = "";
	let handPositionMessage = "";

	const roundTo = (number, decimals) => {
		return Number(number.toFixed(decimals));
	};
	let nextStep = "";
	let leg_score = 0;
	let hand_score = 0;
	let base_score = 0;

	if (roundTo(leftHeelY, 1) === roundTo(rightHeelY, 1)) {
		nextStep = "";
		legPositionMessage = "Take left heel to groin!";
		base_score = 0;
	} else if (leftHeelY - rightHeelY > 0.1) {
		nextStep = "";
		legPositionMessage = "Swap Legs!";
		base_score = 0;
	} else {
		base_score = 10;
		nextStep = "Legs correct!";
	}
	if (base_score === 10) {
		if (
			leftHeelY === rightAnkleY ||
			Math.abs(leftHeelY - rightAnkleY) < 0.1
		) {
			leg_score = 20;
			legPositionMessage = "Try and lift your leg to the groin!";
		} else if (leftHeelY + 0.1 < rightAnkleY && leftHeelY > rightKneeY) {
			leg_score = 40;
			legPositionMessage = "Try and lift your leg to the groin!";
		}
		if (leftHeelY < rightKneeY) {
			const midLength = (midHipY + rightKneeY) / 4;
			if (leftHeelY > midHipY + midLength) {
				leg_score = 60;
				legPositionMessage = "Try and lift your leg to the groin!";
			} else {
				leg_score = 60;
			}
		}

		if (midPalmY > midHipY) {
			marksMessage += ", Take your arms up";
		} else {
			if (midPalmY < midHipY && midPalmY > midShoulderY) {
				hand_score = 10;
				handPositionMessage =
					"Try and lift your arms higher and straight";
			} else if (
				midPalmY < midHipY &&
				midPalmY < midShoulderY &&
				midElbowY > midShoulderY
			) {
				handPositionMessage =
					"Try and lift your arms higher and straight";

				hand_score = 20;
			} else if (
				midPalmY < midHipY &&
				midPalmY < midShoulderY &&
				midElbowY < midShoulderY &&
				midElbowY > midEyeY
			) {
				handPositionMessage =
					"Try and lift your arms higher and straight";

				hand_score = 25;
			} else if (
				midPalmY < midHipY &&
				midPalmY < midShoulderY &&
				midElbowY < midShoulderY &&
				midElbowY < midEyeY
			) {
				if (Math.abs(leftPalmX - rightPalmX) >= 0.05) {
					handPositionMessage = "Join your palms";
					hand_score = 30;
				} else {
					hand_score = 40;
				}
			}
		}
	}
	return [leg_score + hand_score, legPositionMessage + handPositionMessage];
};

const detectVrikshasanaRight = (landmarks) => {
	const leftHeelY = landmarks[LANDMARKS.LEFT_HEEL].y;
	const rightHeelY = landmarks[LANDMARKS.RIGHT_HEEL].y;
	// const rightAnkleY = landmarks[LANDMARKS.RIGHT_ANKLE].y;
	// const rightKneeY = landmarks[LANDMARKS.RIGHT_KNEE].y;

	const leftAnkleY = landmarks[LANDMARKS.LEFT_ANKLE].y;
	const leftKneeY = landmarks[LANDMARKS.LEFT_KNEE].y;

	const leftPalmY = landmarks[LANDMARKS.LEFT_WRIST].y;
	const rightPalmY = landmarks[LANDMARKS.RIGHT_WRIST].y;
	const leftPalmX = landmarks[LANDMARKS.LEFT_WRIST].x;
	const rightPalmX = landmarks[LANDMARKS.RIGHT_WRIST].x;
	const leftHipY = landmarks[LANDMARKS.LEFT_HIP].y;
	const rightHipY = landmarks[LANDMARKS.RIGHT_HIP].y;
	const leftShoulderY = landmarks[LANDMARKS.LEFT_SHOULDER].y;
	const rightShoulderY = landmarks[LANDMARKS.RIGHT_SHOULDER].y;
	const leftElbowY = landmarks[LANDMARKS.LEFT_ELBOW].y;
	const rightElbowY = landmarks[LANDMARKS.RIGHT_ELBOW].y;
	const leftEyeY = landmarks[LANDMARKS.LEFT_EYE].y;
	const rightEyeY = landmarks[LANDMARKS.RIGHT_EYE].y;

	// Calculate midpoints
	const midHipY = (leftHipY + rightHipY) / 2;
	const midPalmY = (leftPalmY + rightPalmY) / 2;
	const midShoulderY = (leftShoulderY + rightShoulderY) / 2;
	const midElbowY = (leftElbowY + rightElbowY) / 2;
	const midEyeY = (leftEyeY + rightEyeY) / 2;

	let legPositionMessage = "";
	let marksMessage = "";
	let handPositionMessage = "";

	const roundTo = (number, decimals) => {
		return Number(number.toFixed(decimals));
	};
	let nextStep = "";
	let leg_score = 0;
	let hand_score = 0;
	let base_score = 0;

	if (roundTo(leftHeelY, 1) === roundTo(rightHeelY, 1)) {
		nextStep = "";
		legPositionMessage = "Take right heel to groin!";
		base_score = 0;
	} else if (rightHeelY - leftHeelY > 0.1) {
		nextStep = "";
		legPositionMessage = "Swap Legs!";
		base_score = 0;
	} else {
		base_score = 10;
		nextStep = "Legs correct!";
	}
	if (base_score === 10) {
		if (
			rightHeelY === leftAnkleY ||
			Math.abs(rightHeelY - leftAnkleY) < 0.1
		) {
			leg_score = 20;
			legPositionMessage = "Try and lift your leg to the groin!";
		} else if (rightHeelY + 0.1 < leftAnkleY && rightHeelY > leftKneeY) {
			leg_score = 40;
			legPositionMessage = "Try and lift your leg to the groin!";
		}
		if (rightHeelY < leftKneeY) {
			const midLength = (midHipY + leftKneeY) / 4;
			if (rightHeelY > midHipY + midLength) {
				leg_score = 60;
				legPositionMessage = "Try and lift your leg to the groin!";
			} else {
				leg_score = 60;
			}
		}

		if (midPalmY > midHipY) {
			marksMessage += ", Take your arms up";
		} else {
			if (midPalmY < midHipY && midPalmY > midShoulderY) {
				hand_score = 10;
				handPositionMessage =
					"Try and lift your arms higher and straight";
			} else if (
				midPalmY < midHipY &&
				midPalmY < midShoulderY &&
				midElbowY > midShoulderY
			) {
				handPositionMessage =
					"Try and lift your arms higher and straight";

				hand_score = 20;
			} else if (
				midPalmY < midHipY &&
				midPalmY < midShoulderY &&
				midElbowY < midShoulderY &&
				midElbowY > midEyeY
			) {
				handPositionMessage =
					"Try and lift your arms higher and straight";

				hand_score = 25;
			} else if (
				midPalmY < midHipY &&
				midPalmY < midShoulderY &&
				midElbowY < midShoulderY &&
				midElbowY < midEyeY
			) {
				if (Math.abs(leftPalmX - rightPalmX) >= 0.05) {
					handPositionMessage = "Join your palms";
					hand_score = 30;
				} else {
					hand_score = 40;
				}
			}
		}
	}
	return [leg_score + hand_score, legPositionMessage + handPositionMessage];
};

self.onmessage = async (event) => {
	// console.log("worker in on message");
	const { type, data } = event;
	// console.log("worker", type, data);
	if (data.type === "init") {
		console.log("[LANDMARKER] received init");

		const [m1] = await Promise.all([
			import("https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0"),
		]);

		module = m1;

		DrawingUtilsModule = module.DrawingUtils;

		const vision = await module.FilesetResolver.forVisionTasks(
			"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
		);

		poseLandmarker = await module.PoseLandmarker.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
				delegate: "GPU",
			},
			runningMode: "IMAGE",
			numPoses: 1,
			minDetectionConfidence: 0.5, // adjust confidence thresholds
			minTrackingConfidence: 0.5,
		});

		offscreenCanvas = data.canvas;

		if (!offscreenCanvas) {
			self.postMessage({ type: "init-failed" });
			return;
		}

		drawingUtils = new module.DrawingUtils(
			offscreenCanvas.getContext("2d")
		);

		POSE_CONNECTIONS = module.PoseLandmarker.POSE_CONNECTIONS;

		console.log("[LANDMARKER] finished init");
		self.postMessage({ type: "init-complete" });
	}

	// if (data.type === "predict") {
	//   console.log("[LANDMARKER] received predict");
	//   // console.log("worker data:", data);
	//   const { imageData, width, height } = data.data;
	//   console.log("worker :", imageData);
	//   const canvas = new OffscreenCanvas(width, height);
	//   const ctx = canvas.getContext("2d");
	//   const imageBitmap = await createImageBitmap(
	//     new ImageData({ imageData, width, height })
	//   );
	//   console.log(imageBitmap);
	//   // ctx.drawImage(imageBitmap, 0, 0, width, height);

	//   // const result = await poseLandmarker.detect(canvas);
	//   // console.log("[LANDMARKER] result :", result);
	//   self.postMessage({ type: "result", data: result });
	// }

	if (data.type === "predict") {
		// console.log("[LANDMARKER] received predict");
		const { imageData, width, height, side = "left" } = data.data;
		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext("2d");
		const imgData = new ImageData(imageData, width, height);
		const imageBitmap = await createImageBitmap(imgData);
		// console.log(imageData);
		ctx.drawImage(imageBitmap, 0, 0, width, height);

		if (!module) {
			self.postMessage({
				type: "result",
				score: 0,
				message: "No modules loaded!",
			});
			return;
		}

		if (!canvas) {
			return;
		}

		const result = await poseLandmarker.detect(canvas);
		// console.log(result.landmarks);

		if (!offscreenCanvas) {
			return;
		}

		const screenCanvasCtx = offscreenCanvas.getContext("2d");

		offscreenCanvas.width = width;
		offscreenCanvas.height = height;

		screenCanvasCtx.save();

		screenCanvasCtx.clearRect(0, 0, width, height);

		// const ct = performance.now();

		let score = 0;
		let message = "";

		// console.log("SIDE: ", side);

		for (const landmark of result.landmarks) {
			if (side === "left") {
				[score, message] = detectVrikshasanaLeft(landmark);
			} else if (side === "right") {
				[score, message] = detectVrikshasanaRight(landmark);
			} else {
				score = 0;
				message = "---";
			}
			drawingUtils.drawLandmarks(landmark, {
				radius: (data) =>
					DrawingUtilsModule.lerp(data.from.z, -0.15, 0.1, 5, 1),
			});
			drawingUtils.drawConnectors(landmark, POSE_CONNECTIONS);
		}
		// console.log("time taken to update : ", performance.now() - ct);

		screenCanvasCtx.restore();

		self.postMessage({ type: "result", score, message });

		// Corrected ImageData constructor
		// const imageBitmap = await createImageBitmap(
		//   new ImageData(new Uint8ClampedArray(imageData), width, height)
		// );

		// console.log(imageBitmap);
		// ctx.drawImage(imageBitmap, 0, 0, width, height);

		// const result = await poseLandmarker.detect(canvas);
		// console.log("[LANDMARKER] result :", result);
		// self.postMessage({ type: "result", data: result });
	}
};

self.onerror = function (err) {
	console.log(err);
};

// export {};
