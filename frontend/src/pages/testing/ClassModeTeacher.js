import { Button } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import VideoPlayer from "../../components/StackVideoShaka/VideoPlayer";
import Attendees from "../../components/testing/Attendees";
import ClassInfoTeacher from "../../components/testing/ClassInfoTeacher";
import PlaylistSectionsTeacher from "../../components/testing/PlaylistSectionsTeacher";
import useVideoStore from "../../store/VideoStore";
import Hero from "../student/components/Hero";

function ClassModeTeacher() {
	const [fullScreen] = useVideoStore((state) => [state.fullScreen]);
	const { class_id } = useParams();

	const [connectionOpen, setConnectionOpen] = useState(false);
	const [socket, setSocket] = useState(null);
	const [queue, setQueue] = useState([]);
	const [startConnection, setStartConnection] = useState(false);
	let intervalTimer = useRef(null);

	const getSampleTeacherReq = (event_type) => {
		return JSON.stringify({
			class_id: class_id,
			type: EVENT_CONTROLS,
			data: {
				subtype: "EVENT_CONTROLS_PLAY",
				data: {},
				event_time: new Date().toISOString(),
			},
		});
	};

	// if startConnection is true, create a new WebSocket connection
	useEffect(() => {
		if (!startConnection) return;

		const ws = new WebSocket("ws://localhost:4949/teacher/ws");
		setSocket(ws);
		setStartConnection(false);
	}, [startConnection]);

	// if socket is not null, add event listeners for open, close, and message
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
			const data = JSON.parse(e.data);
			console.log("Message received: ", data);
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
		<main>
			<Hero heading="Class Mode" />
			<StudentNavMUI />
			<div className="max-w-7xl mx-auto py-2 px-1 xl:px-0">
				<div className="mt-6">
					<>
						<ClassInfoTeacher class_id={class_id} />
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setStartConnection(true);
							}}>
							{connectionOpen ? "Connected" : "Not Connected"}
						</Button>

						<div
							className={
								fullScreen
									? ""
									: "relative video-grid mb-12 w-full gap-2"
							}>
							<div
								className={
									fullScreen
										? "absolute w-full h-screen top-0 left-0 right-0 bottom-0 z-[10000]"
										: "video-area"
								}>
								<VideoPlayer />
							</div>
							{!fullScreen ? (
								<div className="queue-area">
									<PlaylistSectionsTeacher />
								</div>
							) : (
								<></>
							)}
						</div>

						{fullScreen ? (
							<div className="queue-area">
								<PlaylistSectionsTeacher />
							</div>
						) : (
							<></>
						)}

						<Attendees />
					</>
				</div>
			</div>
		</main>
	);
}

export default ClassModeTeacher;
