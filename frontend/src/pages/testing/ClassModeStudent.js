// import {
// 	DrawingUtils,
// 	PoseLandmarker,
// } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
import ShakaVideo from "../testing/ShakaVideo";
import "./MovingText.css";
import Hero from "./components/Hero";

function StudentHome() {
	return (
		<main>
			<Hero heading="6AM Yoga Player" />
			<div className="max-w-7xl mx-auto py-2 px-1 xl:px-0">
				<div className="mt-6">
					<ShakaVideo />
				</div>
			</div>
		</main>
	);
}

export default StudentHome;
