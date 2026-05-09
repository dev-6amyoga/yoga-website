import {
  DarkMode,
  ExpandMore,
  LightMode,
  Logout,
  PersonOutline,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SIXAMYOGA_ACCESS_TOKEN,
  SIXAMYOGA_REFRESH_TOKEN,
} from "../../../enums/cookies";
import { USER_PLAN_ACTIVE } from "../../../enums/user_plan_status";
import useUserStore from "../../../store/UserStore";
import { Fetch, FetchRetry } from "../../../utils/Fetch";

const getInitialMode = () => {
  const savedMode = window.localStorage.getItem("studentColorMode");
  if (savedMode === "dark" || savedMode === "light") return savedMode;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

function StudentNavMUI() {
  const [open, setOpen] = useState(false);
  const [practiceAnchorEl, setPracticeAnchorEl] = useState(null);
  const [classesAnchorEl, setClassesAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [mode, setMode] = useState(getInitialMode);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((state) => state.user);
  const setUserPlan = useUserStore((state) => state.setUserPlan);
  const resetUserState = useUserStore((state) => state.resetUserState);

  const [disabled, setDisabled] = useState(false);
  const [disabledTailorMade, setDisabledTailorMade] = useState(false);
  const [hasZoomClasses, setHasZoomClasses] = useState(false);
  const [, , removeCookie] = useCookies([
    SIXAMYOGA_ACCESS_TOKEN,
    SIXAMYOGA_REFRESH_TOKEN,
  ]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#2563eb",
          },
        },
        shape: {
          borderRadius: 8,
        },
      }),
    [mode],
  );

  useEffect(() => {
    window.localStorage.setItem("studentColorMode", mode);
    document.documentElement.dataset.colorMode = mode;
    document.documentElement.style.colorScheme = mode;
    window.dispatchEvent(
      new CustomEvent("student-color-mode-change", { detail: mode }),
    );
  }, [mode]);

  const checkForMasterClass = async () => {
    try {
      const response = await Fetch({
        url: "/zoom/api/classes/today",
        method: "GET",
      });
      const classes = response.data || [];
      return classes.some(
        (classObj) => classObj.zoom_class_name === "Master Class",
      );
    } catch (error) {
      return false;
    }
  };

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
        const hasMasterClass = await checkForMasterClass();

        if (userPlans.length === 0) {
          setDisabled(true);
          setDisabledTailorMade(true);
          setHasZoomClasses(!hasMasterClass);
          return;
        }

        const activePlan = userPlans.find(
          (plan) => plan.current_status === USER_PLAN_ACTIVE,
        );

        if (!activePlan) {
          setDisabled(true);
          setDisabledTailorMade(true);
          setHasZoomClasses(!hasMasterClass);
          return;
        }

        const isTrialPlan =
          activePlan.is_trial ||
          activePlan.plan?.name?.toLowerCase().includes("trial");
        const canJoinZoomClasses =
          isTrialPlan ||
          activePlan.plan?.has_zoom_classes ||
          Number(activePlan.plan?.number_of_zoom_classes || 0) > 0 ||
          hasMasterClass;

        setUserPlan(activePlan);
        setDisabled(!activePlan.plan?.has_basic_playlist);
        setDisabledTailorMade(
          activePlan.plan?.name === "Solo Plan 1 Month"
            ? true
            : !activePlan.plan?.has_playlist_creation,
        );
        setHasZoomClasses(!canJoinZoomClasses);
      } catch (error) {
        setDisabled(true);
        setDisabledTailorMade(true);
        setHasZoomClasses(true);
      }
    };

    if (user) fetchPlanData();
  }, [user, setUserPlan]);

  const closeMenus = () => {
    setPracticeAnchorEl(null);
    setClassesAnchorEl(null);
    setProfileAnchorEl(null);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setOpen(false);
    closeMenus();
  };

  const handleLogout = async () => {
    try {
      await FetchRetry({
        url: "/auth/logout",
        method: "POST",
        token: true,
        n: 5,
      });
    } finally {
      removeCookie(SIXAMYOGA_ACCESS_TOKEN);
      removeCookie(SIXAMYOGA_REFRESH_TOKEN);
      resetUserState();
      navigate("/auth");
    }
  };

  const mainLinks = useMemo(
    () => [
      { path: "/student/free-videos", title: "Free Videos", disabled: false },
      {
        path: "/student/purchase-a-plan",
        title: "Subscription",
        disabled: false,
      },
      { path: "/student/contact-us", title: "Contact Us", disabled: false },
    ],
    [],
  );

  const practiceLinks = useMemo(
    () => [
      {
        path: "/student/playlist-view",
        title: "Yoga Player",
        disabled,
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
        path: "/student/watch-history",
        title: "Watch History",
        disabled: false,
      },
    ],
    [disabled, disabledTailorMade],
  );

  const classLinks = useMemo(
    () => [
      {
        path: "/student/join-class",
        title: "Join Class",
        disabled: hasZoomClasses,
      },
      {
        path: "/student/attendance-data",
        title: "Attendance History",
        disabled: hasZoomClasses,
      },
    ],
    [hasZoomClasses],
  );

  const isPathActive = (path) => location.pathname === path;
  const isGroupActive = (links) =>
    links.some((link) => location.pathname === link.path);

  const renderNavButton = (link) => (
    <Tooltip
      key={link.path}
      title={link.disabled ? "Purchase an eligible plan to access this" : ""}
    >
      <span>
        <Button
          disabled={link.disabled}
          onClick={() => handleNavigate(link.path)}
          sx={{
            minHeight: 36,
            px: 1.5,
            color: isPathActive(link.path) ? "primary.main" : "text.primary",
            bgcolor: isPathActive(link.path) ? "action.selected" : "transparent",
            fontWeight: isPathActive(link.path) ? 700 : 500,
            textTransform: "none",
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          {link.title}
        </Button>
      </span>
    </Tooltip>
  );

  const renderMenuItems = (links) =>
    links.map((link) => (
      <Tooltip
        key={link.path}
        title={link.disabled ? "Purchase an eligible plan to access this" : ""}
        placement="right"
      >
        <span>
          <MenuItem
            disabled={link.disabled}
            selected={isPathActive(link.path)}
            onClick={() => handleNavigate(link.path)}
          >
            <ListItemText>{link.title}</ListItemText>
          </MenuItem>
        </span>
      </Tooltip>
    ));

  const renderMobileLink = (link) => (
    <MenuItem
      key={link.path}
      disabled={link.disabled}
      selected={isPathActive(link.path)}
      onClick={() => handleNavigate(link.path)}
      sx={{ borderRadius: 1 }}
    >
      {link.title}
    </MenuItem>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "transparent",
          backgroundImage: "none",
          mt: 2,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={(muiTheme) => ({
              minHeight: "64px !important",
              px: { xs: 2, md: 2.5 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              bgcolor:
                muiTheme.palette.mode === "light"
                  ? "rgba(255,255,255,0.86)"
                  : "rgba(15,23,42,0.86)",
              color: "text.primary",
              backdropFilter: "blur(18px)",
              boxShadow:
                muiTheme.palette.mode === "light"
                  ? "0 12px 30px rgba(15, 23, 42, 0.08)"
                  : "0 12px 30px rgba(0, 0, 0, 0.28)",
              gap: 2,
            })}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.5}
              sx={{ minWidth: 190, cursor: "pointer" }}
              onClick={() => handleNavigate("/student")}
            >
              <Box
                component="img"
                src="/logo_6am.png"
                alt="6AM Yoga"
                sx={{ width: 72, height: "auto", display: "block" }}
              />
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography variant="subtitle1" fontWeight={800} lineHeight={1}>
                  6AM Yoga
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Student Portal
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{
                flex: 1,
                display: { xs: "none", lg: "flex" },
                justifyContent: "center",
              }}
            >
              {mainLinks.map(renderNavButton)}

              <Button
                endIcon={<ExpandMore />}
                onClick={(event) => setPracticeAnchorEl(event.currentTarget)}
                sx={{
                  minHeight: 36,
                  px: 1.5,
                  color: isGroupActive(practiceLinks)
                    ? "primary.main"
                    : "text.primary",
                  bgcolor: isGroupActive(practiceLinks)
                    ? "action.selected"
                    : "transparent",
                  fontWeight: isGroupActive(practiceLinks) ? 700 : 500,
                  textTransform: "none",
                }}
              >
                Practice
              </Button>

              <Button
                endIcon={<ExpandMore />}
                onClick={(event) => setClassesAnchorEl(event.currentTarget)}
                sx={{
                  minHeight: 36,
                  px: 1.5,
                  color: isGroupActive(classLinks)
                    ? "primary.main"
                    : "text.primary",
                  bgcolor: isGroupActive(classLinks)
                    ? "action.selected"
                    : "transparent",
                  fontWeight: isGroupActive(classLinks) ? 700 : 500,
                  textTransform: "none",
                }}
              >
                Classes
              </Button>

              {renderNavButton({
                path: "/student/transactions",
                title: "Transactions",
                disabled: false,
              })}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: "auto" }}>
              <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
                <IconButton
                  color="inherit"
                  onClick={() =>
                    setMode((prev) => (prev === "light" ? "dark" : "light"))
                  }
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {mode === "light" ? <DarkMode /> : <LightMode />}
                </IconButton>
              </Tooltip>

              <IconButton
                onClick={(event) => setProfileAnchorEl(event.currentTarget)}
                sx={{ display: { xs: "none", sm: "inline-flex" }, p: 0.25 }}
              >
                <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38 }}>
                  {user?.name ? user.name[0].toUpperCase() : ""}
                </Avatar>
              </IconButton>

              <IconButton
                color="inherit"
                aria-label="open navigation menu"
                onClick={() => setOpen(true)}
                sx={{
                  display: { xs: "inline-flex", lg: "none" },
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>

        <Menu
          anchorEl={practiceAnchorEl}
          open={Boolean(practiceAnchorEl)}
          onClose={closeMenus}
        >
          {renderMenuItems(practiceLinks)}
        </Menu>

        <Menu
          anchorEl={classesAnchorEl}
          open={Boolean(classesAnchorEl)}
          onClose={closeMenus}
        >
          {renderMenuItems(classLinks)}
        </Menu>

        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={closeMenus}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle2">{user?.name || "Student"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => handleNavigate("/student/my-profile")}>
            <ListItemIcon>
              <PersonOutline fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
          <Box
            sx={{
              width: { xs: 300, sm: 360 },
              minHeight: "100%",
              bgcolor: "background.default",
              p: 2,
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  component="img"
                  src="/logo_6am.png"
                  alt="6AM Yoga"
                  sx={{ width: 68, height: "auto" }}
                />
                <Box>
                  <Typography fontWeight={800}>6AM Yoga</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Student Portal
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  Main
                </Typography>
                {mainLinks.map(renderMobileLink)}
                {renderMobileLink({
                  path: "/student/transactions",
                  title: "Transactions",
                  disabled: false,
                })}
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  Practice
                </Typography>
                {practiceLinks.map(renderMobileLink)}
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                  Classes
                </Typography>
                {classLinks.map(renderMobileLink)}
              </Box>

              <Divider />

              {user ? (
                <Stack spacing={1}>
                  <Box sx={{ px: 1 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <MenuItem
                    onClick={() => handleNavigate("/student/my-profile")}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon>
                      <PersonOutline fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <Button
                    color="error"
                    variant="outlined"
                    startIcon={<Logout />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Stack>
              ) : (
                <Button variant="contained" onClick={() => handleNavigate("/auth")}>
                  Sign In
                </Button>
              )}
            </Stack>
          </Box>
        </Drawer>
      </AppBar>
    </ThemeProvider>
  );
}

export default StudentNavMUI;
