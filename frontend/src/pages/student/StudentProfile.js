import { Button, Card, Input, Modal, Tabs, Text } from "@geist-ui/core";
import { Key, User } from "@geist-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import ChangePassword from "../../components/student/UserSettings/ChangePassword";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { validateEmail, validatePhone } from "../../utils/formValidation";
import getFormData from "../../utils/getFormData";

export default function StudentProfile() {
	const user = useUserStore((state) => state.user);
	const navigate = useNavigate();
	const [userData, setUserData] = useState({});
	const [update, setUpdate] = useState(false);
	const [token, setToken] = useState("");
	const [isEmailUpdate, setIsEmailUpdate] = useState(false);
	const [isPhoneUpdate, setIsPhoneUpdate] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [updateData, setUpdateData] = useState({});
	const closeUpdateHandler = (event) => {
		setUpdate(false);
	};
	useEffect(() => {
		Fetch({
			url: "/user/get-by-id",
			method: "POST",
			data: {
				user_id: user?.user_id,
			},
		}).then((res) => {
			if (res && res.status === 200) {
				setUserData(res.data.user);
			} else {
				toast("Error fetching profile details; retry", {
					type: "error",
				});
			}
		});
	}, [user]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isEditing) {
			setIsEditing(true);
		} else {
			const formData = getFormData(e);
			if (
				formData.name_profile === "" &&
				formData.email_profile === "" &&
				formData.phone_profile === ""
			) {
				toast("No changes to commit!");
			} else if (
				formData.name_profile === userData.name &&
				formData.email_profile === userData.email &&
				formData.phone_profile === userData.phone
			) {
				toast("No changes to commit!");
			} else {
				setUpdate(true);
				setUpdateData(formData);
				setIsEditing(false);
			}
		}
	};

	const updateProfile = async () => {
		setUpdate(false);
		const updateData1 = {
			user_id: user?.user_id,
			name:
				updateData.name_profile !== ""
					? updateData.name_profile
					: userData.name,
			email:
				updateData.email_profile !== ""
					? updateData.email_profile
					: userData.email,
			phone:
				updateData.phone_profile !== ""
					? updateData.phone_profile
					: userData.phone,
		};

		const [validPhone, phoneError] = validatePhone(updateData1.phone);
		if (!validPhone) {
			toast(phoneError.message, { type: "error" });
			return;
		}
		if (!updateData1.phone.startsWith("+91")) {
			updateData1.phone = "+91" + updateData1.phone;
		}
		const [validEmail, emailError] = validateEmail(updateData1.email);
		if (!validEmail) {
			toast(emailError.message, { type: "error" });
			return;
		}

		if (
			updateData.email_profile !== "" &&
			updateData.email_profile !== userData.email
		) {
			setIsEmailUpdate(true);
			toast("Email Update");
		}
		if (
			updateData.phone_profile !== "" &&
			updateData.phone_profile !== userData.phone
		) {
			//do otp verification on old number and if verified then register new number.
			setIsPhoneUpdate(true);
			toast("Phone Update");
		}
	};

	const sendEmail = async () => {
		Fetch({
			url: "/update-request/register",
			method: "POST",
			data: {
				user_id: userData.user_id,
				username: userData.username,
				name: userData.name,
				old_email: userData.email,
				new_email: updateData.email_profile,
				phone: userData.phone,
				request_date: new Date(),
				is_approved: false,
			},
		})
			.then((res) => {
				console.log(res);
				toast("Update sent successfully", { type: "success" });
			})
			.catch((err) => {
				toast(`Error : ${err.response.data.error}`, {
					type: "error",
				});
			});
	};
	return (
		<div>
			<div>
				<StudentNavbar />
			</div>
			<div className="container mx-auto my-8 p-8 bg-gray-100 rounded-md shadow-md">
				<div>
					<Card type="cyan" shadow hoverable>
						<div className="flex flex-col items-center justify-center">
							<Text h2>Hello {user?.name}</Text>
							<Text h6>Welcome to your profile page!</Text>
						</div>
					</Card>
					<br />
					<Tabs initialValue="1" align="center" leftSpace={0}>
						<Tabs.Item
							label={
								<>
									<User /> Update Profile Details
								</>
							}
							value="1">
							<Card>
								<form
									className="flex flex-col gap-2 my-8"
									onSubmit={handleSubmit}>
									<Input
										width="100%"
										name="name_profile"
										placeholder={userData?.name}
										disabled={!isEditing}
										defaultValue={userData?.name}>
										Name
									</Input>
									<Input
										width="100%"
										name="username_profile"
										placeholder={userData?.username}
										disabled={true}>
										Username
									</Input>
									<Input
										width="100%"
										name="email_profile"
										placeholder={userData?.email}
										disabled={!isEditing}>
										Email ID
									</Input>
									<Input
										width="100%"
										name="phone_profile"
										placeholder={userData?.phone}
										disabled={!isEditing}>
										Phone Number
									</Input>

									<Button type="warning" htmlType="submit">
										{isEditing
											? "Save Changes"
											: "Edit Profile"}
									</Button>
								</form>
								<br />
							</Card>
						</Tabs.Item>
						<Tabs.Item
							label={
								<>
									<Key />
									Change Password{" "}
								</>
							}
							value="2">
							<Card>
								<ChangePassword />
							</Card>
						</Tabs.Item>
					</Tabs>
				</div>
			</div>
			<div>
				<Modal visible={update} onClose={closeUpdateHandler}>
					<Modal.Title>Update Profile</Modal.Title>
					<Modal.Content>
						<p>Do you really wish to update your profile?</p>
					</Modal.Content>
					<Modal.Action passive onClick={() => setUpdate(false)}>
						No
					</Modal.Action>
					<Modal.Action onClick={updateProfile}>Yes</Modal.Action>
				</Modal>
				{isEmailUpdate && (
					<Card type="error">
						<div className="border text-center rounded-lg p-4">
							<p>We will send a request to the admin.</p>
							<p>
								Please{" "}
								<Button onClick={sendEmail}>
									Send A Request
								</Button>{" "}
								<br />
								to update your Email ID.
							</p>
						</div>
					</Card>
				)}
			</div>
		</div>
	);
}
