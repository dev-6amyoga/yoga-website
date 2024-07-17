import {
	EVENT_CONTROLS,
	EVENT_CONTROLS_NEXT,
	EVENT_CONTROLS_PAUSE,
	EVENT_CONTROLS_PLAY,
	EVENT_CONTROLS_PREV,
	EVENT_CONTROLS_SEEK_MARKER,
	EVENT_CONTROLS_SEEK_TO,
	EVENT_QUEUE,
	EVENT_QUEUE_CLEAR,
	EVENT_QUEUE_POP,
	EVENT_QUEUE_PUSH,
	EVENT_TIMER,
} from "../../enums/class_mode_events";

import { useEffect, useMemo, useRef, useState } from "react";

function TeacherSocket() {
	const [connectionOpen, setConnectionOpen] = useState(false);
	const [socket, setSocket] = useState(null);
	const [queue, setQueue] = useState([]);
	const [startConnection, setStartConnection] = useState(true);
	let intervalTimer = useRef(null);

	const getSampleTeacherReq = (event_type) => {
		return JSON.stringify({
			class_id: "123",
			type: EVENT_CONTROLS,
			data: {
				subtype: "EVENT_CONTROLS_PLAY",
				data: {},
				event_time: new Date().toISOString(),
			},
		});
	};

	useEffect(() => {
		if (!startConnection) return;

		const ws = new WebSocket("ws://localhost:4949/teacher/ws");
		setSocket(ws);
		setStartConnection(false);
	}, [startConnection]);

	useEffect(() => {
		if (socket === null) return;

		const handleOpen = () => {
			setConnectionOpen(true);
			// intervalTimer.current = setInterval(() => {
			// 	socket.send(

			// 	);
			// }, 5000);
		};

		const handleClose = () => {
			setConnectionOpen(false);
			clearInterval(intervalTimer.current);
		};

		const handleMessage = (e) => {
			console.log("Message received: ", e.data);
			const data = JSON.parse(e.data);
			setQueue((prev) => [...prev, data]);
		};

		socket.addEventListener("open", handleOpen);
		socket.addEventListener("close", handleClose);
		socket.addEventListener("message", handleMessage);

		return () => {
			if (socket) {
				socket.close();
				socket.removeEventListener("open", handleOpen);
				socket.removeEventListener("close", handleClose);
				socket.removeEventListener("message", handleMessage);
			}
		};
	}, [socket]);

	const eventTypes = useMemo(() => {
		return {
			queue: [EVENT_QUEUE_PUSH, EVENT_QUEUE_POP, EVENT_QUEUE_CLEAR],
			controls: [
				EVENT_CONTROLS_PLAY,
				EVENT_CONTROLS_PAUSE,
				EVENT_CONTROLS_NEXT,
				EVENT_CONTROLS_PREV,
				EVENT_CONTROLS_SEEK_TO,
				EVENT_CONTROLS_SEEK_MARKER,
			],
			timer: [EVENT_TIMER],
		};
	}, []);

	return (
		<div>
			<h1>Teacher Socket</h1>
			<p>Connection : {connectionOpen ? "OPEN" : "CLOSE"}</p>
			<button
				onClick={() => {
					if (socket) {
						if (connectionOpen) {
							socket.close();
						} else {
							setStartConnection(true);
						}
					}
				}}>
				{connectionOpen ? "Close Connection" : "Open Connection"}
			</button>

			<div className="flex flex-row flex-wrap gap-4 border my-4 p-4">
				<button
					className="p-2 border border-gray-300 rounded-lg"
					onClick={() => {
						if (socket) {
							socket.send(
								JSON.stringify({
									class_id: "669696ff64e3c7c397cd62f0",
									type: EVENT_QUEUE,
									data: {
										subtype: EVENT_QUEUE_PUSH,
										data: {
											video_id: "1234",
										},
										event_time: new Date().toISOString(),
									},
								})
							);
						}
					}}>
					{EVENT_QUEUE_PUSH}
				</button>
				<button
					className="p-2 border border-gray-300 rounded-lg"
					onClick={() => {
						if (socket) {
							socket.send(
								JSON.stringify({
									class_id: "669696ff64e3c7c397cd62f0",
									type: EVENT_QUEUE,
									data: {
										subtype: EVENT_QUEUE_POP,
										data: {
											video_id: "1234",
											idx: 0,
										},
										event_time: new Date().toISOString(),
									},
								})
							);
						}
					}}>
					{EVENT_QUEUE_POP}
				</button>
				<button
					className="p-2 border border-gray-300 rounded-lg"
					onClick={() => {
						if (socket) {
							socket.send(
								JSON.stringify({
									class_id: "669696ff64e3c7c397cd62f0",
									type: EVENT_QUEUE,
									data: {
										subtype: EVENT_QUEUE_CLEAR,
										data: {},
										event_time: new Date().toISOString(),
									},
								})
							);
						}
					}}>
					{EVENT_QUEUE_CLEAR}
				</button>
			</div>

			<div className="flex flex-row flex-wrap gap-4 border my-4 p-4">
				{eventTypes.controls.map((e) => {
					return (
						<button
							className="p-2 border border-gray-300 rounded-lg"
							key={e}
							onClick={() => {
								if (socket) {
									socket.send(
										JSON.stringify({
											class_id:
												"669696ff64e3c7c397cd62f0",
											type: EVENT_CONTROLS,
											data: {
												subtype: e,
												data: {},
												event_time:
													new Date().toISOString(),
											},
										})
									);
								}
							}}>
							{e}
						</button>
					);
				})}
			</div>

			<div className="flex flex-row flex-wrap gap-4 border my-4 p-4">
				{eventTypes.timer.map((e) => {
					return (
						<button
							className="p-2 border border-gray-300 rounded-lg"
							key={e}
							onClick={() => {
								if (socket) {
									socket.send(
										JSON.stringify({
											class_id:
												"669696ff64e3c7c397cd62f0",
											type: EVENT_TIMER,
											data: {
												current_time: 3.123,
												event_time:
													new Date().toISOString(),
											},
										})
									);
								}
							}}>
							{e}
						</button>
					);
				})}
			</div>

			<div className="flex flex-row flex-wrap p-4 border">
				{queue.map((m) => {
					return (
						<div
							className="m-2 p-2 border border-gray-300 rounded-lg"
							key={m.event_time}>
							<p>{m.status}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function StudentSocket() {
	const [connectionOpen, setConnectionOpen] = useState(false);
	const [socket, setSocket] = useState(null);
	const [queue, setQueue] = useState([]);
	const [startConnection, setStartConnection] = useState(true);
	let intervalTimer = useRef(null);

	const getSampleStudentReq = (event_type) => {
		return JSON.stringify({
			class_id: "669696ff64e3c7c397cd62f0",
			type: EVENT_CONTROLS,
			data: {
				subtype: "EVENT_CONTROLS_PLAY",
				data: {},
				event_time: new Date().toISOString(),
			},
		});
	};

	useEffect(() => {
		if (!startConnection) return;

		const ws = new WebSocket("ws://localhost:4949/student/ws");
		setSocket(ws);
		setStartConnection(false);
	}, [startConnection]);

	useEffect(() => {
		if (socket === null) return;

		const handleOpen = () => {
			setConnectionOpen(true);
			// intervalTimer.current = setInterval(() => {
			// 	socket.send(

			// 	);
			// }, 5000);

			socket.send(
				JSON.stringify({
					class_id: "669696ff64e3c7c397cd62f0",
					student_id: "1",
				})
			);
		};

		const handleClose = () => {
			setConnectionOpen(false);
			clearInterval(intervalTimer.current);
		};

		const handleMessage = (e) => {
			console.log("Message received: ", e.data);
			const data = JSON.parse(e.data);
			setQueue((prev) => [...prev, data]);
		};

		socket.addEventListener("open", handleOpen);
		socket.addEventListener("close", handleClose);
		socket.addEventListener("message", handleMessage);

		return () => {
			if (socket) {
				socket.close();
				socket.removeEventListener("open", handleOpen);
				socket.removeEventListener("close", handleClose);
				socket.removeEventListener("message", handleMessage);
			}
		};
	}, [socket]);

	return (
		<div>
			<h1>Student Socket</h1>

			<p>Connection : {connectionOpen ? "OPEN" : "CLOSE"}</p>

			<button
				onClick={() => {
					if (socket) {
						if (connectionOpen) {
							socket.close();
						} else {
							setStartConnection(true);
						}
					}
				}}>
				{connectionOpen ? "Close Connection" : "Open Connection"}
			</button>

			<div className="flex flex-row flex-wrap p-4 border">
				{queue.map((m) => {
					return (
						<div
							className="m-2 p-2 border border-gray-300 rounded-lg"
							key={m.event_time}>
							<p>{m.status}</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function SocketPage() {
	return (
		<div className="max-w-5xl mx-auto">
			<TeacherSocket />
			<StudentSocket />
		</div>
	);
}

export default SocketPage;
