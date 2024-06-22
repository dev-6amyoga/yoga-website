import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import VideoPlayer from "../../components/StackVideoShaka/VideoPlayer";
import ClassInfoStudent from "../../components/testing/ClassInfoStudent";
import PlaylistSectionsStudent from "../../components/testing/PlaylistSectionsStudent";
import useVideoStore from "../../store/VideoStore";
import Hero from "../student/components/Hero";

function ClassModeStudent() {
	const [fullScreen] = useVideoStore((state) => [state.fullScreen]);
	const { class_id } = useParams();

	const [connectionOpen, setConnectionOpen] = useState(false);
	const [socket, setSocket] = useState(null);
	const [queue, setQueue] = useState([]);
	const [startConnection, setStartConnection] = useState(false);
	let intervalTimer = useRef(null);

	const getSampleStudentReq = (event_type) => {
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
					class_id: class_id,
					student_id: "1",
				})
			);
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

	return (
		<main>
			<Hero heading="Class Mode" />
			<StudentNavMUI />
			<div className="max-w-7xl mx-auto py-2 px-1 xl:px-0">
				<div className="mt-6">
					<>
						<ClassInfoStudent class_id={class_id} />

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
									<PlaylistSectionsStudent />
								</div>
							) : (
								<></>
							)}
						</div>

						{fullScreen ? (
							<div className="queue-area">
								<PlaylistSectionsStudent />
							</div>
						) : (
							<></>
						)}
					</>
				</div>
			</div>
		</main>
	);
}

export default ClassModeStudent;
