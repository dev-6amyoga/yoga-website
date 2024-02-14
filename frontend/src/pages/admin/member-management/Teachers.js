import { Table } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function Teachers() {
	const [teachers, setTeachers] = useState([]);
	const [users, setUsers] = useState([]);
	const appendToUsers = (newUserData) => {
		setUsers((prevUsers) => [...prevUsers, newUserData]);
	};
	useEffect(() => {
		setUsers([]);
		if (teachers.length > 0) {
			for (var i = 0; i != teachers.length; i++) {
				console.log(teachers[i].user_id);
				Fetch({
					url: "http://localhost:4000/user/get-by-id",
					method: "POST",
					data: {
						user_id: teachers[i].user_id,
					},
				}).then((res) => {
					if (res && res.status === 200) {
						console.log(res.data.user);
						appendToUsers(res.data.user);
					} else {
						toast("Error updating profile; retry", {
							type: "error",
						});
					}
				});
			}
		}
	}, [teachers]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "http://localhost:4000/user/get-all-teachers",
					method: "GET",
				});
				const data = response.data;
				console.log("THIS IS DATA : ", data);
				setTeachers(data.users);
			} catch (err) {
				console.log(err);
			}
		};
		fetchData();
	}, []);
	return (
		<div className="allAsanas min-h-screen">
			<AdminNavbar />
			<div className="elements">
				<Table width={50} data={users} className="bg-white">
					<Table.Column prop="user_id" label="ID" />
					<Table.Column
						label="Teacher Name"
						width={150}
						prop="name"
					/>
					<Table.Column label="Email ID" width={150} prop="email" />
					<Table.Column label="Phone" width={150} prop="phone" />
				</Table>
			</div>
		</div>
	);
}

export default withAuth(Teachers, ROLE_ROOT);
