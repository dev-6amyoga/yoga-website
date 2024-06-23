import { useEffect, useRef, useState } from "react";

export default function Timer({ endTime, onEndTitle = "Timer Ended" }) {
	const interval = useRef(null);
	const [ended, setEnded] = useState(false);

	const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);

	useEffect(() => {
		if (endTime === null) return;

		if (interval.current) {
			clearInterval(interval.current);
		}

		interval.current = setInterval(() => {
			const now = new Date();
			const et = new Date(endTime);

			const timeLeft = et - now;

			setTimeLeftSeconds(timeLeft / 1000);

			if (timeLeft <= 0) {
				setEnded(true);
				clearInterval(interval.current);
			}
		}, 1000);

		return () => {
			clearInterval(interval.current);
		};
	}, [endTime]);

	return (
		<div>
			{ended ? (
				<p>{onEndTitle}</p>
			) : (
				<p>Class Ends in {timeLeftSeconds} seconds</p>
			)}
		</div>
	);
}
