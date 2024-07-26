import { useEffect, useRef, useState } from "react";

export default function Timer({
	prefix = "Class Ends",
	className = "",
	endTime,
	onEnded,
	onEndTitle = "Timer Ended",
}) {
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

	useEffect(() => {
		if (ended) {
			if (onEnded) {
				onEnded();
			}
		}
	}, [ended]);

	return (
		<div>
			{ended ? (
				<p className={className}>{onEndTitle}</p>
			) : (
				<p className={className}>
					{prefix} in {timeLeftSeconds.toFixed()} seconds
				</p>
			)}
		</div>
	);
}
