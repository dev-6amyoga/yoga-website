import { Button, Input } from "@geist-ui/core";
import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import LoginGoogle from "../../components/auth/LoginGoogle";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import getFormData from "../../utils/getFormData";
import { navigateToDashboard } from "../../utils/navigateToDashboard";
import Otp from "../otp/Otp";
import "./login.css";

export default function Login({ switchForm }) {
	const navigate = useNavigate();
	const notify = (x) => toast(x);
	const [number, setNumber] = useState("");
	const [userNow, setUserNow] = useState({});
	const [forgotPassword, setForgotPassword1] = useState(false);
	const [phoneSignIn, setPhoneSignIn] = useState(false);
	const [phoneSignInVisible, setPhoneSignInVisible] = useState(false);

	// const [user, userType, userPlan] = useUserStore(
	//   useShallow((state) => [state.user, state.userType, state.userPlan])
	// );

	const [visible, setVisible] = useState(true);
	const [forgotp, setForgotp] = useState(false);
	const [cookies, setCookie, removeCookie] = useCookies([
		"6amyoga_access_token",
		"6amyoga_refresh_token",
	]);

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
		setVisible(false);
		if (phoneSignIn) {
			console.log("phone sign in !!!!");
			signWithPhone();
		} else {
			setForgotPassword1(true);
			setForgotp(false);
		}
	};

	useEffect(() => {
		if (number.length > 0) {
			const fetchData = async () => {
				try {
					const response = await fetch(
						"http://192.168.0.103:4000/user/get-by-phone",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ phone: number }),
						}
					);
					const data = await response.json();
					console.log(phoneSignIn);
					if (data["user"]) {
						setUserNow(data["user"]);
						if (phoneSignIn) {
							setUser(data["user"]);
						}
					}
					console.log(data);
				} catch (error) {
					console.log(error);
				}
			};
			fetchData();
		}
	}, [number, phoneSignIn, setUser]);

	const phoneSignInFunction = () => {
		setVisible(false);
		setPhoneSignIn(true);
	};

	const signWithPhone = () => {
		setPhoneSignIn(false);
		setUser(userNow.user);
		// setUserType(userNow.user.role.name);
	};

	const updateNewPassword = async () => {
		const password = document.querySelector("#new_password").value;
		const confirm_password = document.querySelector(
			"#new_confirm_password"
		).value;
		try {
			const response = await Fetch({
				url: "http://localhost:4000/user/reset-password",
				method: "POST",
				data: {
					user_id: userNow?.user_id,
					new_password: password,
					confirm_new_password: confirm_password,
				},
			});
			console.log(response);
			setTimeout(() => {
				window.location.reload();
			}, 2000);
			toast(response.data.message);
		} catch (err) {
			toast(err);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);

		try {
			const response = await Fetch({
				url: "http://localhost:4000/auth/login",
				// url: "http://192.168.1.20:4000/auth/login",
				method: "POST",
				data: formData,
			});

			if (response && response.status === 200) {
				const userData = response.data;
				console.log(userData);
				setUser(userData.user);
				// setUserType(userData.user.role.name);
				setAccessToken(userData?.accessToken);
				setRefreshToken(userData?.refreshToken);

				setRoles(userData?.user?.roles);

				const currRole = Object.keys(userData?.user?.roles)[0];
				// use first role as current role

				const currPlan = userData?.user?.roles[currRole][0]?.plan;
				setUserPlan(currPlan);

				console.log(userData?.user?.roles[currRole]);
				const ins = userData?.user?.roles[currRole].map(
					(r) => r?.institute
				);

				setInstitutes(ins);

				setCurrentInstituteId(ins[0]?.institute_id);

				// console.log({
				//   user: userData?.user,
				//   roles: userData?.user?.roles,
				//   accessToken: userData?.accessToken,
				//   refreshToken: userData?.refreshToken,
				//   currentRole: currRole,
				//   userPlan: currPlan,
				//   institutes: ins,
				//   currentInstituteId: ins[0]?.institute_id,
				// });

				// set token cookies
				setCookie("6amyoga_access_token", userData?.accessToken);
				setCookie("6amyoga_refresh_token", userData?.refreshToken);

				// console.log(userData);

				// change role in the end cuz it triggers navigation
				setCurrentRole(currRole);
			} else {
				const errorData = response.data;
				removeCookie("6amyoga_access_token");
				removeCookie("6amyoga_refresh_token");
				console.log(errorData?.error.response.data);
				// notify(errorData?.error);
			}
		} catch (error) {
			removeCookie("6amyoga_access_token");
			removeCookie("6amyoga_refresh_token");
			console.log(error.response?.data?.error);
			toast(error?.response?.data?.error, { type: "error" });
		}
	};

	const handleForgotPassword = () => {
		setVisible(false);
		setForgotp(true);
	};

	useEffect(() => {
		if (user && currentRole) {
			navigateToDashboard(currentRole, userPlan, navigate);
		}
	}, [user, currentRole, navigate, userPlan]);

	return (
		<div className="bg-white p-4 rounded-lg max-w-xl mx-auto border">
			<h3 className="text-center text-2xl">Login</h3>
			<hr />
			{visible && (
				<div className="flex flex-col gap-1 items-center w-full mt-4">
					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-4 w-full">
						<Input width="100%" name="username">
							Username
						</Input>
						<Input.Password width="100%" name="password">
							Password
						</Input.Password>
						<h6 onClick={handleForgotPassword}>
							Forgot Password?{" "}
							<span className="text-blue-500">Click Here</span>
						</h6>
						<Button type="warning" htmlType="submit">
							Login
						</Button>
					</form>
					<p>{"( or )"}</p>
					<div className="flex flex-row	">
						<LoginGoogle />
						&nbsp; &nbsp;
						<Button width="50%" onClick={phoneSignInFunction}>
							Login with Phone Number
						</Button>
					</div>
					<br />
					<h5
						onClick={() => switchForm((s) => !s)}
						className="hover:pointer">
						Dont have an account?{" "}
						<span className="text-blue-500">Click Here</span>
					</h5>
				</div>
			)}
			{(forgotp || phoneSignInVisible) && (
				<div>
					<Otp onSuccessCallback={func1} />
				</div>
			)}

			{forgotPassword && (
				<div>
					<Input.Password width="100%" id="new_password">
						Password
					</Input.Password>
					<Input.Password width="100%" id="new_confirm_password">
						Confirm Password
					</Input.Password>
					<Button onClick={updateNewPassword}>Reset Password</Button>
				</div>
			)}
		</div>
	);
}
