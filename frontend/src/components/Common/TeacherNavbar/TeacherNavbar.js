import { Button, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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

	const resetUserState = useUserStore((state) => state.resetUserState);

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
		const fetchData = async () => {
			console.log("IN TEACHER NAVBAR!!");
			try {
				const response = await Fetch({
					url: "/user-plan/get-active-user-plan-by-id",
					method: "POST",
					data: { user_id: user?.user_id },
				});
				const data = response.data;
				console.log(data, "IS OBTAINED!");
				if (data.userPlan.length === 0) {
					toast("No Active Plans");
				} else {
					console.log(currentInstituteId, "IS ID");
					for (var i = 0; i < data.userPlan.length; i++) {
						if (
							data.userPlan[i].institute_id === currentInstituteId
						) {
							console.log(data.userPlan[i], "HAHAHAH");
							setPlayDisabled(
								!data.userPlan[i]?.plan.has_basic_playlist
							);
							setTailorMadeDisabled(
								!data.userPlan[i]?.plan.has_playlist_creation
							);
							setSelfAudioDisabled(
								!data.userPlan[i]?.plan.has_self_audio_upload
							);
							break;
						}
					}
				}
			} catch (err) {
				toast(err);
			}
		};
		fetchData();
	}, [user, currentInstituteId]);

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
