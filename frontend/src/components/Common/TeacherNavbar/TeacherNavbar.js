import { Button, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
import { memo, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { FetchRetry } from "../../../utils/Fetch";
import RoleShifter from "../RoleShifter";

function TeacherNavbar() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	let user = useUserStore((state) => state.user);
	const setUser = useUserStore((state) => state.setUser);

	const [planId, setPlanId] = useState(0);
	const [playDisabled, setPlayDisabled] = useState(true);
	const [tailorMadeDisabled, setTailorMadeDisabled] = useState(true);
	const [selfAudioDisabled, setSelfAudioDisabled] = useState(true);

	const resetUserState = useUserStore((state) => state.resetUserState);

	const [cookies, setCookie, removeCookie] = useCookies([
		"6amyoga_access_token",
		"6amyoga_refresh_token",
	]);

	const handleLogout = () => {
		FetchRetry({
			url: "http://localhost:4000/auth/logout",
			method: "POST",
			token: true,
		})
			.then((res) => {
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
				resetUserState();
				navigate("/auth");
			})
			.catch((err) => {
				console.error("Logout Error:", err);
			});
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"http://localhost:4000/user-plan/get-user-plan-by-id",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ user_id: user?.user_id }),
					}
				);
				const data = await response.json();
				setPlayDisabled(!data?.userPlan?.plan.has_basic_playlist);
				setTailorMadeDisabled(
					!data?.userPlan?.plan.has_playlist_creation
				);
				setSelfAudioDisabled(
					!data?.userPlan?.plan.has_self_audio_upload
				);
				const retrievedPlanId = data?.userPlan?.plan_id;
			} catch (err) {
				toast(err);
			}
		};
		fetchData();
	}, [user]);

	return (
		<>
			<div className="w-full flex items-center gap-4 py-4 px-8 text-white bg-zinc-900 fixed z-[1000]">
				<button onClick={() => setOpen(true)}>
					<Menu />
				</button>
				<h1 className="font-bold text-xl">6AM Yoga</h1>
			</div>
			<Drawer
				visible={open}
				onClose={() => setOpen(false)}
				placement="left">
				<Drawer.Title>
					<p className="font-bold text-xl">6AM Yoga</p>
				</Drawer.Title>
				<Drawer.Subtitle>Teacher Dashboard</Drawer.Subtitle>
				<hr />
				<Drawer.Content>
					<div className="flex flex-col gap-4">
						<RoleShifter />
						<Button onClick={() => navigate("/teacher")}>
							Dashboard
						</Button>
						<Button>Free Videos</Button>
						<Button
							disabled={playDisabled}
							onClick={() => navigate("/teacher/playlist")}>
							Playlist Player
						</Button>
						<Button
							disabled={tailorMadeDisabled}
							onClick={() => navigate("/teacher/make-playlist")}>
							Make your own Playlist
						</Button>
						<Button
							disabled={selfAudioDisabled}
							onClick={() =>
								navigate("/teacher/self-audio-upload")
							}>
							Self Audio Upload
						</Button>
						<Button>About Us</Button>
						<Button>Contact Us</Button>
						<hr />
						<Button icon={<User />} type="success" ghost>
							{user?.name.split(" ")[0]}
						</Button>
						<Button type="error" onClick={handleLogout}>
							Logout
						</Button>
					</div>
				</Drawer.Content>
			</Drawer>
		</>
	);
}

export default memo(TeacherNavbar);
