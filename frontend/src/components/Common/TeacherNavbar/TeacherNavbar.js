import { Button, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
// import { stringify } from "query-string/base";
import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import RoleShifter from "../RoleShifter";

function TeacherNavbar() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();

	let user = useUserStore((state) => state.user);
	const institutes = useUserStore((state) => state.institutes);
	let currentInstituteId = useUserStore((state) => state.currentInstituteId);
	const [currentInstitute, setCurrentInstitute] = useState(null);
	useEffect(() => {
		if (currentInstituteId) {
			setCurrentInstitute(
				institutes?.find(
					(institute) => institute.institute_id === currentInstituteId
				)
			);
		}
	}, [currentInstituteId, institutes]);

	const [planId, setPlanId] = useState(0);
	const [playDisabled, setPlayDisabled] = useState(true);
	const [tailorMadeDisabled, setTailorMadeDisabled] = useState(true);
	const [selfAudioDisabled, setSelfAudioDisabled] = useState(true);

	const [userPlan, resetUserState] = useUserStore((state) => [
		state.userPlan,
		state.resetUserState,
	]);

	const handleLogout = () => {
		Fetch({
			url: "/auth/logout",
			method: "POST",
			token: true,
		})
			.then((res) => {
				sessionStorage.removeItem("6amyoga_access_token");
				sessionStorage.removeItem("6amyoga_refresh_token");
				resetUserState();
				navigate("/auth");
			})
			.catch((err) => {
				console.log("Logout Error:", err);
				sessionStorage.removeItem("6amyoga_access_token");
				sessionStorage.removeItem("6amyoga_refresh_token");
				resetUserState();
				navigate("/auth");
			});
	};

	useEffect(() => {
		if (userPlan) {
			setPlayDisabled(!userPlan?.has_basic_playlist);
			setTailorMadeDisabled(userPlan?.has_playlist_creation);
			setSelfAudioDisabled(userPlan?.has_self_audio_upload);
		}
	}, [userPlan]);

	return (
		<>
			<div className="fixed z-[1000] flex w-full items-center gap-4 bg-zinc-900 px-8 py-4 text-white">
				<button onClick={() => setOpen(true)}>
					<Menu />
				</button>
				<h1 className="text-xl font-bold">6AM Yoga</h1>
			</div>
			<Drawer
				visible={open}
				onClose={() => setOpen(false)}
				placement="left">
				<Drawer.Title>
					<p className="text-xl font-bold">6AM Yoga</p>
				</Drawer.Title>
				<Drawer.Subtitle>Teacher Dashboard</Drawer.Subtitle>
				<hr />
				<Drawer.Content>
					<div className="flex flex-col gap-4">
						<RoleShifter />
						{userPlan && currentInstitute ? (
							<h5 className="rounded-lg bg-zinc-800 p-2 text-white">
								{currentInstitute?.name +
									" | Plan : " +
									userPlan?.name}
							</h5>
						) : (
							<h5 className="rounded-lg bg-zinc-800 p-2 text-white">
								No active plan
							</h5>
						)}
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
						<Button
							onClick={() => navigate("/teacher/class/manage")}>
							Manage Classes
						</Button>
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
