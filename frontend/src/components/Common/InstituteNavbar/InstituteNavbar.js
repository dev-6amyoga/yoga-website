import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Button,
  Divider,
  Box,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import { memo, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  SIXAMYOGA_ACCESS_TOKEN,
  SIXAMYOGA_REFRESH_TOKEN,
} from "../../../enums/cookies";
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

  const handleInstituteSelection = (event) => {
    setCurrentInstituteId(parseInt(event.target.value));
  };

  const [cookies, setCookie, removeCookie] = useCookies([
    SIXAMYOGA_ACCESS_TOKEN,
    SIXAMYOGA_REFRESH_TOKEN,
  ]);

  const resetUserState = useUserStore((state) => state.resetUserState);

  const handleLogout = () => {
    Fetch({
      url: "/auth/logout",
      method: "POST",
      token: true,
    })
      .then(() => {
        removeCookie(SIXAMYOGA_ACCESS_TOKEN);
        removeCookie(SIXAMYOGA_REFRESH_TOKEN);
        resetUserState();
        navigate("/auth");
      })
      .catch(() => {
        removeCookie(SIXAMYOGA_ACCESS_TOKEN);
        removeCookie(SIXAMYOGA_REFRESH_TOKEN);
        resetUserState();
        navigate("/auth");
      });
  };

  useEffect(() => {
    if (userPlan) {
      setActivePlanID(userPlan?.plan_id);
      setBasicPlaylist(userPlan?.has_basic_playlist);
      setPlaylistCreation(userPlan?.has_playlist_creation);
      setSelfAudio(userPlan?.has_self_audio_upload);
      setMoreTeachers(userPlan?.number_of_teachers > 0);
    } else {
      toast(
        "You dont have an active plan! Please head to the Purchase A Plan page",
      );
    }
  }, [userPlan]);

  return (
    <>
      {/* TOP BAR */}
      <AppBar position="static" sx={{ bgcolor: "#27272a" }}>
        <Toolbar sx={{ display: "flex", gap: 2 }}>
          <IconButton color="inherit" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight="bold">
            6AM Yoga
          </Typography>
        </Toolbar>
      </AppBar>

      {/* DRAWER */}
      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box width={280} p={2}>
          <Typography variant="h6" fontWeight="bold">
            6AM Yoga
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Institute Dashboard
          </Typography>

          <Divider sx={{ my: 2 }} />

          <RoleShifter />

          <Box
            sx={{
              bgcolor: "#27272a",
              color: "white",
              p: 1,
              borderRadius: 1,
              mt: 2,
              textAlign: "center",
            }}
          >
            {userPlan ? `Plan : ${userPlan?.name}` : "No active plan"}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Button
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => navigate("/institute/create")}
          >
            Create Institute
          </Button>

          <Select
            fullWidth
            value={String(currentInstituteId)}
            onChange={handleInstituteSelection}
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem disabled value="">
              Select An Institute
            </MenuItem>
            {institutes?.map((institute) => (
              <MenuItem
                key={institute.institute_id}
                value={String(institute.institute_id)}
              >
                {institute.name}
              </MenuItem>
            ))}
          </Select>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1}>
            <Button component={Link} to="/institute">
              Dashboard
            </Button>

            <Button component={Link} to="/institute/purchase-a-plan">
              Purchase A Plan
            </Button>

            <Button component={Link} to="/institute/member-management">
              Member Management
            </Button>

            <Button
              onClick={() => navigate("/institute/add-new-teacher")}
              disabled={!moreTeachers}
            >
              Add New Teacher
            </Button>

            <Button
              onClick={() => navigate("/institute/playlist-page")}
              disabled={!basicPlaylist}
            >
              Playlist Page
            </Button>

            <Button
              onClick={() => navigate("/institute/make-playlist")}
              disabled={!playlistCreation}
            >
              Make New Playlist
            </Button>

            <Button
              onClick={() => navigate("/institute/make-playlist")}
              disabled={!selfAudio}
            >
              Upload your own audio!
            </Button>

            <Divider />

            <Button component={Link} to="/institute/settings">
              Institute Settings
            </Button>

            <Button component={Link} to="/institute/user/settings">
              User Settings
            </Button>

            <Button component={Link} to="/institute/view-transactions">
              View Transactions
            </Button>

            <Divider />

            {user ? (
              <>
                <Typography textAlign="center" variant="body2">
                  Logged in as {user?.name}
                </Typography>
                <Button
                  color="error"
                  variant="contained"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="contained" component={Link} to="/auth" fullWidth>
                Login
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}

export default memo(InstituteNavbar);
