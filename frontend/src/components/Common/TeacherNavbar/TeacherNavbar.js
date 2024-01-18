import { Button, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
import { useCookies } from "react-cookie";
import { navigateToDashboard } from "../../../utils/navigateToDashboard";
import RoleShifter from "../RoleShifter";

export default function TeacherNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const [planId, setPlanId] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [tailorMade, setTailorMade] = useState(false);
  const [selfAudio, setSelfAudio] = useState(false);

  const resetUserState = useUserStore((state) => state.resetUserState);

  const [cookies, setCookie, removeCookie] = useCookies([
    "6amyoga_access_token",
    "6amyoga_refresh_token",
  ]);

  const handleLogout = () => {
    removeCookie("6amyoga_access_token", { domain: "localhost", path: "/" });
    removeCookie("6amyoga_refresh_token", { domain: "localhost", path: "/" });
    resetUserState();
    navigate("/auth");
  };

  useEffect(() => {
    // TODO : update state based on plan
  }, [user]);

  return (
    <>
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
      <Drawer visible={open} onClose={() => setOpen(false)} placement="left">
        <Drawer.Title>
          <p className="font-bold text-xl">6AM Yoga</p>
        </Drawer.Title>
        <Drawer.Subtitle>Teacher Dashboard</Drawer.Subtitle>
        <hr />
        <Drawer.Content>
          <div className="flex flex-col gap-4">
            <RoleShifter />
            <Button onClick={() => navigate("/teacher")}>Dashboard</Button>
            <Button>Free Videos</Button>
            <Button
              disabled={disabled}
              onClick={() => navigate("/teacher/playlist")}
            >
              Playlist Player
            </Button>
            <Button disabled={!tailorMade}>Make your own Playlist</Button>

            <Button
              disabled={!selfAudio}
              onClick={() => navigate("/teacher/self-audio-upload")}
            >
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
