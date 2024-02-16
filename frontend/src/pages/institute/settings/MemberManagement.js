import { Button, Grid, Modal, Table } from "@geist-ui/core";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";

import { toast } from "react-toastify";
import { ROLE_INSTITUTE_OWNER } from "../../../enums/roles";
import { withAuth } from "../../../utils/withAuth";

function MemberManagement() {
	const [teachers, setTeachers] = useState([]);
	const [numberOfTeachers, setNumberOfTeachers] = useState(0);
	const [user, institutes, currentInstituteId] = useUserStore(
		useShallow((state) => [
			state.user,
			state.institutes,
			state.currentInstituteId,
		])
	);
	const [delUserID, setDelUserID] = useState(0);
	const [delState, setDelState] = useState(false);
	const closeDelHandler = (event) => {
		setDelState(false);
	};
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"http://localhost:4000/user-plan/get-user-plan-by-id",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ user_id: user?.user_id }),
					}
				);
				const data = await response.json();
				console.log(data?.userPlan?.plan?.number_of_teachers);
			} catch (error) {
				console.log(error);
			}
		};
		if (user) {
			fetchData();
		}
	}, [user]);

	const renderAction = (value, rowData, index) => {
		const handleDelete = async () => {
			try {
				setDelUserID(rowData.user_id);
				setDelState(true);
			} catch (error) {
				console.error(error);
			}
		};

		return (
			<Grid.Container gap={0.1}>
				<Grid>
					<Button
						type="error"
						auto
						scale={1 / 3}
						font="12px"
						onClick={handleDelete}>
						Remove
					</Button>
				</Grid>
			</Grid.Container>
		);
	};

	const getTeachers = useCallback(async () => {
		setTeachers([]);
		try {
			const res = await Fetch({
				url: "http://localhost:4000/institute/teacher/get-all-by-instituteid",
				method: "POST",
				data: {
					institute_id: currentInstituteId,
				},
			});

			setTeachers(() => res?.data?.teachers?.map((t) => t.user));
		} catch (err) {
			toast(`Error : ${err?.response?.data?.message}`, {
				type: "error",
			});
		}
	}, []);
	useEffect(() => {
		getTeachers();
	}, [getTeachers]);

	const deleteTeacher = async () => {
		try {
			const del_id = delUserID;
			try {
				Fetch({
					url: "http://localhost:4000/user/delete-by-id",
					method: "DELETE",
					data: {
						user_id: del_id,
					},
				})
					.then((res) => {
						if (res.status === 200) {
							toast("Deleted!");
							setTeachers((prev) =>
								prev.filter((x) => x.user_id !== del_id)
							);
						} else {
							toast("Error deleting user:", res.status);
						}
					})
					.catch((err) => {
						console.log(err);
					});
				setDelState(false);
			} catch (error) {
				console.log(error);
			}
			setDelState(false);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<InstitutePageWrapper heading="Member Management">
			<div className="max-w-7xl mx-auto">
				<h4>All Teachers</h4>
				<Table width={50} data={teachers} className="bg-white ">
					<Table.Column prop="name" label="Teacher Name" />
					<Table.Column prop="username" label="Username" />
					<Table.Column prop="email" label="Email ID" />
					<Table.Column
						prop="operation"
						label="ACTIONS"
						width={150}
						render={renderAction}
					/>
				</Table>
				<div>
					<Modal visible={delState} onClose={closeDelHandler}>
						<Modal.Title>Remove Teacher</Modal.Title>
						<Modal.Content>
							<p>
								Do you really wish to remove this teacher from
								the institute?
							</p>
						</Modal.Content>
						<Modal.Action
							passive
							onClick={() => setDelState(false)}>
							No
						</Modal.Action>
						<Modal.Action onClick={deleteTeacher}>Yes</Modal.Action>
					</Modal>
				</div>
			</div>
		</InstitutePageWrapper>
	);
}

export default withAuth(MemberManagement, ROLE_INSTITUTE_OWNER);
