import { Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { useNavigate } from "react-router-dom";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import RegisterNewClass from "../../../components/class-mode/teacher/RegisterClassForm";
import ViewDetailsModal from "../../../components/class-mode/teacher/ViewDetailsModal";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";

import { Text } from "@geist-ui/core";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import { enGB, enIN } from "date-fns/locale";
import enUS from "date-fns/locale/en-US";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import { CLASS_TYPE_ONETIME } from "../../../enums/class_types";

const locales = {
	"en-US": enUS,
	"en-IN": enIN,
	"en-GB": enGB,
};

const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek,
	getDay,
	locales,
});

export default function ManageClasses() {
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
				url: "/class/teacher/get-all",
				method: "GET",
			});
			if (response.status === 200) {
				if (response.data) {
					let tempActiveClasses = [];
					let tempInactiveClasses = [];
					let current_time = new Date();

					for (var i = 0; i !== response.data.length; i++) {
						let classInfo = response.data[i];

						if (classInfo.class_type === CLASS_TYPE_ONETIME) {
							console.log(classInfo._id);
							let start_time = new Date(
								classInfo.onetime_class_start_time
							);
							let end_time = new Date(
								classInfo.onetime_class_end_time
							);

							if (
								start_time <= current_time &&
								current_time <= end_time
							) {
								tempActiveClasses.push(classInfo);
							} else {
								tempInactiveClasses.push(classInfo);
							}
						} else {
							tempInactiveClasses.push(classInfo);
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
		enabled: true, // Ensure the query is enabled
	});

	const user = useUserStore((state) => state.user);

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
		if (!activeClassId) {
			setActiveClassId(null);
		}
	}, [activeClassModal]);

	useEffect(() => {
		// Fetch classes data when component mounts
		refetchClasses();
	}, [refetchClasses]);

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
				accessorKey: "onetime_class_start_time",
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
				accessorKey: "onetime_class_end_time",
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
		<div>
			<div className="mb-10">
				<Button onClick={() => setRegVisible(true)} variant="contained">
					Register New Class
				</Button>
			</div>

			<RegisterNewClass visible={regVisible} setVisible={setRegVisible} />

			<div className="flex flex-col gap-2">
				<div>
					<Text h5>Today's Classes</Text>
					<DataTable
						columns={columnsDataTable}
						data={activeClasses || []}
						refetch={refetchClasses}></DataTable>
				</div>
				<div>
					<Text h5>Upcoming/Expired Classes</Text>
					<DataTable
						columns={columnsDataTable}
						data={inactiveClasses || []}
						refetch={refetchClasses}></DataTable>
				</div>
			</div>

			<div className="my-10">
				<Calendar
					localizer={localizer}
					events={[]}
					startAccessor="start"
					endAccessor="end"
					defaultView="month"
					style={{ height: 1000 }}
				/>
			</div>

			<ViewDetailsModal
				activeClassModal={activeClassModal}
				activeClassModalData={allClasses?.find(
					(c) => c._id === activeClassId
				)}
				setActiveClassModal={setActiveClassModal}
				refetchClasses={refetchClasses}
			/>
		</div>
	);
}

// const locales = {
//   "en-US": enUS,
//   "en-IN": enIN,
//   "en-GB": enGB,
// };

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek,
//   getDay,
//   locales,
// });

// export default function ManageClasses() {
//   const navigate = useNavigate();
//   const [regVisible, setRegVisible] = useState(true);
//   const [today, setToday] = useState("");
//   const [activeClasses, setActiveClasses] = useState([]);
//   const [inactiveClasses, setInactiveClasses] = useState([]);
//   const [currentTime, setCurrentTime] = useState("");
//   const [activeClassModal, setActiveClassModal] = useState(false);
//   const [activeClassId, setActiveClassId] = useState(null);

//   const { data: allClasses, refetch: refetchClasses } = useQuery({
//     queryKey: ["allClasses"],
//     queryFn: async () => {
//       const response = await Fetch({
//         url: "/class/teacher/get-all",
//         method: "GET",
//       });
//       // console.log(response);
//       if (response.status === 200) {
//         if (response.data) {
//           let tempActiveClasses = [];
//           let tempInactiveClasses = [];
//           let current_time = new Date();

//           for (var i = 0; i !== response.data.length; i++) {
//             let classInfo = response.data[i];

//             if (classInfo.class_type === CLASS_TYPE_ONETIME) {
//               console.log(classInfo._id);
//               let start_time = new Date(classInfo.onetime_class_start_time);
//               let end_time = new Date(classInfo.onetime_class_end_time);

//               if (start_time <= current_time && current_time <= end_time) {
//                 tempActiveClasses.push(classInfo);
//               } else {
//                 tempInactiveClasses.push(classInfo);
//               }
//             }
//           }
//           setActiveClasses(tempActiveClasses);
//           setInactiveClasses(tempInactiveClasses);
//         }

//         return response.data;
//       } else {
//         return [];
//       }
//     },
//     enabled: false,
//   });

//   const user = useUserStore((state) => state.user);

//   const handleButtonClick = (rowData) => {
//     const now = new Date();
//     const days = [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];
//     setActiveClassModal(true);
//     setActiveClassId(rowData.row.original._id);
//   };

//   useEffect(() => {
//     if (!activeClassId) {
//       setActiveClassId(null);
//     }
//   }, [activeClassModal]);

//   const columnsDataTable = useMemo(
//     () => [
//       {
//         accessorKey: "_id",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Class ID</SortableColumn>
//         ),
//       },
//       {
//         accessorKey: "class_name",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Class Name</SortableColumn>
//         ),
//       },
//       {
//         accessorKey: "onetime_class_start_time",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Start Time</SortableColumn>
//         ),
//         cell: ({ getValue }) => {
//           return (
//             <div>
//               <span>{new Date(getValue()).toLocaleString()}</span>
//             </div>
//           );
//         },
//       },
//       {
//         accessorKey: "onetime_class_end_time",
//         header: ({ column }) => (
//           <SortableColumn column={column}>End Time</SortableColumn>
//         ),
//         cell: ({ getValue }) => {
//           return (
//             <div>
//               <span>{new Date(getValue()).toLocaleString()}</span>
//             </div>
//           );
//         },
//       },

//       {
//         accessorKey: "status",
//         header: ({ column }) => (
//           <SortableColumn column={column}>Status</SortableColumn>
//         ),
//       },
//       {
//         accessorKey: "actions",
//         header: () => <span>Actions</span>,
//         cell: (rowData) => (
//           <Button onClick={() => handleButtonClick(rowData)}>
//             View Details
//           </Button>
//         ),
//       },
//     ],
//     []
//   );

//   return (
//     <div>
//       <div className="mb-10">
//         <Button onClick={() => setRegVisible(true)} variant="contained">
//           Register New Class
//         </Button>
//       </div>

//       <RegisterNewClass visible={regVisible} setVisible={setRegVisible} />

//       <div className="flex flex-col gap-2">
//         <div>
//           <Text h5>Today's Classes</Text>
//           <DataTable
//             columns={columnsDataTable}
//             data={activeClasses || []}
//             refetch={refetchClasses}
//           ></DataTable>
//         </div>
//         <div>
//           <Text h5>Upcoming/Expired Classes</Text>
//           <DataTable
//             columns={columnsDataTable}
//             data={inactiveClasses || []}
//             refetch={refetchClasses}
//           ></DataTable>
//         </div>
//       </div>

//       <div className="my-10">
//         <Calendar
//           localizer={localizer}
//           events={[]}
//           startAccessor="start"
//           endAccessor="end"
//           defaultView="month"
//           style={{ height: 1000 }}
//         />
//       </div>

//       <ViewDetailsModal
//         activeClassModal={activeClassModal}
//         activeClassModalData={allClasses?.find((c) => c._id === activeClassId)}
//         setActiveClassModal={setActiveClassModal}
//         refetchClasses={refetchClasses}
//       />
//     </div>
//   );
// }
