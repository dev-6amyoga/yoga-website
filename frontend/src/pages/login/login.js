import { Input } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import LoginGoogle from "../../components/auth/LoginGoogle";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Form, FormFieldWrapper } from "../../components/ui/form";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { navigateToDashboard } from "../../utils/navigateToDashboard";
import Otp from "../otp/Otp";
import "./login.css";

export default function Login({ switchForm }) {
	const navigate = useNavigate();
	const notify = (x) => toast(x);
	const [type, SetType] = useState("");
	const [number, setNumber] = useState("");
	const [userNow, setUserNow] = useState({});
	const [phoneSignIn, setPhoneSignIn] = useState(false);
	const [phoneSignInVisible, setPhoneSignInVisible] = useState(false);
	const [mainVisible, setMainVisible] = useState(true);
	const [forgotPassword, setForgotPassword] = useState(false);
	const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
	const authForm = useForm();

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

	const func1 = (number) => {
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
		if (number.length > 0) {
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
			fetchData();
		}
	}, [number, phoneSignIn, user, setUser]);

	const updateNewPassword = async () => {
		const password = document.querySelector("#new_password").value;
		const confirm_password = document.querySelector(
			"#new_confirm_password"
		).value;
		try {
			const response = await Fetch({
				url: "/user/reset-password",
				method: "POST",
				data: {
					user_id: "",
					new_password: password,
					confirm_new_password: confirm_password,
				},
			});
			setTimeout(() => {
				window.location.reload();
			}, 2000);
			toast(response.data.message);
		} catch (err) {
			toast(err);
		}
	};

	const handleSubmit = async (formData) => {
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
		<Card variant="primary" className="w-80 sm:w-96 lg:w-[440px]">
			<CardContent>
				<div className="mb-4">
					<img
						src="/logo_6am.png"
						alt="6AM Yoga"
						className="mx-auto my-4 max-h-24"
					/>
					<h3 className="text-center">Login</h3>
				</div>
				<hr />
				{mainVisible && (
					<div className="mt-4 flex w-full flex-col items-center gap-1">
						<Form {...authForm}>
							<form
								onSubmit={authForm.handleSubmit(handleSubmit)}
								className="flex w-full flex-col gap-4">
								<FormFieldWrapper name="username">
									Username
								</FormFieldWrapper>
								<FormFieldWrapper
									type="password"
									name="password">
									Password
								</FormFieldWrapper>
								<Button
									size="xs"
									variant="outline"
									className="max-w-fit"
									onClick={handleForgotPassword}>
									Forgot Password
								</Button>
								<Button>Login</Button>
							</form>
						</Form>
						<p>{"( or )"}</p>
						<div className="flex flex-col gap-2 items-center w-full">
							<div>
								<LoginGoogle />
							</div>
							<Button
								onClick={phoneSignInFunction}
								className="w-full">
								Login with Phone Number
							</Button>
						</div>

						<hr />

						<Button
							variant="ghost"
							className="w-full"
							onClick={() => switchForm((s) => !s)}>
							Register Account
						</Button>
					</div>
				)}
				{(forgotPassword || phoneSignInVisible) && (
					<div>
						<Otp onSuccessCallback={func1} />
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

				{forgotPasswordVisible && (
					<div>
						<Input.Password width="100%" id="new_password">
							Password
						</Input.Password>
						<Input.Password width="100%" id="new_confirm_password">
							Confirm Password
						</Input.Password>
						<Button onClick={updateNewPassword}>
							Reset Password
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
