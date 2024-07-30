import { useQuery, useQueryClient } from "@tanstack/react-query";
import { add } from "date-fns";
import { useCallback } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCookies } from "react-cookie";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useShallow } from "zustand/react/shallow";
import { AuthAPI } from "./api/auth.api";
import { UserPlanAPI } from "./api/user-plan.api";
import { UserAPI } from "./api/user.api";
import {
	SIXAMYOGA_ACCESS_TOKEN,
	SIXAMYOGA_REFRESH_TOKEN,
	accessTimeExpiry,
} from "./enums/cookies";
import { ROLE_TEACHER } from "./enums/roles";
import "./index.css";
import useUserStore from "./store/UserStore";

export default function LoginIndex() {
	const [cookies, setCookie, removeCookie] = useCookies([
		SIXAMYOGA_ACCESS_TOKEN,
		SIXAMYOGA_REFRESH_TOKEN,
	]);
	const queryClient = useQueryClient();

	const [
		user,
		setUser,
		userPlan,
		setUserPlan,
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
			const access_token = cookies[SIXAMYOGA_ACCESS_TOKEN];
			const refresh_token = cookies[SIXAMYOGA_REFRESH_TOKEN];

			console.log(
				"[INIT] Tokens",
				access_token,
				refresh_token,
				cookies[SIXAMYOGA_ACCESS_TOKEN],
				cookies[SIXAMYOGA_REFRESH_TOKEN]
			);

			if (refresh_token) {
				console.log("[INIT] Token available");

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
						// setAccessToken(access_token);
						// setRefreshToken(refresh_token);

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

						// setCookie(SIXAMYOGA_ACCESS_TOKEN, access_token, {
						// 	expires: add(new Date(), {
						// 		hours: 1,
						// 		minutes: 59,
						// 	}),
						// });
						// setCookie(SIXAMYOGA_REFRESH_TOKEN, refresh_token, {
						// 	expires: add(new Date(), {
						// 		hours: 11,
						// 		minutes: 45,
						// 	}),
						// });
					}
				} else if (verifyErr) {
					const errMsg = verifyErr?.response?.data?.message;
					console.log("[INIT] Error : ", { verifyError: errMsg });

					switch (errMsg) {
						case "Access token expired":
							console.log("[INIT] Error : ", errMsg);
							const [res, err] =
								await AuthAPI.postUserRefreshToken(
									refresh_token
								);
							if (res) {
								// console.log(
								// 	"new access token ==> ",
								// 	res.accessToken
								// );
								// setAccessToken(res.accessToken);
								// setRefreshToken(refresh_token);

								setCookie(
									SIXAMYOGA_ACCESS_TOKEN,
									res.accessToken,
									{
										expires: add(
											new Date(),
											accessTimeExpiry
										),
									}
								);
								// sessionStorage.setItem(
								// 	"6amyoga_refresh_token",
								// 	refresh_token
								// );
								// await queryClient.invalidateQueries({
								// 	queryKey: ["user"],
								// });
								return null;
							}
							if (err) {
								// console.log(err);
								// setAccessToken(null);
								// setRefreshToken(null);
								removeCookie(SIXAMYOGA_ACCESS_TOKEN);
								removeCookie(SIXAMYOGA_REFRESH_TOKEN);
							}
							break;
						// refresh token expired
						// let them login again
						case "Refresh token expired":
							console.log(
								"[INIT] Error; removing cookie",
								errMsg
							);
							// setAccessToken(null);
							// setRefreshToken(null);
							removeCookie(SIXAMYOGA_ACCESS_TOKEN);
							removeCookie(SIXAMYOGA_REFRESH_TOKEN);
							resetUserState();
							break;
						// invalid response, let it go
						default:
							console.log(
								"[INIT]",
								access_token === null ||
									access_token === undefined,
								refresh_token !== null ||
									refresh_token !== undefined
							);
							if (
								(access_token === null ||
									access_token === undefined) &&
								refresh_token !== null &&
								refresh_token !== undefined
							) {
								console.log(
									"[INIT] Trying to get new access token using refresh token"
								);
								const [res, err] =
									await AuthAPI.postUserRefreshToken(
										refresh_token
									);
								console.log("[INIT] refreshed token");
								if (res) {
									// console.log(
									// 	"new access token ==> ",
									// 	res.accessToken
									// );
									console.log("[INIT] refreshed token");
									// setAccessToken(res.accessToken);
									// setRefreshToken(refresh_token);

									setCookie(
										SIXAMYOGA_ACCESS_TOKEN,
										res.accessToken,
										{
											expires: add(
												new Date(),
												accessTimeExpiry
											),
										}
									);
									console.log("[INIT] set cookie");
									// sessionStorage.setItem(
									// 	"6amyoga_refresh_token",
									// 	refresh_token
									// );
									console.log("[INIT] invalidating query");
									await queryClient.invalidateQueries({
										queryKey: ["user"],
									});
									console.log("[INIT] invalidated query");
									console.log("[INIT] returning");
									return null;
								}
								if (err) {
									console.log(
										"[INIT] error refreshing token; removing token",
										err
									);
									// console.log(err);
									// setAccessToken(null);
									// setRefreshToken(null);
									removeCookie(SIXAMYOGA_ACCESS_TOKEN);
									removeCookie(SIXAMYOGA_REFRESH_TOKEN);
									return null;
								}
							} else {
								console.log(
									"[INIT] Error; removing cookie",
									errMsg
								);
								// setAccessToken(null);
								// setRefreshToken(null);
								removeCookie(SIXAMYOGA_ACCESS_TOKEN);
								removeCookie(SIXAMYOGA_REFRESH_TOKEN);
								return null;
							}
							break;
					}
				}

				console.log("[INIT] finished");
				return null;
			} else {
				console.log("[INIT] removed cookies");
				removeCookie(SIXAMYOGA_ACCESS_TOKEN);
				removeCookie(SIXAMYOGA_REFRESH_TOKEN);
				console.log("[INIT] finished");
				return null;
			}
		} catch (err) {
			console.log("[INIT]", err);
			console.log("[INIT] finished");
			throw err;
		}
	}, [
		setUser,
		// setAccessToken,
		// setRefreshToken,
		setCurrentInstituteId,
		setInstitutes,
		setCurrentRole,
		setRoles,
		setUserPlan,
		cookies,
	]);

	// refetch every 5 minutes
	useQuery({
		queryKey: ["user"],
		queryFn: init,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: "always",
		refetchInterval: 1000 * 60 * 1,
		retry: 3,
		retryDelay: 1000 * 4,
	});

	return <></>;
}
