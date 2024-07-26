import { Modal, Spacer, Text } from "@geist-ui/core";
import { ArrowOutward } from "@mui/icons-material";
import {
	Button,
	CircularProgress,
	Divider,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { ClassAPI } from "../../../api/class.api";
import {
	CLASS_CANCELLED,
	CLASS_COMPLETED,
	CLASS_ONGOING,
	CLASS_UPCOMING,
} from "../../../enums/class_status";
import useUserStore from "../../../store/UserStore";
import getFormData from "../../../utils/getFormData";
import { getFrontendDomain } from "../../../utils/getFrontendDomain";
import { DataTable } from "../../Common/DataTable/DataTable";
import SortableColumn from "../../Common/DataTable/SortableColumn";
import Timer from "../../Common/Timer";

function StatusUpdate({ status, class_id, class_history_id }) {
	const [statusVal, setStatusVal] = useState(status);
	const queryClient = useQueryClient();

	const handleChange = async (e) => {
		setStatusVal(e.target.value);

		const [res, err] = await ClassAPI.postUpdateClassHistoryStatus(
			class_history_id,
			e.target.value
		);

		if (err) {
			// console.error(err);
			toast.error("Failed to update status");
			return;
		}

		toast.success("Status updated successfully");

		queryClient.invalidateQueries({
			queryKey: ["classHistory", class_id],
		});
	};

	return (
		<>
			{statusVal ? (
				<FormControl>
					<InputLabel id="status-update-dropdown">Status</InputLabel>
					<Select
						labelId="status-update-dropdown"
						value={statusVal}
						onChange={handleChange}>
						{[
							CLASS_UPCOMING,
							CLASS_ONGOING,
							CLASS_COMPLETED,
							CLASS_CANCELLED,
						].map((ss) => (
							<MenuItem key={ss + class_history_id} value={ss}>
								{ss}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			) : (
				<CircularProgress />
			)}
		</>
	);
}

export default function ViewDetailsModal({
	activeClassModal,
	activeClassModalData,
	setActiveClassModal,
	refetchClasses = () => {},
}) {
	const [dirty, setDirty] = useState(false);
	const queryClient = useQueryClient();

	const user = useUserStore((state) => state.user);

	const { data: classHistory, refetch: refetchClassHistory } = useQuery({
		queryKey: ["classHistory", activeClassModalData?._id],

		queryFn: async () => {
			console.log("GETTING CLASS HISTORY INFO");
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

		let old_start_time = activeClassModalData.onetime_class_start_time;
		let old_end_time = activeClassModalData.onetime_class_end_time;

		if (start_time === "") {
			start_time = activeClassModalData.onetime_class_start_time;
		}

		if (end_time === "") {
			end_time = activeClassModalData.onetime_class_end_time;
		}

		const [res, err] = await ClassAPI.postUpdateClass(
			activeClassModalData._id,
			formData.class_name,
			formData.class_desc,
			formData.status,
			user?.user_id,
			old_start_time,
			old_end_time,
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
		queryClient.invalidateQueries({
			queryKey: ["classHistory", activeClassModalData?._id],
		});
	};

	const classHistoryTableColumns = useMemo(() => {
		return [
			{
				header: "Name",
				accessorKey: "class_name",
			},
			{
				header: "Description",
				accessorKey: "class_desc",
				cell: ({ getValue }) => {
					return (
						<p className="max-w-[20ch] break-all">{getValue()}</p>
					);
				},
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
				cell: ({ getValue }) => {
					return <p>{new Date(getValue()).toLocaleString()}</p>;
				},
			},
			{
				header: ({ column }) => (
					<SortableColumn column={column}>End Time</SortableColumn>
				),
				accessorKey: "end_time",
				cell: ({ getValue }) => {
					return <p>{new Date(getValue()).toLocaleString()}</p>;
				},
			},
			{
				header: "Update Status",
				accessorKey: "status",
				cell: ({ getValue, row }) => {
					// console.log(getValue());
					return (
						<StatusUpdate
							status={getValue()}
							class_history_id={row?.original?._id}
							class_id={activeClassModalData?._id}
						/>
					);
				},
			},
		];
	}, []);

	return (
		<Modal
			visible={activeClassModal}
			onClose={() => setActiveClassModal(false)}
			w="70%">
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
							className="flex flex-col gap-2 items-center justify-center my-10 bg-white max-w-2xl mx-auto"
							onSubmit={handleSubmit}>
							<TextField
								name="class_name"
								label="Class Name"
								fullWidth
								className="w-full flex-1"
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

							<div className="flex gap-2">
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
							</div>

							<div className="flex flex-row gap-2">
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
							</div>
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
					<div className="flex flex-row gap-2">
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

					<h3>Class History</h3>
					<DataTable
						columns={classHistoryTableColumns}
						data={classHistory ?? []}
						refetch={refetchClassHistory}
					/>
				</div>
			</Modal.Content>
		</Modal>
	);
}
