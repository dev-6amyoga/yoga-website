import { Logout, PersonOutline } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Avatar,
  ListItemIcon,
  Menu,
  Typography,
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  MenuItem,
  Toolbar,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  SIXAMYOGA_ACCESS_TOKEN,
  SIXAMYOGA_REFRESH_TOKEN,
} from "../../../enums/cookies";
import { USER_PLAN_ACTIVE } from "../../../enums/user_plan_status";
import useUserStore from "../../../store/UserStore";
import { Fetch, FetchRetry } from "../../../utils/Fetch";

const logoStyle = {
  width: "80px",
  height: "auto",
  cursor: "pointer",
  margin: "0 10px",
};

function StudentNavMUI() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const setUserPlan = useUserStore((state) => state.setUserPlan);
  const resetUserState = useUserStore((state) => state.resetUserState);

  const [planId, setPlanId] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [disabledTailorMade, setDisabledTailorMade] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);

  const [cookies, , removeCookie] = useCookies([
    SIXAMYOGA_ACCESS_TOKEN,
    SIXAMYOGA_REFRESH_TOKEN,
  ]);

  // Logout handler
  const handleLogout = async () => {
    try {
      const res = await FetchRetry({
        url: "/auth/logout",
        method: "POST",
        token: true,
        n: 5,
      });
      if (res.status === 200) {
        removeCookie(SIXAMYOGA_ACCESS_TOKEN);
        removeCookie(SIXAMYOGA_REFRESH_TOKEN);
        resetUserState();
        navigate("/auth");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Logout Error; Please try again");
    }
  };

  // Profile menu handlers
  const handleOpenProfileMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenProfileMenu(true);
  };
  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
    setOpenProfileMenu(false);
  };

  // Fetch plan data and set feature availability
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          data: { user_id: user?.user_id },
        });
        const userPlans = response.data?.userPlan || [];
        if (userPlans.length === 0) {
          // If no plans, check for custom user plans
          const res = await Fetch({
            url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
            token: true,
            method: "GET",
          });
          if (res.status === 200 && res.data?.plans?.length) {
            const today = new Date();
            const validPlans = res.data.plans.filter(
              (plan) => new Date(plan.validity_to) > today
            );
            setDisabled(validPlans.length === 0);
            setDisabledTailorMade(validPlans.length === 0);
          } else {
            setDisabled(true);
            setDisabledTailorMade(true);
          }
          return;
        }
        // Check for active plans
        const activePlan = userPlans.find(
          (plan) => plan.current_status === USER_PLAN_ACTIVE
        );
        if (!activePlan) {
          setDisabled(true);
          setDisabledTailorMade(true);
          return;
        }
        setUserPlan(activePlan);
        setPlanId(activePlan.plan_id);
        setDisabledTailorMade(
          activePlan.plan.name === "Solo Plan 1 Month"
            ? true
            : !activePlan.plan.has_playlist_creation
        );
        setDisabled(!activePlan.plan.has_basic_playlist);
      } catch (error) {
        setDisabled(true);
        setDisabledTailorMade(true);
      }
    };
    if (user) fetchPlanData();
  }, [user, setUserPlan]);

  // Navigation paths
  const paths = useMemo(
    () => [
      {
        path: "/student/free-videos",
        title: "Free Videos",
        disabled: false,
      },
      {
        path: "/student/purchase-a-plan",
        title: "Subscription",
        disabled: false,
      },
      {
        path: "/student/playlist-view",
        title: "Yoga Player",
        disabled: disabled,
      },
      {
        path: "/student/register-new-playlist",
        title: "Create Playlist",
        disabled: disabledTailorMade,
      },
      {
        path: "/student/view-all-playlists",
        title: "View Your Playlists",
        disabled: disabledTailorMade,
      },
      {
        path: "/student/class/my-classes",
        title: "Your Classes",
        disabled: true,
      },
      {
        path: "/student/contact-us",
        title: "Contact Us",
        disabled: false,
      },
      {
        path: "/student/transactions",
        title: "Transaction History",
        disabled: false,
      },
      {
        path: "/student/watch-history",
        title: "Watch History",
        disabled: false,
      },
    ],
    [disabled, disabledTailorMade]
  );

  const handleNavigate = (path) => navigate(path);

  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: 2,
      }}
    >
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
          })}
        >
          {/* Desktop */}
          <Box
            sx={{
              flexGrow: 1,
              display: { md: "flex", sm: "none", xs: "none" },
              alignItems: "center",
              ml: "-18px",
              px: 0,
            }}
          >
            <img
              src={"/logo_6am.png"}
              style={logoStyle}
              alt="logo of 6AM Yoga"
            />
            <div className="flex flex-row gap-4 justify-between w-full">
              <div className="flex">
                {paths.map((path, index) => (
                  <MenuItem
                    key={path.path}
                    onClick={() => handleNavigate(path.path)}
                    sx={{
                      py: "6px",
                      px: "12px",
                      backgroundColor:
                        location.pathname === path.path
                          ? "rgba(153, 189, 247, 0.3)"
                          : "",
                      borderRadius: "1rem",
                    }}
                    disabled={path.disabled}
                  >
                    <Typography variant="body2" color="text.primary">
                      {path.title}
                    </Typography>
                  </MenuItem>
                ))}
              </div>
              <div>
                <Button>
                  <Avatar
                    onClick={handleOpenProfileMenu}
                    sx={{ bgcolor: "primary.main" }}
                  >
                    {user ? user.name[0] : ""}
                  </Avatar>
                </Button>
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
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/student/my-profile");
                      handleCloseProfileMenu();
                    }}
                  >
                    <ListItemIcon>
                      <PersonOutline fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleCloseProfileMenu();
                      handleLogout();
                    }}
                  >
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </div>
            </div>
          </Box>
          {/* Mobile */}
          <Box sx={{ display: { sm: "", md: "none" }, width: "100%" }}>
            <div className="w-full flex justify-between">
              <img
                src={"/logo_6am.png"}
                style={logoStyle}
                alt="logo of 6AM Yoga"
              />
              <Button
                variant="text"
                color="primary"
                aria-label="menu"
                onClick={() => setOpen(true)}
                sx={{ minWidth: "30px", p: "4px" }}
              >
                <MenuIcon />
              </Button>
            </div>
            <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
              <Box
                sx={{
                  minWidth: "60dvw",
                  p: 2,
                  backgroundColor: "background.paper",
                  flexGrow: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "end",
                    gap: "1rem",
                    flexGrow: 1,
                  }}
                >
                  {paths.map((path) => (
                    <MenuItem
                      key={path.path}
                      onClick={() => handleNavigate(path.path)}
                      sx={{
                        backgroundColor:
                          location.pathname === path.path
                            ? "rgba(153, 189, 247, 0.3)"
                            : "",
                        borderRadius: "1rem",
                        transition: `background-color 0.3s ease-in-out`,
                      }}
                      disabled={path.disabled}
                    >
                      {path.title}
                    </MenuItem>
                  ))}
                  <Divider />
                  {user ? (
                    <Button variant="destructive" onClick={handleLogout}>
                      Logout
                    </Button>
                  ) : (
                    <MenuItem>
                      <Button
                        color="primary"
                        variant="outlined"
                        onClick={() => navigate("/auth")}
                        sx={{ width: "100%" }}
                      >
                        Sign in / Sign Up
                      </Button>
                    </MenuItem>
                  )}
                </Box>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default StudentNavMUI;
