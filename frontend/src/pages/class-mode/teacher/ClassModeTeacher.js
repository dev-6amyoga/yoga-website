import { useParams } from "react-router-dom";

import { Spacer } from "@geist-ui/core";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ClassAPI } from "../../../api/class.api";
import TeacherPageWrapper from "../../../components/Common/TeacherPageWrapper";
import Playlist from "../../../components/Sidebar/Playlist";
import ClassModePlayer from "../../../components/class-mode-player-dashjs/ClassModePlayer";
import Attendees from "../../../components/testing/Attendees";
import PlaylistSectionsTeacher from "../../../components/testing/PlaylistSectionsTeacher";
import { CLASS_ONGOING } from "../../../enums/class_status";
import useVideoStore from "../../../store/VideoStore";

function ClassModeTeacher() {
	const [fullScreen] = useVideoStore((state) => [state.fullScreen]);
	const [disabled, setDisabled] = useState(true);
	const { class_id } = useParams();

	const { data: classInfo } = useQuery({
		queryKey: ["classInfo", class_id],
		queryFn: async () => {
			console.log("GETTING CLASS INFO");
			const [res, err] = await ClassAPI.postGetClassById(class_id);

			if (err) {
				console.error(err);
				toast.error("Failed to fetch class info");
			}

			return res.class;
		},
		retry: 0,
	});

	useEffect(() => {
		if (classInfo?.status !== CLASS_ONGOING) {
			setDisabled(true);
		} else {
			setDisabled(false);
		}
	}, [classInfo]);

	return (
		<TeacherPageWrapper>
			<main>
				<div className="max-w-7xl mx-auto py-2 px-1 xl:px-0">
					<div className="mt-6">
						{disabled ? (
							<h1 className="text-2xl text-center">
								Class has not started yet; Tune in later.
							</h1>
						) : (
							<>
								{/* <ClassInfoTeacher class_id={class_id} /> */}
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
						)}
					</div>
				</div>
			</main>
		</TeacherPageWrapper>
	);
}

export default ClassModeTeacher;
