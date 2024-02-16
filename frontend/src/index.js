import { CssBaseline, GeistProvider } from "@geist-ui/core";
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useCallback } from "react";
import ReactDOM from "react-dom/client";
import "react-phone-number-input/style.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useShallow } from "zustand/react/shallow";
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
	// const [cookies, setCookie, removeCookie] = useCookies([
	// 	"6amyoga_access_token",
	// 	"6amyoga_refresh_token",
	// ]);
	const queryClient = useQueryClient();

	const [
		user,
		setUser,
		userPlan,
		setUserPlan,
		accessToken,
		setAccessToken,
		refreshToken,
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
			state.accessToken,
			state.setAccessToken,
			state.refreshToken,
			state.setRefreshToken,
			state.setCurrentInstituteId,
			state.setInstitutes,
			state.currentRole,
			state.setCurrentRole,
			state.setRoles,
		])
	);

	const init = useCallback(() => {
		console.log("CALLING USER INIT FUNC --------->");
		const access_token =
			sessionStorage.getItem("6amyoga_access_token") || accessToken;
		const refresh_token =
			sessionStorage.getItem("6amyoga_refresh_token") || refreshToken;

		if (access_token && refresh_token) {
			Fetch({
				url: "http://localhost:4000/auth/verify-tokens",
				method: "POST",
				data: {
					access_token: access_token,
					refresh_token: refresh_token,
				},
			})
				.then((res) => {
					if (
						res.status === 200 &&
						res?.data?.message === "Token verified"
					) {
						Fetch({
							url: "http://localhost:4000/user/get-by-token",
							method: "POST",
							data: {
								access_token: access_token,
							},
						})
							.then((res) => {
								if (res.status === 200) {
									const userData = res.data;
									setUser(userData.user);
									setAccessToken(access_token);
									setRefreshToken(refresh_token);
									setRoles(userData?.user?.roles);
									const currRole = Object.keys(
										userData?.user?.roles
									)[0];
									setCurrentRole(currRole);
									const currPlan =
										userData?.user?.roles[currRole][0]
											?.plan;
									setUserPlan(currPlan);
									const ins = userData?.user?.roles[
										currRole
									].map((r) => r?.institute);
									setInstitutes(ins);
									setCurrentInstituteId(ins[0]?.institute_id);
									// setCookie(
									// 	"6amyoga_access_token",
									// 	access_token,
									// 	{
									// 		domain: "localhost",
									// 		path: "/",
									// 	}
									// );
									// setCookie(
									// 	"6amyoga_refresh_token",
									// 	refresh_token,
									// 	{
									// 		domain: "localhost",
									// 		path: "/",
									// 	}
									// );
									sessionStorage.setItem(
										"6amyoga_access_token",
										access_token
									);
									sessionStorage.setItem(
										"6amyoga_refresh_token",
										refresh_token
									);
								}
							})
							.catch((err) => {
								console.log(err);
							});
					}
				})
				.catch((err) => {
					const errMsg = err?.response?.data?.message;
					console.log({ verifyError: errMsg });
					switch (errMsg) {
						case "Access token expired":
							Fetch({
								url: "http://localhost:4000/auth/refresh-token",
								method: "POST",
								data: {
									refresh_token: refresh_token,
								},
							})
								.then((res) => {
									if (res.status === 200) {
										console.log(
											"new access token ==> ",
											res.data.accessToken
										);
										setAccessToken(res.data.accessToken);
										setRefreshToken(refresh_token);
										// setCookie(
										// 	"6amyoga_access_token",
										// 	res.data.accessToken,
										// 	{
										// 		domain: "localhost",
										// 		path: "/",
										// 	}
										// );
										// setCookie(
										// 	"6amyoga_refresh_token",
										// 	refresh_token,
										// 	{
										// 		domain: "localhost",
										// 		path: "/",
										// 	}
										// );
										sessionStorage.setItem(
											"6amyoga_access_token",
											res.data.accessToken
										);
										sessionStorage.setItem(
											"6amyoga_refresh_token",
											refresh_token
										);
										queryClient.invalidateQueries(["user"]);
									}
								})
								.catch((err) => {
									console.log(err);
									setAccessToken(null);
									setRefreshToken(null);
									// removeCookie("6amyoga_access_token", {
									// 	domain: "localhost",
									// 	path: "/",
									// });
									// removeCookie("6amyoga_refresh_token", {
									// 	domain: "localhost",
									// 	path: "/",
									// });
									sessionStorage.removeItem(
										"6amyoga_access_token"
									);
									sessionStorage.removeItem(
										"6amyoga_refresh_token"
									);
								});
							break;
						// refresh token expired
						// let them login again
						case "Refresh token expired":
							setAccessToken(null);
							setRefreshToken(null);
							// removeCookie("6amyoga_access_token", {
							// 	domain: "localhost",
							// 	path: "/",
							// });
							// removeCookie("6amyoga_refresh_token", {
							// 	domain: "localhost",
							// 	path: "/",
							// });
							sessionStorage.removeItem("6amyoga_access_token");
							sessionStorage.removeItem("6amyoga_refresh_token");
							break;
						// invalid response, let it go
						default:
							setAccessToken(null);
							setRefreshToken(null);
							// removeCookie("6amyoga_access_token", {
							// 	domain: "localhost",
							// 	path: "/",
							// });
							// removeCookie("6amyoga_refresh_token", {
							// 	domain: "localhost",
							// 	path: "/",
							// });
							sessionStorage.removeItem("6amyoga_access_token");
							sessionStorage.removeItem("6amyoga_refresh_token");
							break;
					}
				});
		} else {
			sessionStorage.setItem("6amyoga_access_token", "");
			sessionStorage.setItem("6amyoga_refresh_token", "");
		}
		return null;
	}, [
		setUser,
		queryClient,
		accessToken,
		refreshToken,
		setAccessToken,
		setRefreshToken,
		setCurrentInstituteId,
		setInstitutes,
		setCurrentRole,
		setRoles,
		setUserPlan,
	]);

	// refetch every 1 minute
	useQuery({
		queryKey: ["user"],
		queryFn: init,
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
		refetchOnReconnect: "always",
		refetchInterval: 1000 * 60 * 2,
	});

	return <></>;
}

function Index() {
	// const theme = Themes.createFromLight({
	// 	type: "customLight",
	// 	palette: {
	// 		success: "linear-gradient(#e66465, #9198e5);",
	// 	},
	// });

	// useEffect(() => {
	// 	document.addEventListener("keydown", (e) => {
	// 		e.preventDefault();
	// 		console.log(e);
	// 	});
	// }, []);
	const queryClient = new QueryClient();
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<GeistProvider>
					<CssBaseline />
					<RouterProvider router={router} />
					<ToastContainer
						autoClose={5000}
						newestOnTop={true}
						pauseOnHover={true}
					/>
					<LoginIndex />
				</GeistProvider>
			</QueryClientProvider>
		</>
	);
}

// TODO : do we put back React.StrictMode
root.render(<Index />);

reportWebVitals();
