import { CssBaseline, GeistProvider } from "@geist-ui/core";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import ReactDOM from "react-dom/client";
import "react-phone-number-input/style.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { AdminRoutes } from "./routes/AdminRoutes";
import { AuthRoutes } from "./routes/AuthRoutes";
import { GeneralRoutes } from "./routes/GeneralRoutes";
import { InstituteRoutes } from "./routes/InstituteRoutes";
import { StudentRoutes } from "./routes/StudentRoutes";
import { TeacherRoutes } from "./routes/TeacherRoutes";
import { TestingRoutes } from "./routes/TestingRoutes";
import useUserStore from "./store/UserStore";
import { Fetch } from "./utils/Fetch";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
	...GeneralRoutes,
	...AuthRoutes,
	...AdminRoutes,
	...InstituteRoutes,
	...StudentRoutes,
	...TeacherRoutes,
	...TestingRoutes,
]);

function LoginIndex() {
	const [cookies, setCookie, removeCookie] = useCookies([
		"6amyoga_access_token",
		"6amyoga_refresh_token",
	]);

	const setUser = useUserStore((state) => state.setUser);
	const user = useUserStore((state) => state.user);
	const setAccessToken = useUserStore((state) => state.setAccessToken);
	const setRefreshToken = useUserStore((state) => state.setRefreshToken);

	useEffect(() => {
		// check for user tokens and log them in
		if (!user) {
			// console.log(cookies["6amyoga_access_token"]);
			// console.log(cookies["6amyoga_refresh_token"]);

			const access_token = cookies["6amyoga_access_token"];
			const refresh_token = cookies["6amyoga_refresh_token"];

			if (access_token && refresh_token) {
				// validate tokens

				Fetch({
					url: "http://localhost:4000/auth/verify-tokens",
					method: "POST",
					data: {
						access_token: access_token,
						refresh_token: refresh_token,
					},
				})
					.then((res) => {
						console.log({
							verifyTokenResponse: res?.data?.message,
						});
						if (
							res.status === 200 &&
							res?.data?.message === "Token verified"
						) {
							// get user from token
							Fetch({
								url: "http://localhost:4000/user/get-by-token",
								method: "POST",
								data: {
									access_token: access_token,
								},
							})
								.then((res) => {
									if (res.status === 200) {
										setUser(res.data.user);
										setAccessToken(access_token);
										setRefreshToken(refresh_token);
									}
								})
								.catch((err) => {
									console.log(err);
								});
						}
					})
					.catch((err) => {
						const errMsg = err?.response?.data?.message;
						console.log({ verifyTokenResponse: errMsg });

						switch (errMsg) {
							// access token expired
							case "Access token expired":
								// use refresh token to get new access token
								Fetch({
									url: "http://localhost:4000/auth/refresh-token",
									method: "POST",
									data: {
										refresh_token: refresh_token,
									},
								})
									.then((res) => {
										if (res.status === 200) {
											setAccessToken(
												res.data.accessToken
											);
											setRefreshToken(refresh_token);
											// set token cookies
											setCookie(
												"6amyoga_access_token",
												res.data.accessToken
											);
											setCookie(
												"6amyoga_refresh_token",
												refresh_token
											);
										}
									})
									.catch((err) => {
										console.log(err);
										// reset cookies
										setAccessToken(null);
										setRefreshToken(null);
										removeCookie("6amyoga_access_token");
										removeCookie("6amyoga_refresh_token");
									});
								break;
							// refresh token expired
							// let them login again
							case "Refresh token expired":
								setAccessToken(null);
								setRefreshToken(null);
								removeCookie("6amyoga_access_token");
								removeCookie("6amyoga_refresh_token");
								break;
							// invalid response, let it go
							default:
								setAccessToken(null);
								setRefreshToken(null);
								removeCookie("6amyoga_access_token");
								removeCookie("6amyoga_refresh_token");
								break;
						}
					});
			}
		}
	}, [
		cookies,
		user,
		setUser,
		setAccessToken,
		setRefreshToken,
		setCookie,
		removeCookie,
	]);

	return <></>;
}

function Index() {
	return (
		<>
			<GeistProvider>
				<CssBaseline />
				<RouterProvider router={router} />
				<ToastContainer />
				<LoginIndex />
			</GeistProvider>
		</>
	);
}

// TODO : do we put back React.StrictMode
root.render(<Index />);

reportWebVitals();
