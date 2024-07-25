// import { TimingObject } from "https://webtiming.github.io/timingsrc/lib/timingsrc-v3.js";
// import MCorp from "https://www.mcorp.no/lib/mcorp-2.0.js";

import { useEffect, useRef, useState } from "react";
import ShakaPlayerWrapper from "./ShakaPlayerWrapper";

export default function ClassModePlayer({ isStudent }) {
	const player = useRef(null);

	const timingObj = useRef(null);

	// const [timingObjReady, setTimingObjReady] = useState(false);
	const [change, setChange] = useState(0);
	const resetDone = useRef(false);

	console.log("ClassModePlayer");

	useEffect(() => {
		// 8449551217753191202

		if (timingObj.current === null) {
			console.log("[TIMING OBJ] INIT");
			const to = new TIMINGSRC.TimingObject();

			var mcorp_app = MCorp.app(import.meta.env.VITE_MCORP_APP_ID, {
				anon: true,
			});

			mcorp_app.ready.then(function () {
				to.timingsrc = mcorp_app.motions["test-timer"];
				// console.log("hello world!", to.query());
				// setTimingObjReady(true);
			});

			timingObj.current = to;
		}

		const handleChange = (e) => {
			console.log("[TIMING OBJ] CHANGE : ", timingObj.current.query());

			if (!resetDone.current && !isStudent) {
				setChange(timingObj.current.query().position);
			}
		};

		timingObj.current.on("change", handleChange);

		return () => {
			if (timingObj.current) {
				timingObj.current.off("change", handleChange);
			}
		};
	}, []);

	useEffect(() => {
		if (change > 0 && resetDone.current === false && !isStudent) {
			console.log("[TIMING OBJ] RESET DONE : ", change);
			resetDone.current = true;
			timingObj.current.update({ position: 0 });
		}
	}, [change, isStudent]);

	return (
		<div className="w-full max-w-5xl mx-auto aspect-video bg-black">
			{/* <DashPlayer
				ref={player}
				timingObjRef={timingObj}
				isAsanaVideo={true}
				isStudent={isStudent}
				className="w-full h-full"
				src="https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev/66a14fb5c1cf1650ea1f536e.mpd"
			/> */}

			<ShakaPlayerWrapper
				src={
					"https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev/66a14fb5c1cf1650ea1f536e.mpd"
				}
				isDrm={true}
				timingObjRef={timingObj}
				isStudent={isStudent}
			/>
		</div>
	);
}
