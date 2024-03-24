import { Menu } from "@geist-ui/icons";
import { memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
// import StudentPlan from "../../../pages/student/StudentPlan";
import { USER_PLAN_ACTIVE } from "../../../enums/user_plan_status";
import { Fetch } from "../../../utils/Fetch";
import { Button } from "../../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

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

	const paths = useMemo(() => {
		return [
			{
				path: "/student/purchase-a-plan",
				title: "Purchase a plan",
			},
			{
				path: "/student/free-videos",
				title: "Free Videos",
			},
			{
				path: "/student/playlist-view",
				title: "6AM Yoga Playlists",
				props: {
					disabled: disabled,
				},
			},
			{
				type: "group",
				path: "/student/playlist-view",
				title: "My Playlists",
				props: {
					disabled: disabledTailorMade,
				},
				subPaths: [
					{
						path: "",
						title: "Register New Playlist",
					},
					{
						path: "/student/view-all-playlists",
						title: "View All Playlists",
					},
				],
			},
			{
				path: "/student/about-us",
				title: "About Us",
			},
			{
				path: "/student/contact-us",
				title: "Contact Us",
			},
			{
				path: "/student/transactions",
				title: "Transaction History",
			},
			{
				path: "/student/watch-history",
				title: "Watch History",
			},
			{
				path: "/student/my-profile",
				title: user ? user?.name : "",
			},
			{
				title: "Logout",
				handler: handleLogout,
			},
		];
	}, [handleLogout, user, disabledTailorMade, disabled]);

	return (
		<>
			<div className="fixed z-[998] flex w-full items-center gap-4 bg-zinc-900 px-8 py-4 text-white pointer-events-auto">
				<button onClick={() => setOpen(true)}>
					<Menu />
				</button>
				<h1 className="text-xl font-bold">6AM Yoga</h1>
			</div>
			<div
				className={`fixed w-screen h-screen bg-black z-[997] ${open ? "bg-opacity-50" : "bg-opacity-0"} transition-opacity delay-300 duration-200 pointer-events-auto`}
				onClick={() => {
					setOpen(false);
				}}></div>
			<div
				className={`z-[1500] fixed w-96 h-full p-4 ${open ? "translate-x-0" : "-translate-x-[600px]"} transition-transform duration-500 pointer-events-auto`}>
				<div className="w-full h-full border-4 border-y-green rounded-2xl bg-white overflow-y-auto p-4 flex flex-col gap-4">
					{paths.map((path, index) => {
						if (path?.type === "group") {
							return (
								<DropdownMenu className="w-full">
									<DropdownMenuTrigger asChild>
										<Button variant="ghost">
											{path.title}
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent side="bottom">
										<DropdownMenuLabel>
											{path.title}
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										{path.subPaths.map((subPath, index) => (
											<DropdownMenuItem
												key={
													"subPath" +
													subPath.path +
													index
												}
												onClick={() =>
													navigate(subPath.path)
												}>
												{subPath.title}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							);
						} else {
							return (
								<Button
									variant="ghost"
									key={"nav_path" + path.title}
									onClick={() => {
										navigate(path.path);
									}}>
									{path.title}
								</Button>
							);
						}
					})}
					<hr />
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
			</div>
		</>
	);
}

export default memo(StudentNavbar);
