import { Button, TextField } from "@mui/material";
import { useEffect } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validatePassword } from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";

export default function ChangePassword() {
	let user = useUserStore((state) => state.user);

	useEffect(() => {}, [user]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = getFormData(e);
		const new_password = formData.new_password;
		const conf_new_password = formData.confirm_new_password;
		if (new_password !== conf_new_password) {
			toast("The new passwords do not match!");
			return;
		}

		const [is_password_valid, pass_error] = validatePassword(new_password);
		if (is_password_valid) {
			Fetch({
				url: "/user/update-password",
				method: "POST",
				data: { ...formData, user_id: user?.user_id },
			})
				.then((res) => {
					if (res && res.status === 200) {
						toast("Password updated successfully", {
							type: "success",
						});
					} else {
						toast("Error updating password; retry", {
							type: "error",
						});
					}
				})
				.catch((err) => {
					toast(
						"Error updating password: " +
							err?.response?.data?.error,
						{
							type: "error",
						}
					);
				});
		} else {
			toast("Password is invalid");
			return;
		}
	};

	return (
		<form
			className="flex flex-col gap-2"
			onSubmit={handleSubmit}
			style={{ width: "100%" }}>
			<TextField
				fullWidth
				required
				name="old_password"
				label="Old Password"
				type="password"
				variant="outlined"
			/>
			<br />
			<p
				className={
					"text-sm border p-2 rounded-lg text-zinc-500 border-red-500"
				}>
				Password must be minimum 8 letters and contain atleast 1 number,
				1 alphabet, 1 special character [!@#$%^&*,?]
			</p>
			<TextField
				fullWidth
				required
				name="new_password"
				label="New Password"
				type="password"
				variant="outlined"
			/>
			<TextField
				fullWidth
				required
				name="confirm_new_password"
				label="Confirm New Password"
				type="password"
				variant="outlined"
			/>

			<div className="flex flex-row gap-2 w-full">
				<Button
					className="flex-1"
					variant="contained"
					color="primary"
					type="submit">
					Update
				</Button>
				<Button
					className="flex-1"
					variant="outlined"
					color="secondary"
					type="reset">
					Reset
				</Button>
			</div>
		</form>
	);
}
