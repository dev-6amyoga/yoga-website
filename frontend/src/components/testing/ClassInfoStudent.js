import { ExitToApp, Share } from "@mui/icons-material";
import { Avatar, Button, Card, CardContent } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ClassAPI } from "../../api/class.api";
import "./ClassInfoStudent.css";

// const classInfo = {
// 	class_id: "sfa14af14ssf1223",
// 	title: "6AM Yoga Class : demo class by Sivakumar P on June 8th, 2024.",
// 	desc: "June playlist demo class. June playlist demo class. June playlist demo class. June playlist demo class. June playlist demo class. June playlist demo class. June playlist demo class.",
// 	teacher: {
// 		name: "Sivakumar Puthenmadathil",
// 	},
// 	start_time: "2024-06-08T16:20:59.351Z",
// 	end_time: "2024-06-08T16:50:59.351Z",
// 	duration: 30 * 60 * 1000,
// 	attendees: 12,
// };

export default function ClassInfoStudent({ class_id }) {
	const { data: classInfo } = useQuery({
		queryKey: ["classInfo", class_id],
		queryFn: async () => {
			const [res, err] = await ClassAPI.postGetClassById(class_id);
			console.log(res);
			if (err) {
				console.error(err);
				toast.error("Failed to fetch class info");
			}

			return res.class;
		},
	});

	const { data: classHistoryInfo } = useQuery({
		queryKey: ["classHistoryInfo", class_id],
		queryFn: async () => {
			const [res, err] =
				await ClassAPI.postGetLatestClassHistoryById(class_id);

			if (err) {
				console.error(err);
				toast.error("Failed to fetch class history info");
			}

			return res.class_history;
		},
	});

	return (
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
						<h3 className="text-white">{classInfo?.class_name}</h3>
						<p className="class-info-student-desc text-y-white text-sm">
							{classInfo?.class_desc}
						</p>
					</div>

					<div className="class-info-student-teacher text-white flex flex-col gap-2 py-1">
						<div className="flex flex-row gap-2 items-center">
							<Avatar>{classInfo?.teacher?.name[0]}</Avatar>
							{classInfo?.teacher.name}
						</div>
					</div>

					<div className="class-info-student-info flex flex-row gap-8 text-sm text-white">
						<div>
							<p className="font-medium">Start Time</p>
							<p>
								{new Date(
									classHistoryInfo?.start_time
								).toLocaleString()}
							</p>
						</div>
						<div>
							<p className="font-medium">End Time</p>
							<p>
								{new Date(
									classHistoryInfo?.end_time
								).toLocaleString()}
							</p>
						</div>
						{/* <div>
							<p className="font-medium">Duration</p>
							<p>{classInfo?.duration / 1000 / 60} minutes</p>
						</div> */}

						{/* <div>
							<p className="font-medium">Attendees</p>
							<p className="flex flex-row gap-1 items-center">
								<span
									className={`w-2 h-2 rounded-full bg-green-500`}></span>
								{classInfo.attendees}
							</p>
						</div> */}
					</div>

					{/* actions */}
					<div className="class-info-student-actions flex flex-col gap-4 justify-center">
						<Button
							variant="contained"
							startIcon={<ExitToApp />}
							sx={{
								minWidth: "fit-content",
							}}>
							Leave Class
						</Button>
						<Button
							sx={{
								minWidth: "fit-content",
							}}
							variant="contained"
							color="inherit"
							startIcon={<Share />}>
							Share
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
