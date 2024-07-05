import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UserAPI } from "../../../api/user.api";
import useUserStore from "../../../store/UserStore";

export function UpdateEmailForm() {
	const user = useUserStore((state) => state.user);
	const [update, setUpdate] = useState(false);

	const [isEditing, setIsEditing] = useState(false);

	const [updateData, setUpdateData] = useState({});

	const [formData, setFormData] = useState({
		name_profile: "",
		username_profile: "",
		email_profile: "",
		phone_profile: "",
	});

	const {
		data: userData,
		isLoading,
		refetch: refetchUser,
	} = useQuery({
		queryKey: ["user", user?.user_id],
		queryFn: async () => {
			const [res, error] = await UserAPI.postGetUserByID(user?.user_id);

			console.log(res.user);

			if (error) {
				toast(error.message, { type: "error" });
				return {};
			}

			return res?.user;
		},
	});

	const [emailError, setEmailError] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const inputErrorDebounce = useRef(null);

	// check email
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
			console.log("Checking email");

			if (formData?.email_profile) {
				const [is_email_valid, email_error] = validateEmail(
					formData?.email_profile
				);

				if (!is_email_valid || email_error) {
					setEmailError(email_error.message);
					return;
				}

				const [check_email, error] = await UserAPI.postCheckEmail(
					formData?.email_profile
				);

				if (error) {
					toast(error.message, { type: "warning" });
					return;
				}

				if (check_email?.exists) {
					setEmailError("Email exists");

					return;
				}
			}
			setEmailError(null);
		}, 500);

		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [formData?.email_profile]);

	const handleUpdateEmail = () => {
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
				setIsEmailUpdate(false);
			})
			.catch((err) => {
				toast(`Error : ${err.response.data.error}`, {
					type: "error",
				});
				setIsEmailUpdate(false);
			});
	};
	const closeUpdateHandler = (event) => {
		setUpdate(false);
	};

	return (
		<div>
			<form onSubmit={handleUpdateEmail}>
				<TextField
					fullWidth
					name="email_profile"
					label={isEditing ? "Email" : ""}
					placeholder={userData?.email}
					onChange={handleChange}
					disabled={!isEditing}
					sx={{ mb: 2 }}
					helperText={emailError ? emailError : " "}
					error={emailError ? true : false}
				/>

				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						mt: 2,
					}}>
					{isEditing ? (
						<>
							<Button
								type="submit"
								variant="contained"
								color="primary"
								startIcon={<SaveIcon />}
								sx={{ mr: 2 }} // Add right margin to the "Save" button
								disabled={
									usernameError !== null ||
									emailError !== null ||
									phoneError !== null
								}>
								Save Changes
							</Button>
							<Button
								// onClick={() => {
								// 	setIsEditing(false);
								// 	setFormData({
								// 		name_profile: "",
								// 		username_profile: "",
								// 		email_profile: "",
								// 		phone_profile: "",
								// 	});
								// }}
								variant="outlined"
								type="reset"
								startIcon={<CancelIcon />}>
								Cancel
							</Button>
						</>
					) : (
						<Button
							onClick={(e) => {
								e.preventDefault();
								setIsEditing(true);
							}}
							type="button"
							variant="outlined"
							startIcon={<EditIcon />}>
							Edit Profile
						</Button>
					)}
				</Box>
			</form>

			{/* Update Confirmation Dialog */}
			<Dialog open={update} onClose={closeUpdateHandler}>
				<DialogTitle>Update Profile</DialogTitle>
				<DialogContent>
					<Typography variant="body1">
						Do you really wish to update your profile?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setUpdate(false)}>No</Button>
					<Button onClick={() => {}} autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
