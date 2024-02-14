import { Card, Collapse, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function Institutes() {
	const [institutes, setInstitutes] = useState([]);
	const [completed, setCompleted] = useState(false);
	const [instituteData, setInstituteData] = useState([]);
	const [teacherData, setTeacherData] = useState([]);

	const appendToUsers = (newUserData) => {
		setInstituteData((prevUsers) => [...prevUsers, newUserData]);
	};

	const appendToTeacherData = (new1) => {
		setTeacherData((prev) => [...prev, new1]);
	};

	useEffect(() => {
		if (institutes.length > 0) {
			setInstituteData([]);
			for (var i = 0; i != institutes.length; i++) {
				Fetch({
					url: "http://localhost:4000/institute/get-by-instituteid",
					method: "POST",
					data: {
						institute_id: institutes[i].institute_id,
					},
				}).then((res) => {
					if (res && res.status === 200) {
						appendToUsers(res.data);
					} else {
						toast("Error updating profile; retry", {
							type: "error",
						});
					}
				});
			}
		}
	}, [institutes]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "http://localhost:4000/user/get-all-institutes",
					method: "GET",
				});
				const data = response.data;
				setInstitutes(data.users);
				setCompleted(true);
			} catch (err) {
				console.error("Error fetching institutes:", err);
				toast("Error fetching institutes. Please try again.", {
					type: "error",
				});
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		const fetchInstituteData = async () => {
			if (completed) {
				try {
					setTeacherData([]);
					const teacherPromises = institutes.map(
						async (institute) => {
							const id1 = institute.institute_id;
							const res = await Fetch({
								url: "http://localhost:4000/institute/teacher/get-all-by-instituteid",
								method: "POST",
								data: {
									institute_id: id1,
								},
							});

							return { id1, teachers: res.data.teachers };
						}
					);

					const teacherResults = await Promise.all(teacherPromises);
					teacherResults.forEach(({ id1, teachers }) => {
						if (Array.isArray(teachers) && teachers.length > 0) {
							appendToTeacherData({ [id1]: teachers });
						}
					});
				} catch (error) {
					console.error(
						"An error occurred while fetching teachers:",
						error
					);
					toast("Error fetching teachers. Please try again.", {
						type: "error",
					});
				}
			}
		};

		fetchInstituteData();
	}, [completed, institutes]);

	const InstituteCollapseGroup = ({ data }) => {
		return (
			<Collapse.Group>
				{data.map((institute) => (
					<Collapse
						key={institute.institute_id}
						title={institute.name}
						subtitle={`${institute.address1} ${institute.address2}`}>
						<Text>
							<strong>Email ID:</strong> {institute.email}
							<br />
							<strong>Phone:</strong> {institute.phone}
							<br />
							<strong>Teachers:</strong>{" "}
							{getTeacherNames(institute.institute_id)}
							<br />
						</Text>
					</Collapse>
				))}
			</Collapse.Group>
		);
	};

	const getTeacherNames = (instituteId) => {
		const teachersData = teacherData.find((data) => data[instituteId]);
		if (teachersData) {
			const teachers = teachersData[instituteId];
			return teachers.map((teacher) => teacher.user.name).join(", ");
		}
		return "No teachers available";
	};

	return (
		<div className="allAsanas min-h-screen">
			<AdminNavbar />
			<div className="flex flex-col items-center gap-2 p-6 bg-gray-500 text-white mt-10 mx-10 rounded-md">
				<Card width="100%">
					<InstituteCollapseGroup data={instituteData} />
				</Card>
			</div>
		</div>
	);
}

export default withAuth(Institutes, ROLE_ROOT);
