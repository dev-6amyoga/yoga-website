import { Modal, Spacer, Text } from "@geist-ui/core";
import { ArrowOutward } from "@mui/icons-material";
import {
	Button,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ClassAPI } from "../../../api/class.api";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import { getFrontendDomain } from "../../../utils/getFrontendDomain";
import SortableColumn from "../../Common/DataTable/SortableColumn";
import Timer from "../../Common/Timer";

export default function ViewDetailsModal({
	activeClassModal,
	activeClassModalData,
	setActiveClassModal,
	refetchClasses = () => {},
}) {
	const [dirty, setDirty] = useState(false);

	const user = useUserStore((state) => state.user);

	const { data: classHistory, refetch: refetchClassHistory } = useQuery({
		queryKey: ["classHistory", activeClassModalData?._id],

		queryFn: async () => {
			const [res, err] = await ClassAPI.postGetClassHistoryById(
				activeClassModalData._id
			);

			if (err) {
				console.error(err);
				toast.error("Failed to fetch class history info");
				throw err;
			}

			console.log(res);

			return res.class_history;
		},

		enabled:
			activeClassModalData !== null && activeClassModalData !== undefined,
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);

		if (!user) {
			toast.error("User not found");
			return;
		}

		if (!dirty) {
			// formData["days"] = days;

			// console.log(formData, new Date(formData.start_time).toISOString());

			return;
		}

		let start_time = formData.start_time;
		let end_time = formData.end_time;

		if (start_time === "") {
			start_time = activeClassModalData.start_time;
		}

		if (end_time === "") {
			end_time = activeClassModalData.end_time;
		}

		const [res, err] = await ClassAPI.postUpdateClass(
			activeClassModalData._id,
			formData.class_name,
			formData.class_desc,
			formData.status,
			user?.user_id,
			new Date(start_time).toISOString(),
			new Date(end_time).toISOString()
		);

		if (err) {
			toast.error("Error updating class");
			return;
		}

		toast.success("Class updated successfully");
		refetchClasses();
		setDirty(false);
	};

	useEffect(() => {
		const fetchData = async () => {
			toast("hello!");
			console.log(activeClassModalData, "HELLO");
			const response = await Fetch({
				url: "/class/get-history",
				method: "POST",
				data: { class_id: activeClassModalData.class_id },
			});
			if (response.status === 200) {
				console.log(response, "HELLO");
			}
		};
		if (activeClassModal) {
			fetchData();
		}
	}, [activeClassModalData]);

	const classHistoryTableColumns = useMemo(() => {
		return [
			{
				header: ({ column }) => (
					<SortableColumn column={column}>Class Name</SortableColumn>
				),
				accessorKey: "class_name",
			},
			{
				header: ({ column }) => (
					<SortableColumn column={column}>Description</SortableColumn>
				),
				accessorKey: "class_desc",
			},
			{
				header: ({ column }) => (
					<SortableColumn column={column}>Status</SortableColumn>
				),
				accessorKey: "status",
			},
			{
				header: ({ column }) => (
					<SortableColumn column={column}>Start Time</SortableColumn>
				),
				accessorKey: "start_time",
			},
			{
				header: ({ column }) => (
					<SortableColumn column={column}>End Time</SortableColumn>
				),
				accessorKey: "end_time",
			},
		];
	}, []);

	return (
		<Modal
			visible={activeClassModal}
			onClose={() => setActiveClassModal(false)}
			w="50%">
			<Modal.Title>{activeClassModalData?.class_name}</Modal.Title>
			<Modal.Subtitle>
				<Timer
					endTime={activeClassModalData?.onetime_class_end_time}
					onEndTitle="Past Due Date"
				/>
			</Modal.Subtitle>
			<Modal.Content>
				<div className="flex flex-col align-center">
					{dirty ? (
						<form
							className="flex-col items-center justify-center space-y-10 my-10 bg-white"
							onSubmit={handleSubmit}>
							<TextField
								name="class_name"
								label="Class Name"
								className="w-full"
								defaultValue={activeClassModalData?.class_name}
								required
							/>
							<TextField
								name="class_desc"
								label="Class Description"
								className="w-full"
								defaultValue={activeClassModalData?.class_desc}
								required
							/>
							<FormControl fullWidth>
								<InputLabel>Status</InputLabel>
								<Select
									name="status"
									label="Status"
									defaultValue={activeClassModalData?.status}>
									{[
										"CLASS_METADATA_DRAFT",
										"CLASS_METADATA_ACTIVE",
										"CLASS_METADATA_INACTIVE",
									].map((status) => (
										<MenuItem value={status}>
											{status}
										</MenuItem>
									))}
								</Select>
							</FormControl>

							<div className="mb-4">
								<p className="text-sm text-gray-600">
									Start Time (Previously :{" "}
									{new Date(
										activeClassModalData.onetime_class_start_time
									).toLocaleString()}
									)
								</p>
								<input
									type="datetime-local"
									name="start_time"
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="mb-4">
								<p className="text-sm text-gray-600">
									End Time (Previously :{" "}
									{new Date(
										activeClassModalData.onetime_class_end_time
									).toLocaleString()}
									)
								</p>
								<input
									type="datetime-local"
									name="end_time"
									className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<Button
								type="submit"
								className="w-full"
								variant="contained">
								Submit
							</Button>
							<Button
								type="button"
								className="w-full"
								onClick={() => {
									setDirty(false);
								}}
								variant="outlined">
								Cancel
							</Button>
						</form>
					) : (
						<div className="flex flex-col">
							<Text>
								Start Time :{" "}
								{activeClassModalData?.onetime_class_start_time &&
									new Date(
										activeClassModalData.onetime_class_start_time
									).toLocaleString()}
							</Text>
							<Text>
								End Time :{" "}
								{activeClassModalData?.onetime_class_end_time &&
									new Date(
										activeClassModalData.onetime_class_end_time
									).toLocaleString()}
							</Text>
							{/* <Text>Days: {activeClassModalData.days.join(", ")}</Text> */}
							<Text>
								Description : {activeClassModalData?.class_desc}
							</Text>

							{/* <Text>Status : {activeClassModalData?.status}</Text> */}
						</div>
					)}
					<Spacer />
					<Divider />

					<Spacer />
					<div className="flex flex-col gap-2">
						<Button
							variant="outlined"
							startIcon={<ArrowOutward />}
							onClick={() => {
								window.open(
									`${getFrontendDomain()}/teacher/class/${activeClassModalData._id}/info`,
									"_blank"
								);
							}}>
							Teacher Link
						</Button>
						<Button
							variant="outlined"
							startIcon={<ArrowOutward />}
							onClick={() => {
								window.open(
									`${getFrontendDomain()}/student/class/${activeClassModalData._id}/info`,
									"_blank"
								);
							}}>
							Student Link
						</Button>
						<Button
							variant="contained"
							onClick={() => {
								if (dirty) {
									setDirty(false);
								} else {
									setDirty(true);
								}
							}}>
							{dirty ? "Save" : "Edit"}
						</Button>
					</div>

					<Spacer />
					<Divider />

					<Spacer />

					{/* <DataTable
						columns={classHistoryTableColumns}
						data={classHistory}
					/> */}
				</div>
			</Modal.Content>
		</Modal>
	);
}
