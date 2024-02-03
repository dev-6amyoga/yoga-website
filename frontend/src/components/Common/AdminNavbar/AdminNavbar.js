import { Button, ButtonDropdown, Drawer } from "@geist-ui/core";
import { Menu } from "@geist-ui/icons";
import React, { memo, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import useUserStore from "../../../store/UserStore";
import RoleShifter from "../RoleShifter";
import "./AdminNavbar.css";

function AdminNavbar() {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const [user, currentRole, userPlan, resetUserState] = useUserStore(
		useShallow((state) => [
			state.user,
			state.currentRole,
			state.userPlan,
			state.resetUserState,
		])
	);

	const [cookies, setCookie, removeCookie] = useCookies([
		"6amyoga_access_token",
		"6amyoga_refresh_token",
	]);

	const handleLogout = () => {
		removeCookie("6amyoga_access_token", {
			domain: "localhost",
			path: "/",
		});
		removeCookie("6amyoga_refresh_token", {
			domain: "localhost",
			path: "/",
		});
		resetUserState();
		navigate("/auth");
	};

	return (
		<div>
			<div className="w-full px-4 py-1 flex bg-zinc-800 text-white items-center gap-4">
				<Button
					width={"100%"}
					auto
					ghost
					onClick={() => setOpen(true)}
					icon={<Menu />}
				/>
				<p className="font-bold text-xl">6AM Yoga</p>
			</div>
			<Drawer
				visible={open}
				onClose={() => setOpen(false)}
				placement="left">
				<Drawer.Title>6AM Yoga</Drawer.Title>
				<Drawer.Subtitle>Admin Dashboard</Drawer.Subtitle>
				<Drawer.Content>
					<div className="flex flex-col gap-4 w-full">
						<RoleShifter />
						<Button className="w-full">
							<Link
								to={"/admin"}
								className="w-full text-zinc-800">
								Dashboard
							</Link>
						</Button>
						<ButtonDropdown className="w-full">
							<ButtonDropdown.Item main>
								Member Management
							</ButtonDropdown.Item>
							<ButtonDropdown.Item
								onClick={() => {
									navigate("/admin/members/institutes");
								}}>
								Institutes
							</ButtonDropdown.Item>
							<ButtonDropdown.Item
								onClick={() => {
									navigate("/admin/members/students");
								}}>
								Students
							</ButtonDropdown.Item>
							<ButtonDropdown.Item
								onClick={() => {
									navigate("/admin/members/teachers");
								}}>
								Teachers
							</ButtonDropdown.Item>
						</ButtonDropdown>
						<ButtonDropdown className="w-full">
							<ButtonDropdown.Item main>
								Content Management
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/content/video/create"}
									className="w-full text-zinc-800">
									Register New Asana
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/admin/allAsanas"}
									className="w-full text-zinc-800">
									View All Asanas
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/content/video/transition/create"}
									className="w-full text-zinc-800">
									Register Transition Video
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/content/transition/all"}
									className="w-full text-zinc-800">
									View Transition Videos
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/content/playlist/create"}
									className="w-full text-zinc-800">
									Register New Playlist
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/admin/allPlaylists"}
									className="w-full text-zinc-800">
									View All Playlists
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/content/language/create"}
									className="w-full text-zinc-800">
									Register Language
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/admin/allLanguages"}
									className="w-full text-zinc-800">
									View All Languages
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/content/asana-category/create"}
									className="w-full text-zinc-800">
									Register Asana Category
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/content/asana-category/all"}
									className="w-full text-zinc-800">
									View All Asana Categories
								</Link>
							</ButtonDropdown.Item>
						</ButtonDropdown>
						<Button
							onClick={() => {
								navigate("/admin/log-payment");
							}}>
							Log a payment
						</Button>
						<ButtonDropdown className="w-full">
							<ButtonDropdown.Item main>
								Plan Management
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/plan/registerNewPlan"}
									className="w-full text-zinc-800">
									Register New Plan
								</Link>
							</ButtonDropdown.Item>
							<ButtonDropdown.Item>
								<Link
									to={"/plan/viewAllPlans"}
									className="w-full text-zinc-800">
									View All Plans
								</Link>
							</ButtonDropdown.Item>
						</ButtonDropdown>
						<Button className="w-full">
							<Link
								to={"/admin/discount-management"}
								className="w-full text-zinc-800">
								Discount Management
							</Link>
						</Button>
						<Button className="w-full">Free Videos</Button>
						<Button className="w-full">Reports</Button>
						<hr />
						<hr />
						{user ? (
							<>
								<h2 className="text-sm text-center">
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

export default memo(AdminNavbar);
