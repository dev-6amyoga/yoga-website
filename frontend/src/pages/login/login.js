import { Button, Input } from "@geist-ui/core";
import { useEffect, useState } from "react";
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
					const response = await Fetch({
						url: "/user/get-by-phone",
						method: "POST",
						data: { phone: number },
					});
					const data = await response.data;
					if (data["user"]) {
						setUserNow(data["user"]);
						if (phoneSignIn) {
							setUser(data["user"]);
						}
					}
				} catch (error) {
					console.log(error);
				}
			};
			fetchData();
		}
	}, [number, phoneSignIn, user, setUser]);

	const phoneSignInFunction = () => {
		setVisible(false);
		setPhoneSignIn(true);
		setPhoneSignInVisible(true);
	};

	const signWithPhone = () => {
		setPhoneSignIn(false);
		setUser(userNow.user);
	};

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
					user_id: userNow?.user_id,
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);

		try {
			const response = await Fetch({
				url: "/auth/login",
				method: "POST",
				data: formData,
			});

			if (response && response?.status === 200) {
				const userData = response.data;
				console.log(userData);
				setUser(userData.user);
				// setUserType(userData.user.role.name);
				setAccessToken(userData?.accessToken);
				setRefreshToken(userData?.refreshToken);

				setRoles(userData?.user?.roles);

				// use first role as current role
				const currRole = Object.keys(userData?.user?.roles)[0];

				const currPlan = userData?.user?.roles[currRole][0]?.plan;
				setUserPlan(currPlan);

				console.log(userData?.user?.roles[currRole]);
				const ins = userData?.user?.roles[currRole].map(
					(r) => r?.institute
				);

				setInstitutes(ins);

				setCurrentInstituteId(ins[0]?.institute_id);

				// console.log({
				//     user: userData?.user,
				//     roles: userData?.user?.roles,
				//     accessToken: userData?.accessToken,
				//     refreshToken: userData?.refreshToken,
				//     currentRole: currRole,
				//     userPlan: currPlan,
				//     institutes: ins,
				//     currentInstituteId: ins[0]?.institute_id,
				// })

				sessionStorage.setItem(
					"6amyoga_access_token",
					userData?.accessToken
				);
				sessionStorage.setItem(
					"6amyoga_refresh_token",
					userData?.refreshToken
				);

				// console.log(userData);

				// change role in the end cuz it triggers navigation
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
		<div className="mx-auto max-w-xl rounded-lg border bg-white p-4">
			<div className="mb-4">
				<img
					src="/logo_6am.png"
					alt="6AM Yoga"
					className="mx-auto my-4 max-h-24"
				/>
				<h3 className="text-center text-2xl">Login</h3>
			</div>
			<hr />
			{visible && (
				<div className="mt-4 flex w-full flex-col items-center gap-1">
					<form
						onSubmit={handleSubmit}
						className="flex w-full flex-col gap-4">
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
