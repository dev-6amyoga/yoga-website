import { Edit, ExitToApp, Share } from "@mui/icons-material";
import { Avatar, Button, Card, CardContent } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ClassModeAPI } from "../../api/class-mode.api";
import { getFrontendDomain } from "../../utils/getFrontendDomain";
import TeacherPageWrapper from "../Common/TeacherPageWrapper";
import "./ClassInfoStudent.css";

export default function ClassInfoTeacher() {
	const { class_id } = useParams();

	const { data: classInfo } = useQuery({
		queryKey: ["classInfo", class_id],
		queryFn: async () => {
			const [res, err] = await ClassModeAPI.postGetClassById(class_id);

			if (err) {
				console.error(err);
				toast.error("Failed to fetch class info");
			}

			return res.class;
		},
	});

	const handleStartClass = () => {
		toast.info("Starting class");
	};

	const handleEditInfo = () => {
		toast.info("Editing class info");
	};

	const handleShare = () => {
		// Copy to clipboard

		navigator.clipboard.writeText(
			`${getFrontendDomain()}/testing/class/student/${class_id}/info`
		);
		toast.info("Link copied to clipboard");
	};

	return (
		<TeacherPageWrapper heading="Class Info">
			<Card
				sx={{
					border: "1px solid",
					borderColor: "primary.main",
					background: "linear-gradient(#033363, #021F3B)",
					borderRadius: "1rem",
					margin: "2rem 0",
				}}>
				<CardContent>
					<div className="class-info-student">
						{/* info */}
						<div className="class-info-student-title">
							<h3 className="text-white">
								{class_id} | {classInfo?.class_name}
							</h3>
							<p className="class-info-student-desc text-y-white text-sm">
								{classInfo?.class_desc}
							</p>
						</div>

						<div className="class-info-student-teacher text-white flex flex-col gap-2 py-1">
							<div className="flex flex-row gap-2 items-center">
								<Avatar>{classInfo?.teacher?.name[0]}</Avatar>
								{classInfo?.teacher?.name}
							</div>
						</div>

						<div className="class-info-student-info flex flex-row gap-8 text-sm text-white">
							<div>
								<p className="font-medium">Start Time</p>
								<p>
									{new Date(
										classInfo?.start_time
									).toLocaleString()}
								</p>
							</div>
							<div>
								<p className="font-medium">End Time</p>
								<p>
									{new Date(
										classInfo?.end_time
									).toLocaleString()}
								</p>
							</div>
							<div>
								<p className="font-medium">Duration</p>
								<p>
									{classInfo?.end_time &&
									classInfo?.start_time
										? (new Date(classInfo.end_time) -
												new Date(
													classInfo.start_time
												)) /
											1000 /
											60
										: 0}
									minutes
								</p>
							</div>

							<div>
								<p className="font-medium">Attendees</p>
								<p className="flex flex-row gap-1 items-center">
									<span
										className={`w-2 h-2 rounded-full bg-green-500`}></span>
									{classInfo?.attendees?.length}
								</p>
							</div>
						</div>

						{/* actions */}
						<div className="class-info-student-actions flex flex-col gap-4 justify-center">
							<Button
								variant="contained"
								onClick={handleStartClass}
								startIcon={<ExitToApp />}
								sx={{
									minWidth: "fit-content",
								}}>
								Start Class
							</Button>
							<Button
								variant="contained"
								onClick={handleEditInfo}
								startIcon={<Edit />}
								sx={{
									minWidth: "fit-content",
								}}>
								Edit Info
							</Button>
							<Button
								sx={{
									minWidth: "fit-content",
								}}
								onClick={handleShare}
								variant="contained"
								color="inherit"
								startIcon={<Share />}>
								Share
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</TeacherPageWrapper>
	);
}
