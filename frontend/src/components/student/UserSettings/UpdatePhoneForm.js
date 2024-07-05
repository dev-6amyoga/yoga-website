import EditIcon from "@mui/icons-material/Edit";
import {
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

export default function UpdatePhoneForm() {
	const user = useUserStore((state) => state.user);
	const [update, setUpdate] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [phone, setPhone] = useState("");

	const inputErrorDebounce = useRef(null);

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

	const [phoneError, setPhoneError] = useState(null);
	const [emailError, setEmailError] = useState(null);
	const [usernameError, setUsernameError] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setPhone(() => value);
	};

	const closeUpdateHandler = (event) => {
		setUpdate(false);
	};

	useEffect(() => {
		if (userData) {
			setPhone(userData.phone);
		}
	}, [userData]);

	// check phone number
	useEffect(() => {
		if (inputErrorDebounce.current)
			clearTimeout(inputErrorDebounce.current);

		inputErrorDebounce.current = setTimeout(async () => {
			console.log("Checking phone number");

			if (phone) {
				const [is_phone_valid, phone_error] =
					await validatePhone(phone);

				if (!is_phone_valid || phone_error) {
					setPhoneError(phone_error.message);

					return;
				}

				const [check_phone, error] =
					await UserAPI.postCheckPhoneNumber(phone);

				if (error) {
					toast(error.message, { type: "warning" });
					return;
				}

				if (check_phone?.exists) {
					setPhoneError("Phone number exists");

					return;
				}
			}
			setPhoneError(null);
		}, 500);

		return () => {
			if (inputErrorDebounce.current)
				clearTimeout(inputErrorDebounce.current);
		};
	}, [phone]);

	return (
		<div className="w-full">
			<div className="flex w-full gap-4">
				<TextField
					fullWidth
					name="phone_profile"
					label={isEditing ? "Phone" : ""}
					placeholder={userData?.phone}
					onChange={handleChange}
					disabled={!isEditing}
					sx={{ mb: 2 }}
					helperText={phoneError ? phoneError : " "}
					error={phoneError ? true : false}
				/>

				<div>
					<Button
						startIcon={<EditIcon />}
						onClick={() => {
							setPhone(null);
							setIsEditing(true);
						}}>
						Edit Profile
					</Button>
				</div>
			</div>

			{}

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
