import { GeistProvider } from "@geist-ui/core";
import {
	QueryClient,
	QueryClientProvider,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useCallback } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ReactDOM from "react-dom/client";
import "react-phone-number-input/style.css";
import {
	Outlet,
	RouterProvider,
	createBrowserRouter,
	useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useShallow } from "zustand/react/shallow";
import { AuthAPI } from "./api/auth.api";
import { UserPlanAPI } from "./api/user-plan.api";
import { UserAPI } from "./api/user.api";
import { ROLE_TEACHER } from "./enums/roles";
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

const root = ReactDOM.createRoot(document.getElementById("root"));

const Root = () => {
	const location = useLocation();
	// <AnimatePresence mode="wait">
	//   <motion.div
	//     key={location.pathname}
	//     initial={{ opacity: 0 }}
	//     animate={{ opacity: 1, transition: { duration: 0.3 } }}
	//     exit={{ opacity: 0, transition: { duration: 0.3 } }}
	//   >

	//   </motion.div>
	// </AnimatePresence>
	return <Outlet />;
};

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		children: [
			...GeneralRoutes,
			...AuthRoutes,
			...AdminRoutes,
			...InstituteRoutes,
			...StudentRoutes,
			...TeacherRoutes,
			...TestingRoutes,
		],
	},
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
		currentInstituteId,
		setCurrentInstituteId,
		setInstitutes,
		currentRole,
		setCurrentRole,
		setRoles,
		resetUserState,
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
			state.currentInstituteId,
			state.setCurrentInstituteId,
			state.setInstitutes,
			state.currentRole,
			state.setCurrentRole,
			state.setRoles,
			state.resetUserState,
		])
	);

	const init = useCallback(async () => {
		console.log("[INIT]");
		try {
			const access_token =
				sessionStorage.getItem("6amyoga_access_token") || accessToken;
			const refresh_token =
				sessionStorage.getItem("6amyoga_refresh_token") || refreshToken;

			if (access_token && refresh_token) {
				console.log("[INIT] Tokens available");
				const [verifyData, verifyErr] = await AuthAPI.postVerifyTokens(
					access_token,
					refresh_token
				);

				// console.log("[INIT] Verify Tokens", verifyData, verifyErr);

				if (verifyData?.message === "Token verified") {
					const [userByTokenData, userErr] =
						await UserAPI.postGetUserByToken(access_token);

					if (userByTokenData) {
						const userData = userByTokenData.user;
						setUser(userData);

						// tokens
						setAccessToken(access_token);
						setRefreshToken(refresh_token);

						// set all roles
						setRoles(userData?.roles);

						// set current role
						let currRole = currentRole;
						// if current role is available, dont change it
						if (
							currRole === null ||
							userData?.roles === null ||
							userData?.roles === undefined ||
							!userData?.roles[currRole]
						) {
							currRole = Object.keys(userData?.roles)[0];
							setCurrentRole(currRole);
						}

						// the plan of the current role

						if (
							currRole !== null &&
							userData?.roles[currRole] &&
							userData?.roles[currRole].length > 0
						) {
							const currPlan = userData?.roles[currRole][0]?.plan;
							setUserPlan(currPlan);
						}

						// set all institutes
						if (
							currRole !== null &&
							userData?.roles &&
							userData?.roles[currRole]
						) {
							const ins = userData?.roles[currRole]?.map(
								(r) => r?.institute
							);
							console.log("[INIT] Institutes", ins);
							setInstitutes(ins);

							let currInsId = currentInstituteId;
							// if current institute is available, dont change it
							if (
								currInsId !== null &&
								ins &&
								ins.findIndex((i) => {
									if (i) {
										return i.institute_id === currInsId;
									} else {
										return false;
									}
								}) !== -1
							) {
							} else {
								currInsId = ins[0]?.institute_id;
								setCurrentInstituteId(currInsId);
							}

							if (currRole === ROLE_TEACHER) {
								// get current institute, set teacher plan as institute plan
								// get current institute id
								if (currInsId) {
									const [
										teacherInstitutePlanData,
										teacherInstitutePlanErr,
									] =
										await UserPlanAPI.postUserPlanTeacherInstitutePlan(
											currInsId
										);

									if (teacherInstitutePlanData) {
										setUserPlan(
											res.data?.institute_plan?.plan
										);
									}

									if (teacherInstitutePlanErr) {
										toast(
											"Error getting teacher institute plan",
											{
												type: "error",
											}
										);
									}
								}
							} else {
							}
						}

						sessionStorage.setItem(
							"6amyoga_access_token",
							access_token
						);
						sessionStorage.setItem(
							"6amyoga_refresh_token",
							refresh_token
						);
					}
				}

				if (verifyErr) {
					const errMsg = verifyErr?.response?.data?.message;
					// console.log({ verifyError: errMsg });
					switch (errMsg) {
						case "Access token expired":
							const [res, err] =
								await AuthAPI.postUserRefreshToken(
									refresh_token
								);
							if (res) {
								// console.log(
								// 	"new access token ==> ",
								// 	res.accessToken
								// );
								setAccessToken(res.accessToken);
								setRefreshToken(refresh_token);
								sessionStorage.setItem(
									"6amyoga_access_token",
									res.accessToken
								);
								sessionStorage.setItem(
									"6amyoga_refresh_token",
									refresh_token
								);
								queryClient.invalidateQueries(["user"]);
							}
							if (err) {
								// console.log(err);
								setAccessToken(null);
								setRefreshToken(null);
								sessionStorage.removeItem(
									"6amyoga_access_token"
								);
								sessionStorage.removeItem(
									"6amyoga_refresh_token"
								);
							}
							break;
						// refresh token expired
						// let them login again
						case "Refresh token expired":
							setAccessToken(null);
							setRefreshToken(null);
							sessionStorage.removeItem("6amyoga_access_token");
							sessionStorage.removeItem("6amyoga_refresh_token");
							resetUserState();
							break;
						// invalid response, let it go
						default:
							setAccessToken(null);
							setRefreshToken(null);
							sessionStorage.removeItem("6amyoga_access_token");
							sessionStorage.removeItem("6amyoga_refresh_token");
							break;
					}
				}
			} else {
				sessionStorage.setItem("6amyoga_access_token", "");
				sessionStorage.setItem("6amyoga_refresh_token", "");
			}
		} catch (err) {
			console.log(err);
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

	// refetch every 5 minutes
	useQuery({
		queryKey: ["user"],
		queryFn: init,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: "always",
		refetchInterval: 1000 * 60 * 5,
		retry: 3,
		retryDelay: 1000 * 4,
	});

	return <></>;
}

function Index() {
	const queryClient = new QueryClient();

	//   const themes = Themes.create({
	//     palette: {
	// 		success: "#ff0000",
	// 		warning: ""
	// 	},
	//   });

	//   const theme = useTheme();

	return (
		<>
			<QueryClientProvider client={queryClient}>
				<GeistProvider>
					{/* <CssBaseline /> */}
					<RouterProvider router={router} />
					<ToastContainer
						autoClose={3000}
						newestOnTop={true}
						pauseOnHover={true}
					/>
					<LoginIndex />
				</GeistProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</>
	);
}

// TODO : do we put back React.StrictMode
root.render(<Index />);

reportWebVitals();
