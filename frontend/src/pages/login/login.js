import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
// import { Button } from "../../components/ui/button";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { navigateToDashboard } from "../../utils/navigateToDashboard";
import "./login.css";

import { LockOutlined } from "@mui/icons-material";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";
import LoginGoogle from "../../components/auth/LoginGoogle";
import getFormData from "../../utils/getFormData";
import Otp from "../otp/Otp";

export default function Login({ switchForm }) {
	const navigate = useNavigate();
	const [type, SetType] = useState("");
	const [number, setNumber] = useState("");
	const [userNow, setUserNow] = useState(null);
	const [phoneSignIn, setPhoneSignIn] = useState(false);
	const [phoneSignInVisible, setPhoneSignInVisible] = useState(false);
	const [mainVisible, setMainVisible] = useState(true);
	const [forgotPassword, setForgotPassword] = useState(false);
	const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();

	const [
		user,
		setUser,
		userPlan,
		setUserPlan,
		setAccessToken,
		setRefreshToken,
		setCurrentInstituteId,
		setInstitutes,
		currentRole,
		setCurrentRole,
		setRoles,
	] = useUserStore(
		useShallow((state) => [
			state.user,
			state.setUser,
			state.userPlan,
			state.setUserPlan,
			state.setAccessToken,
			state.setRefreshToken,
			state.setCurrentInstituteId,
			state.setInstitutes,
			state.currentRole,
			state.setCurrentRole,
			state.setRoles,
		])
	);

	const onSuccessCallbackOtp = (number) => {
		setNumber(number);
		setMainVisible(false);
		if (phoneSignIn) {
			signWithPhone();
		} else {
			setForgotPasswordVisible(true);
			setForgotPassword(false);
		}
	};

	useEffect(() => {
		if (number.length >= 10) {
			const fetchData = async () => {
				try {
					const response = await Fetch({
						url: "/user/get-by-phone",
						method: "POST",
						data: { phone: number },
					});
					const data = await response.data;
					if (data["user"] !== undefined && data["user"] !== null) {
						if (phoneSignIn) {
							setUser(data["user"]);
						} else {
							setUserNow(data["user"]);
						}
					}
				} catch (error) {
					console.log(error);
				}
			};
			console.log("Getting user?");
			fetchData();
		}
	}, [number, phoneSignIn, setUser, setUserNow]);

	const updateNewPassword = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);

		const password = formData?.new_password;
		const confirm_password = formData?.new_confirm_password;

		if (password !== confirm_password) {
			toast.error("Passwords do not match");
			return;
		}

		try {
			const response = await Fetch({
				url: "/user/reset-password",
				method: "POST",
				data: {
					user_id: userNow?.user_id,
					new_password: password,
					confirm_new_password: confirm_password,
				},
			});

			if (response && response?.status === 200) {
				toast.success("Password updated successfully");
				setForgotPasswordVisible(false);
				setForgotPassword(false);
				setMainVisible(true);
			} else {
				const errorData = response.data;
				console.log(errorData.data.error);
				toast.error(errorData?.error);
			}
		} catch (err) {
			console.log(err);
			toast(err);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);
		console.log(formData);

		toast("Logging you in, please wait!");
		try {
			const response = await Fetch({
				url: "/auth/login",
				method: "POST",
				data: formData,
			});
			if (response && response?.status === 200) {
				const userData = response.data;
				// console.log(userData, "IS USER DATA!!");
				setUser(userData.user);
				setAccessToken(userData?.accessToken);
				setRefreshToken(userData?.refreshToken);
				setRoles(userData?.user?.roles);
				const currRole = Object.keys(userData?.user?.roles)[0];
				const currPlan = userData?.user?.roles[currRole][0]?.plan;
				setUserPlan(currPlan);
				console.log(userData?.user?.roles[currRole]);
				const ins = userData?.user?.roles[currRole].map(
					(r) => r?.institute
				);
				setInstitutes(ins);
				setCurrentInstituteId(ins[0]?.institute_id);
				sessionStorage.setItem(
					"6amyoga_access_token",
					userData?.accessToken
				);
				sessionStorage.setItem(
					"6amyoga_refresh_token",
					userData?.refreshToken
				);
				setCurrentRole(currRole);
			} else {
				const errorData = response.data;
				// removeCookie("6amyoga_access_token");
				// removeCookie("6amyoga_refresh_token");
				sessionStorage.removeItem("6amyoga_access_token");
				sessionStorage.removeItem("6amyoga_refresh_token");
				toast(errorData?.error, { type: "error" });
			}
		} catch (error) {
			// removeCookie("6amyoga_access_token");
			// removeCookie("6amyoga_refresh_token");
			sessionStorage.removeItem("6amyoga_access_token");
			sessionStorage.removeItem("6amyoga_refresh_token");
			toast("Error logging in, try again", { type: "error" });
		}
	};

	useEffect(() => {
		console.log("in navigate use effect");
		if (user && currentRole) {
			navigateToDashboard(currentRole, userPlan, navigate);
		}
	}, [user, currentRole, navigate, userPlan]);

	const handleForgotPassword = () => {
		setMainVisible(false);
		setPhoneSignIn(false);
		setPhoneSignInVisible(false);
		setForgotPassword(true);
		setForgotPasswordVisible(false);
	};

	const phoneSignInFunction = () => {
		setMainVisible(false);
		setForgotPassword(false);
		setForgotPasswordVisible(false);
		setPhoneSignIn(true);
		setPhoneSignInVisible(true);
	};

	const signWithPhone = async () => {
		setPhoneSignIn(false);
		setUser(user);
		const roleFetcher = await Fetch({
			url: "/user/get-role-by-user-id",
			method: "POST",
			data: {
				user_id: "",
			},
		});
		const data = roleFetcher.data;
		if (data) {
			const maxRole = Math.max(
				...data.user_role.map((role) => role.role_id)
			);
			console.log(maxRole);
			if (maxRole === 5) {
				SetType("student");
			}
			if (maxRole === 4) {
				SetType("teacher");
			}
			if (maxRole === 3) {
				SetType("institute_admin");
			}
			if (maxRole === 2) {
				SetType("root");
			}
		}
	};

	useEffect(() => {
		if (user?.user_id) {
			if (type === "student") {
				navigate("/student/free-videos");
			} else if (type === "root") {
				navigate("/admin");
			} else if (type === "teacher") {
				navigate("/teacher");
			} else if (type === "institute_admin") {
				navigate("/institute");
			}
		}
	}, [user, type]);

	return (
		<main id="login-page" className="h-90 w-80 sm:w-96 lg:w-[440px]">
			<div className="mb-4 flex flex-col items-center gap-2">
				<img
					src="/logo_6am.png"
					alt="6AM Yoga"
					className="mx-auto max-h-24 my-4"
				/>
				<div className="p-2 bg-blue-500 rounded-full text-white">
					<LockOutlined />
				</div>
				<h2 className="text-center">Sign In</h2>
			</div>
			{/* <hr /> */}
			{mainVisible && (
				<div className="mt-4 flex w-full flex-col items-center gap-1">
					<form
						onSubmit={handleSubmit}
						className="flex w-full flex-col gap-4">
						<TextField name="username" label="Username" />
						<TextField
							type="password"
							name="password"
							label="Password"
						/>
						<Button variant="contained" type="submit" size="large">
							Login
						</Button>
					</form>
					<div className="my-6">
						<LoginGoogle />
					</div>

					{/* <hr /> */}
					<div className="flex justify-between w-full">
						<Button
							size="small"
							variant="text"
							onClick={handleForgotPassword}>
							Forgot Password
						</Button>
						<Button
							size="small"
							variant="outlined"
							onClick={() => {
								setSearchParams({ register: true });
							}}>
							Don't have an account? Sign up
						</Button>
					</div>
				</div>
			)}
			{(forgotPassword || phoneSignInVisible) && (
				<div>
					<Otp onSuccessCallback={onSuccessCallbackOtp} />
					<Button
						className="w-full"
						variant="ghost"
						onClick={() => {
							setPhoneSignInVisible(false);
							setForgotPasswordVisible(false);
							setForgotPassword(false);
							setPhoneSignIn(false);
							setMainVisible(true);
						}}>
						Go Back
					</Button>
				</div>
			)}

			{forgotPasswordVisible && userNow && (
				<form
					onSubmit={updateNewPassword}
					className="flex flex-col gap-4">
					<p>
						Setting password for user :{" "}
						<strong>{userNow?.username}</strong>
					</p>
					<p
						className={`text-sm border p-2 rounded-lg text-zinc-500`}>
						Password must be minimum 8 letters and contain atleast 1
						number, 1 alphabet, 1 special character [!@#$%^&*,?]
					</p>
					<TextField
						name="new_password"
						label="New Password"
						type="password"
						required
					/>
					<TextField
						name="new_confirm_password"
						label="Confirm New Password"
						type="password"
						required
					/>
					<Button type="submit" variant="contained">
						Reset Password
					</Button>
				</form>
			)}
		</main>
	);
}
