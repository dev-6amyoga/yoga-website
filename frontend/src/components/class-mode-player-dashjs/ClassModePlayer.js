// import { TimingObject } from "https://webtiming.github.io/timingsrc/lib/timingsrc-v3.js";
// import MCorp from "https://www.mcorp.no/lib/mcorp-2.0.js";

import { useEffect, useRef } from "react";
import ShakaPlayerWrapper from "./ShakaPlayerWrapper";

export default function ClassModePlayer() {
	const player = useRef(null);

	const timingObj = useRef(null);

	useEffect(() => {
		// 8449551217753191202

		const to = new TIMINGSRC.TimingObject();

		var mcorp_app = MCorp.app(import.meta.env.VITE_MCORP_APP_ID, {
			anon: true,
		});

		mcorp_app.ready.then(function () {
			to.timingsrc = mcorp_app.motions["test-timer"];
			console.log("hello world!", to.query());
		});

		timingObj.current = to;

		const handleChange = (e) => {
			console.log("[TIMING OBJ] CHANGE : ", to.query());
		};

		to.on("change", handleChange);

		return () => {
			if (to) {
				to.off("change", handleChange);
			}
		};
	}, []);

	return (
		<div className="w-full max-w-5xl mx-auto aspect-video bg-black">
			{/* <DashPlayer
				ref={player}
				timingObjRef={timingObj}
				isAsanaVideo={true}
				className="w-full h-full"
				src="https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev/66617a16485e980956f9f772.mpd"
			/> */}
			<ShakaPlayerWrapper
				timingObjRef={timingObj}
				isDrm={true}
				className="w-full h-full"
				src="https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev/66617a16485e980956f9f772.mpd"
			/>
		</div>
	);
}
