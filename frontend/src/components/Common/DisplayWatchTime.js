import { useEffect, useRef, useState } from "react";

export default function DisplayWatchTime({
	hh,
	mm,
	ss,
	startTs = null,
	endTs = null,
}) {
	const [timeArray, setTimeArray] = useState({
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const [hasEnded, setHasEnded] = useState(false);
	const [hasStarted, setHasStarted] = useState(false);

	// const startInterval = useRef(null);
	const timerInterval = useRef(null);

	function convertSecondsToHMS(totalSeconds) {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return { hours, minutes, seconds };
	}

	useEffect(() => {
		if (endTs !== null) {
			setTimeArray({
				hours: 0,
				minutes: 0,
				seconds: 0,
			});
		}
	}, [hasEnded]);

	useEffect(() => {
		console.log("in effect");
		if (startTs === null && !hasStarted) {
			setHasStarted(true);
		}

		if (endTs !== null) {
			if (timerInterval.current === null) {
				timerInterval.current = setInterval(() => {
					const now = new Date();
					// console.log("itnerval");

					if (startTs && !hasStarted && now > startTs) {
						setHasStarted(true);
					}

					if (hasStarted) {
						const distance = endTs - now;

						// console.log(distance);

						setTimeArray(
							convertSecondsToHMS(Math.floor(distance / 1000))
						);

						if (distance < 0) {
							clearInterval(timerInterval.current);
							setHasEnded(true);
						}
					}
				}, 1000);
			}
			return () => {
				clearInterval(timerInterval.current);
				timerInterval.current = null;
			};
		}
	}, [startTs, endTs, hasStarted]);

	return (
		<div className="grid grid-cols-3">
			{endTs !== null ? (
				<>
					<p className="flex flex-col items-center gap-2">
						<span className="font-mono text-5xl">
							{timeArray.hours}
						</span>
						<span>Hrs.</span>
					</p>
					<p className="flex flex-col items-center gap-2">
						<span className="font-mono text-5xl">
							{timeArray.minutes}
						</span>
						<span>Min.</span>
					</p>
					<p className="flex flex-col items-center gap-2">
						<span className="font-mono text-5xl">
							{timeArray.seconds}
						</span>
						<span>Sec.</span>
					</p>
				</>
			) : (
				<>
					<p className="flex flex-col items-center gap-2">
						<span className="font-mono text-5xl">{hh}</span>
						<span>Hrs.</span>
					</p>
					<p className="flex flex-col items-center gap-2">
						<span className="font-mono text-5xl">{mm}</span>
						<span>Min.</span>
					</p>
					<p className="flex flex-col items-center gap-2">
						<span className="font-mono text-5xl">{ss}</span>
						<span>Sec.</span>
					</p>
				</>
			)}
		</div>
	);
}
