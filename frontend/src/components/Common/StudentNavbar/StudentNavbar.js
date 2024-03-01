import { Button, ButtonDropdown, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
import { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
// import StudentPlan from "../../../pages/student/StudentPlan";
import { Divider } from "@geist-ui/core";
import { USER_PLAN_ACTIVE } from "../../../enums/user_plan_status";
import { Fetch } from "../../../utils/Fetch";
import RoleShifter from "../RoleShifter";

function StudentNavbar() {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	let user = useUserStore((state) => state.user);
	const setUser = useUserStore((state) => state.setUser);
	let userPlan = useUserStore((state) => state.userPlan);
	let setUserPlan = useUserStore((state) => state.setUserPlan);
	const [planId, setPlanId] = useState(0);
	const [disabled, setDisabled] = useState(false);
	const [disabledTailorMade, setDisabledTailorMade] = useState(false);

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
		const fetchPlanData = async () => {
			try {
				const response = await Fetch({
					url: "/user-plan/get-user-plan-by-id",
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					data: { user_id: user?.user_id },
				});
				const data = response.data;
				if (data["userPlan"].length !== 0) {
					const indexOfActiveUserPlan = data["userPlan"].findIndex(
						(plan) => plan.current_status === USER_PLAN_ACTIVE
					);
					setUserPlan(data["userPlan"][indexOfActiveUserPlan]);
					setPlanId(
						data["userPlan"][indexOfActiveUserPlan]["plan_id"]
					);
					if (
						data["userPlan"][indexOfActiveUserPlan]["plan"]
							.has_playlist_creation
					) {
						setDisabledTailorMade(false);
					} else {
						setDisabledTailorMade(true);
					}
					if (
						data["userPlan"][indexOfActiveUserPlan]["plan"]
							.has_basic_playlist
					) {
						setDisabled(false);
					} else {
						setDisabled(true);
					}
				} else {
					setDisabled(true);
					setDisabledTailorMade(true);
				}
			} catch (error) {
				setDisabled(true);
				setDisabledTailorMade(true);
				console.log(error);
			}
		};
		if (user) {
			fetchPlanData();
		}
	}, [user]);

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
				<Drawer.Subtitle>Student Dashboard</Drawer.Subtitle>
				<hr />
				<Drawer.Content>
					<RoleShifter />
					<h5 className="rounded-lg bg-zinc-800 p-2 text-white">
						{userPlan
							? "Plan : " + userPlan?.plan?.name
							: "No active plan"}
					</h5>
					<Divider />
					<div className="flex flex-col gap-4">
						<Button
							onClick={() =>
								navigate("/student/purchase-a-plan")
							}>
							Purchase a plan
						</Button>
						<Button
							onClick={() => navigate("/student/free-videos")}>
							Free Videos
						</Button>
						<Button
							onClick={() => navigate("/student/playlist-view")}
							disabled={disabled}>
							6AM Yoga Playlists
						</Button>
						<ButtonDropdown
							className="w-full"
							disabled={disabledTailorMade}>
							<ButtonDropdown.Item main>
								My Playlists
							</ButtonDropdown.Item>
							<ButtonDropdown.Item
								onClick={() => {
									navigate("/student/register-new-playlist");
								}}>
								Register New Playlist
							</ButtonDropdown.Item>
							<ButtonDropdown.Item
								onClick={() => {
									navigate("/student/view-all-playlists");
								}}>
								View All Playlists
							</ButtonDropdown.Item>
						</ButtonDropdown>
						<Button onClick={() => navigate("/student/about-us")}>
							About Us
						</Button>
						<Button onClick={() => navigate("/student/contact-us")}>
							Contact Us
						</Button>
						<Button
							onClick={() => navigate("/student/transactions")}>
							Transaction History
						</Button>
						<Button
							onClick={() => navigate("/student/watch-history")}>
							Watch History
						</Button>
						<hr />
						<Button
							onClick={() => navigate("/student/my-profile")}
							icon={<User />}
							type="success"
							ghost>
							{user ? user?.name : ""}
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

export default memo(StudentNavbar);
