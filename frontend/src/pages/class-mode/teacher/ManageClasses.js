import { Card, Divider, Text } from "@geist-ui/core";
import { Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import RegisterNewClass from "../../../components/class-mode/teacher/RegisterClassForm";
import ViewDetailsModal from "../../../components/class-mode/teacher/ViewDetailsModal";
import { Fetch } from "../../../utils/Fetch";

export default function ManageClasses() {
	// const [allClasses, setAllClasses] = useState(null);
	const navigate = useNavigate();
	const [regVisible, setRegVisible] = useState(false);

	const [today, setToday] = useState("");
	const [activeClasses, setActiveClasses] = useState([]);
	const [inactiveClasses, setInactiveClasses] = useState([]);
	const [currentTime, setCurrentTime] = useState("");
	const [activeClassModal, setActiveClassModal] = useState(false);
	const [activeClassId, setActiveClassId] = useState(null);

	const { data: allClasses, refetch: refetchClasses } = useQuery({
		queryKey: ["allClasses"],
		queryFn: async () => {
			const response = await Fetch({
				url: "/class-mode/get-all",
				method: "GET",
			});
			// console.log(response);
			if (response.status === 200) {
				if (response.data) {
					let tempActiveClasses = [];
					let tempInactiveClasses = [];
					let current_time = new Date();
					for (var i = 0; i !== response.data.length; i++) {
						// let days = allClasses[i]["days"];
						// if (days.includes(today)) {
						// 	tempActiveClasses.push(allClasses[i]);
						// } else {
						// 	tempInactiveClasses.push(allClasses[i]);
						// }

						let start_time = new Date(response.data[i].start_time);
						let end_time = new Date(response.data[i].end_time);

						if (
							start_time <= current_time &&
							current_time <= end_time
						) {
							tempActiveClasses.push(response.data[i]);
						} else {
							tempInactiveClasses.push(response.data[i]);
						}
					}
					setActiveClasses(tempActiveClasses);
					setInactiveClasses(tempInactiveClasses);
				}

				return response.data;
			} else {
				return [];
			}
		},
	});

	const handleButtonClick = (rowData) => {
		const now = new Date();
		const days = [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
		];
		setActiveClassModal(true);
		setActiveClassId(rowData.row.original._id);
	};

	useEffect(() => {
		console.log(today, currentTime);
	}, [today, currentTime]);

	useEffect(() => {
		if (!activeClassId) {
			setActiveClassId(null);
		}
	}, [activeClassModal]);

	const columnsDataTable = useMemo(
		() => [
			{
				accessorKey: "_id",
				header: ({ column }) => (
					<SortableColumn column={column}>Class ID</SortableColumn>
				),
			},
			{
				accessorKey: "class_name",
				header: ({ column }) => (
					<SortableColumn column={column}>Class Name</SortableColumn>
				),
			},
			{
				accessorKey: "class_desc",
				header: ({ column }) => (
					<SortableColumn column={column}>Description</SortableColumn>
				),
				cell: ({ getValue }) => {
					return (
						<div>
							<span className="max-w-[35ch] break-all">
								{getValue()}
							</span>
						</div>
					);
				},
			},
			{
				accessorKey: "start_time",
				header: ({ column }) => (
					<SortableColumn column={column}>Start Time</SortableColumn>
				),
				cell: ({ getValue }) => {
					return (
						<div>
							<span>{new Date(getValue()).toLocaleString()}</span>
						</div>
					);
				},
			},
			{
				accessorKey: "end_time",
				header: ({ column }) => (
					<SortableColumn column={column}>End Time</SortableColumn>
				),
				cell: ({ getValue }) => {
					return (
						<div>
							<span>{new Date(getValue()).toLocaleString()}</span>
						</div>
					);
				},
			},

			{
				accessorKey: "status",
				header: ({ column }) => (
					<SortableColumn column={column}>Status</SortableColumn>
				),
			},
			{
				accessorKey: "actions",
				header: () => <span>Actions</span>,
				cell: (rowData) => (
					<Button onClick={() => handleButtonClick(rowData)}>
						View Details
					</Button>
				),
			},
		],
		[]
	);

	return (
		<AdminPageWrapper heading="Manage Classes">
			<div>
				<Button onClick={() => setRegVisible(true)}>
					Register New Class
				</Button>
			</div>

			<RegisterNewClass visible={regVisible} setVisible={setRegVisible} />

			<div className="elements">
				<Card hoverable>
					<Text h5>Today's Classes</Text>
					<DataTable
						columns={columnsDataTable}
						data={activeClasses || []}
						refetch={refetchClasses}></DataTable>
				</Card>
				<Divider />
				<Card hoverable>
					<Text h5>Upcoming/Expired Classes</Text>
					<DataTable
						columns={columnsDataTable}
						data={inactiveClasses || []}
						refetch={refetchClasses}></DataTable>
				</Card>
			</div>

			<ViewDetailsModal
				activeClassModal={activeClassModal}
				activeClassModalData={allClasses?.find(
					(c) => c._id === activeClassId
				)}
				setActiveClassModal={setActiveClassModal}
				refetchClasses={refetchClasses}
			/>
		</AdminPageWrapper>
	);
}
