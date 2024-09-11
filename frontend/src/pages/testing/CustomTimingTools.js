import { useEffect, useRef, useState } from "react";
import { CustomTimingObject } from "../../lib/custom-timing-object";
import { CustomTimingProvider } from "../../lib/custom-timing-provider";

export function CustomTimingTools() {
	const timingProviderRef = useRef(null);
	const timingObjectRef = useRef(null);

	const [classId, setClassId] = useState(null);
	const [userId, setUserId] = useState(null);

	const [messages, setMessages] = useState([]);

	useEffect(() => {
		if (!classId || !userId) {
			return;
		}

		const tp = new CustomTimingProvider(
			classId,
			userId,
			{
				position: 0,
				velocity: 0,
				acceleration: 0,
			},
			0,
			null
		);
		timingProviderRef.current = tp;

		timingObjectRef.current = new CustomTimingObject(
			timingProviderRef.current
		);

		const handleTimeUpdate = (e) => {
			// console.log("[CustomTimingTools] timeupdate", e.detail);
			setMessages((prev) => [...prev, e.detail]);
		};

		timingObjectRef.current.addEventListener(
			"timeupdate",
			handleTimeUpdate
		);

		const handleChange = (e) => {
			console.log("[CustomTimingTools] change", e.detail);
		};

		timingObjectRef.current.addEventListener("change", handleChange);

		return () => {
			timingObjectRef.current.removeEventListener(
				"timeupdate",
				handleTimeUpdate
			);

			timingObjectRef.current.removeEventListener("change", handleChange);

			timingObjectRef.current.destroy();

			timingProviderRef.current.destroy();
		};
	}, [classId, userId]);

	return (
		<div>
			<h1>CustomTimingObject</h1>
			<form
				onSubmit={(e) => {
					e.preventDefault();

					const formData = Object.fromEntries(new FormData(e.target));

					// console.log("[CustomTimingTools] form data", formData);
					setClassId(formData.classId);
					setUserId(formData.userId);
				}}>
				<input
					className="border"
					placeholder="classId"
					name="classId"
				/>
				<input className="border" placeholder="userId" name="userId" />
				<button type="submit">Submit</button>
			</form>
			<hr />

			<form
				onSubmit={(e) => {
					e.preventDefault();

					const formData = Object.fromEntries(new FormData(e.target));

					if (timingObjectRef.current) {
						timingObjectRef.current.update({
							type: "EVENT_TIMER_UPDATE",
							class_id: classId,
							user_id: userId,
							data: formData,
						});
					}
				}}>
				<input
					className="border"
					placeholder="position"
					name="position"
					type="number"
				/>
				<input
					className="border"
					placeholder="velocity"
					name="velocity"
					type="number"
				/>
				<input
					className="border"
					placeholder="acceleration"
					name="acceleration"
					type="number"
				/>
				<button type="submit">Submit</button>
			</form>

			{messages.map((msg, idx) => (
				<div key={idx}>{JSON.stringify(msg)}</div>
			))}
		</div>
	);
}
