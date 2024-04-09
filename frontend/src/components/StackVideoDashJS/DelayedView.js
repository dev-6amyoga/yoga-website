import { useEffect, useState } from "react";

export default function DelayedView({ waitTime, children }) {
	const [hidden, setHidden] = useState(true);

	useEffect(() => {
		const t = setTimeout(() => {
			setHidden(false);
			console.log("[DELAYED VIEW] UNHIDING NOW");
		}, [waitTime]);
		return () => {
			clearTimeout(t);
		};
	}, [waitTime]);

	return <>{hidden ? <></> : children}</>;
}
