import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
// import StudentPlan from "../../../pages/student/StudentPlan";
import { Logout, PersonOutline, Settings } from "@mui/icons-material";
import { Avatar, ListItemIcon, Menu, Typography } from "@mui/material";
import { USER_PLAN_ACTIVE } from "../../../enums/user_plan_status";
import { Fetch } from "../../../utils/Fetch";

const logoStyle = {
	width: "80px",
	height: "auto",
	cursor: "pointer",
	margin: "0 10px",
};

function StudentNavMUI({ mode, toggleColorMode }) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	let user = useUserStore((state) => state.user);
	const setUser = useUserStore((state) => state.setUser);
	let userPlan = useUserStore((state) => state.userPlan);
	let setUserPlan = useUserStore((state) => state.setUserPlan);
	const [planId, setPlanId] = useState(0);
	const [disabled, setDisabled] = useState(false);
	const [disabledTailorMade, setDisabledTailorMade] = useState(false);

	const [anchorEl, setAnchorEl] = useState(null);
	const [openProfileMenu, setOpenProfileMenu] = useState(false);

	const handleOpenProfileMenu = (event) => {
		setAnchorEl(event.currentTarget);
		setOpenProfileMenu(true);
	};
	const handleCloseProfileMenu = () => {
		setAnchorEl(null);
		setOpenProfileMenu(false);
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
				console.log("NAVBAR DATA : ", data);
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
	}, [user, setUserPlan]);

	const paths = useMemo(() => {
		return [
			{
				path: "/student/purchase-a-plan",
				title: "Purchase a plan",
				props: {
					disabled: false,
				},
			},
			{
				path: "/student/free-videos",
				title: "Free Videos",
				props: {
					disabled: false,
				},
			},
			{
				path: "/student/playlist-view",
				title: "6AM Yoga Playlists",
				props: {
					disabled: disabled,
				},
			},
			{
				path: "/student/contact-us",
				title: "Contact Us",
				props: {
					disabled: false,
				},
			},
			{
				path: "/student/transactions",
				title: "Transaction History",
				props: {
					disabled: false,
				},
			},
			{
				path: "/student/watch-history",
				title: "Watch History",
				props: {
					disabled: false,
				},
			},
		];
	}, [disabled]);

	const scrollToSection = () => {};

	return (
		<div>
			<AppBar
				position="fixed"
				sx={{
					boxShadow: 0,
					bgcolor: "transparent",
					backgroundImage: "none",
					mt: 2,
				}}>
				<Container maxWidth="lg">
					<Toolbar
						variant="regular"
						sx={(theme) => ({
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							flexShrink: 0,
							borderRadius: "999px",
							bgcolor:
								theme.palette.mode === "light"
									? "rgba(255, 255, 255, 0.4)"
									: "rgba(0, 0, 0, 0.4)",
							backdropFilter: "blur(24px)",
							maxHeight: 40,
							border: "1px solid",
							borderColor: "divider",
							boxShadow:
								theme.palette.mode === "light"
									? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
									: "0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)",
						})}>
						{/* desktop */}
						<Box
							sx={{
								flexGrow: 1,
								display: "flex",
								alignItems: "center",
								ml: "-18px",
								px: 0,
							}}>
							<img
								src={"/logo_6am.png"}
								style={logoStyle}
								alt="logo of 6AM Yoga"
							/>
							<div className="flex flex-row justify-between w-full">
								<div className="flex">
									{paths.map((path, index) => {
										return (
											<MenuItem
												onClick={() =>
													navigate(path.path)
												}
												sx={{ py: "6px", px: "12px" }}
												disabled={path.props.disabled}>
												<Typography
													variant="body2"
													color="text.primary">
													{path.title}
												</Typography>
											</MenuItem>
										);
									})}
								</div>
								<div>
									<Avatar
										onClick={handleOpenProfileMenu}
										sx={{
											bgcolor: "primary.main",
										}}>
										{user ? user.name[0] : ""}
									</Avatar>

									<Menu
										id="account-menu"
										anchorEl={anchorEl}
										open={openProfileMenu}
										onClose={handleCloseProfileMenu}
										onClick={handleCloseProfileMenu}
										transformOrigin={{
											horizontal: "right",
											vertical: "top",
										}}
										anchorOrigin={{
											horizontal: "right",
											vertical: "bottom",
										}}>
										<MenuItem
											onClick={() => {
												navigate("/student/my-profile");
												handleCloseProfileMenu();
											}}>
											<ListItemIcon>
												<PersonOutline fontSize="small" />
											</ListItemIcon>{" "}
											Profile
										</MenuItem>
										{/*<MenuItem
                      onClick={() => {
                        navigate("/student/settings");
                        handleCloseProfileMenu();
                      }}
                    >
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>{" "}
                      Settings
                    </MenuItem>*/}
										<Divider />

										<MenuItem
											onClick={() => {
												handleCloseProfileMenu();
												handleLogout();
											}}>
											<ListItemIcon>
												<Logout fontSize="small" />
											</ListItemIcon>
											Logout
										</MenuItem>
									</Menu>
								</div>
							</div>
						</Box>

						{/* mobile */}
						<Box sx={{ display: { sm: "", md: "none" } }}>
							<Button
								variant="text"
								color="primary"
								aria-label="menu"
								onClick={() => setOpen(true)}
								sx={{ minWidth: "30px", p: "4px" }}>
								<MenuIcon />
							</Button>
							<Drawer
								anchor="right"
								open={open}
								onClose={() => setOpen(false)}>
								<Box
									sx={{
										minWidth: "60dvw",
										p: 2,
										backgroundColor: "background.paper",
										flexGrow: 1,
									}}>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											alignItems: "end",
											flexGrow: 1,
										}}>
										{paths.map((path) => {
											return (
												<MenuItem
													onClick={() =>
														navigate(path.path)
													}
													disabled={
														path.props.disabled
													}>
													{path.title}
												</MenuItem>
											);
										})}
										<Divider />
										{user ? (
											<>
												<h2 className="text-center text-sm">
													Logged in as {user?.name}
												</h2>
												<Button
													variant="destructive"
													onClick={handleLogout}>
													Logout
												</Button>
											</>
										) : (
											<>
												<MenuItem>
													<Button
														color="primary"
														variant="outlined"
														onClick={() =>
															navigate("/auth")
														}
														sx={{ width: "100%" }}>
														Sign in / Sign Up
													</Button>
												</MenuItem>
											</>
										)}
									</Box>
								</Box>
							</Drawer>
						</Box>
					</Toolbar>
				</Container>
			</AppBar>
		</div>
	);
}

export default StudentNavMUI;
