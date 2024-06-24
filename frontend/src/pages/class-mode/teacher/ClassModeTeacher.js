import { useParams } from "react-router-dom";

import { Spacer } from "@geist-ui/core";

import Playlist from "../../../components/Sidebar/Playlist";
import ClassModePlayer from "../../../components/class-mode-player-dashjs/ClassModePlayer";
import Attendees from "../../../components/testing/Attendees";
import ClassInfoTeacher from "../../../components/testing/ClassInfoTeacher";
import PlaylistSectionsTeacher from "../../../components/testing/PlaylistSectionsTeacher";
import useVideoStore from "../../../store/VideoStore";

function ClassModeTeacher() {
	const [fullScreen] = useVideoStore((state) => [state.fullScreen]);
	const { class_id } = useParams();

	// const [connectionOpen, setConnectionOpen] = useState(false);
	// // const [socket, setSocket] = useState(null);
	// const [queue, setQueue] = useState([]);
	// const [startConnection, setStartConnection] = useState(false);
	// let intervalTimer = useRef(null);
	// let socket = useRef(null);

	// const getSampleTeacherReq = (event_type) => {
	// 	return JSON.stringify({
	// 		class_id: class_id,
	// 		type: EVENT_CONTROLS,
	// 		data: {
	// 			subtype: "EVENT_CONTROLS_PLAY",
	// 			data: {},
	// 			event_time: new Date().toISOString(),
	// 		},
	// 	});
	// };

	// const handleOpen = useCallback(() => {
	// 	setConnectionOpen(true);
	// 	console.log("Connection opened");
	// 	if (socket.current) {
	// 		// socket.current.send(
	// 		// 	JSON.stringify({
	// 		// 		class_id: class_id,
	// 		// 		teacher_id: "1",
	// 		// 	})
	// 		// );
	// 	}
	// }, []);

	// const handleClose = useCallback(() => {
	// 	console.log("Connection closed");
	// 	setConnectionOpen(false);
	// 	clearInterval(intervalTimer.current);
	// }, []);

	// const handleMessage = useCallback((e) => {
	// 	const data = JSON.parse(e.data);
	// 	console.log("Message received: ", data);
	// 	setQueue((prev) => [...prev, data]);
	// }, []);

	// // if startConnection is true, create a new WebSocket connection
	// useEffect(() => {
	// 	if (!startConnection) return;

	// 	const ws = new WebSocket("ws://localhost:4949/teacher/ws");
	// 	socket.current = ws;

	// 	socket.current.addEventListener("open", handleOpen);
	// 	socket.current.addEventListener("close", handleClose);
	// 	socket.current.addEventListener("message", handleMessage);

	// 	return () => {
	// 		if (ws) {
	// 			ws.close();
	// 		}
	// 	};
	// }, [startConnection]);

	// const eventTypes = useMemo(() => {
	// 	return {
	// 		queue: [EVENT_QUEUE_PUSH, EVENT_QUEUE_POP, EVENT_QUEUE_CLEAR],
	// 		controls: [
	// 			EVENT_CONTROLS_PLAY,
	// 			EVENT_CONTROLS_PAUSE,
	// 			EVENT_CONTROLS_NEXT,
	// 			EVENT_CONTROLS_PREV,
	// 			EVENT_CONTROLS_SEEK_TO,
	// 			EVENT_CONTROLS_SEEK_MARKER,
	// 		],
	// 		timer: [EVENT_TIMER],
	// 	};
	// }, []);

	return (
		<main>
			<div className="max-w-7xl mx-auto py-2 px-1 xl:px-0">
				<div className="mt-6">
					<>
						<ClassInfoTeacher class_id={class_id} />
						{/* <Button
							variant="contained"
							color="primary"
							onClick={() => {
								if (connectionOpen && socket.current) {
									setStartConnection(false);
								} else {
									setStartConnection(true);
								}
							}}>
							{connectionOpen
								? "Close Connection"
								: "Open Connection"}
						</Button> */}

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
								{/* dash video player */}
								<ClassModePlayer isStudent={false} />
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

						<Spacer h={2} />

						<Playlist />
					</>
				</div>
			</div>
		</main>
	);
}

export default ClassModeTeacher;
