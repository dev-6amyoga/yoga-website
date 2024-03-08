import { Button, Divider, Drawer, Select, Spacer } from "@geist-ui/core";
import { Menu, Plus } from "@geist-ui/icons";
import { memo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import RoleShifter from "../RoleShifter";

function InstituteNavbar() {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [activePlanID, setActivePlanID] = useState(0);
	const [basicPlaylist, setBasicPlaylist] = useState(false);
	const [playlistCreation, setPlaylistCreation] = useState(false);
	const [selfAudio, setSelfAudio] = useState(false);
	const [moreTeachers, setMoreTeachers] = useState(false);

	const [
		currentInstituteId,
		setCurrentInstituteId,
		user,
		setUser,
		institutes,
		userPlan,
	] = useUserStore((state) => [
		state.currentInstituteId,
		state.setCurrentInstituteId,
		state.user,
		state.setUser,
		state.institutes,
		state.userPlan,
	]);

	console.log({ userPlan });

	const handleInstituteSelection = (value) => {
		console.log("Selected Institute:", value);
		setCurrentInstituteId(parseInt(value));
	};

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
		if (userPlan) {
			setActivePlanID(userPlan?.plan_id);
			if (userPlan?.has_basic_playlist) {
				setBasicPlaylist(true);
			} else {
				setBasicPlaylist(false);
			}
			if (userPlan?.has_playlist_creation) {
				setPlaylistCreation(true);
			} else {
				setPlaylistCreation(false);
			}
			if (userPlan?.has_self_audio_upload) {
				setSelfAudio(true);
			} else {
				setSelfAudio(false);
			}
			if (userPlan?.number_of_teachers > 0) {
				setMoreTeachers(true);
			} else {
				setMoreTeachers(false);
			}
		} else {
			toast(
				"You dont have an active plan! Please head to the Purchase A Plan page"
			);
		}
	}, [userPlan]);

	return (
		<div>
			<div className="flex w-full items-center gap-4 bg-zinc-800 px-4 py-1 text-white">
				<Button
					width={"100%"}
					auto
					ghost
					onClick={() => setOpen(true)}
					icon={<Menu />}
				/>
				<p className="text-xl font-bold">6AM Yoga</p>
			</div>
			<Drawer
				visible={open}
				onClose={() => setOpen(false)}
				placement="left">
				<Drawer.Title>6AM Yoga</Drawer.Title>
				<Drawer.Subtitle>Institute Dashboard</Drawer.Subtitle>
				<Drawer.Content>
					<div className="py-4">
						<RoleShifter />
						<Spacer h={1} />
						{userPlan ? (
							<h5 className="rounded-lg bg-zinc-800 p-2 text-white">
								Plan : {userPlan?.name}
							</h5>
						) : (
							<h5 className="rounded-lg bg-zinc-800 p-2 text-white">
								No active plan
							</h5>
						)}
						<Divider />
						<Spacer h={1} />
						<Button
							iconRight={<Plus />}
							onClick={() => navigate("/institute/create")}
							width="100%">
							Create Institute
						</Button>
						<Spacer h={1 / 2} />
						<Select
							width="100%"
							value={String(currentInstituteId)}
							placeholder="Select An Institute"
							onChange={handleInstituteSelection}
							className="my-2">
							{institutes?.map((institute) => {
								return (
									<Select.Option
										key={institute.institute_id}
										value={String(institute.institute_id)}>
										{institute.name}
									</Select.Option>
								);
							})}
						</Select>
					</div>
					<Divider />
					<div className="flex w-full flex-col gap-4">
						<Button className="w-full">
							<Link
								to={"/institute"}
								className="w-full text-zinc-800">
								Dashboard
							</Link>
						</Button>
						<Button className="w-full">
							<Link
								to={"/institute/purchase-a-plan"}
								className="w-full text-zinc-800">
								Purchase A Plan
							</Link>
						</Button>
						<Button className="w-full">
							<Link
								to={"/institute/member-management"}
								className="w-full text-zinc-800">
								Member Management
							</Link>
						</Button>
						<Button
							onClick={() => {
								navigate("/institute/add-new-teacher");
							}}
							disabled={!moreTeachers}>
							Add New Teacher
						</Button>
						<Button
							onClick={() => {
								navigate("/institute/playlist-page");
							}}
							disabled={!basicPlaylist}>
							Playlist Page
						</Button>
						<Button
							onClick={() => {
								navigate("/institute/make-playlist");
							}}
							disabled={!playlistCreation}>
							Make New Playlist
						</Button>

						<Button
							onClick={() => {
								navigate("/institute/make-playlist");
							}}
							disabled={!selfAudio}>
							Upload your own audio!
						</Button>
						<Button className="w-full">
							<Link
								to={"/institute/add-new-teacher"}
								className="w-full text-zinc-800">
								Reports
							</Link>
						</Button>
						<hr />
						<Button className="w-full">
							<Link
								to={"/institute/settings"}
								className="w-full text-zinc-800">
								Institute Settings
							</Link>
						</Button>
						<Button className="w-full">
							<Link
								to={"/institute/user/settings"}
								className="w-full text-zinc-800">
								User Settings
							</Link>
						</Button>
						<Button className="w-full">
							<Link
								to={"/institute/view-transactions"}
								className="w-full text-zinc-800">
								View Transactions
							</Link>
						</Button>

						<hr />
						{user ? (
							<>
								<h2 className="text-center text-sm">
									Logged in as {user?.name}
								</h2>
								<Button type="error" onClick={handleLogout}>
									Logout
								</Button>
							</>
						) : (
							<Link to={"/auth"} className="w-full">
								<Button type="primary" width="100%">
									Login
								</Button>
							</Link>
						)}
					</div>
				</Drawer.Content>
			</Drawer>
		</div>
	);
}

export default memo(InstituteNavbar);
