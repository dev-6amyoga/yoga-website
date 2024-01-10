import { Button, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";

export default function StudentNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [userPlan, setUserPlan] = useState({});
  const [planId, setPlanId] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [tailorMade, setTailorMade] = useState(false);
  // hi, hello;
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
        <Drawer.Subtitle>Student Dashboard</Drawer.Subtitle>
        <hr />
        <Drawer.Content>
          <div className="flex flex-col gap-4">
            <Button onClick={() => navigate("/student/purchase-a-plan")}>
              Purchase a plan
            </Button>
            <Button onClick={() => navigate("/student/free-videos")}>
              Free Videos
            </Button>
            <Button
              onClick={() => navigate("/student/playlist-view")}
              disabled={disabled}
            >
              6AM Yoga Playlists
            </Button>
            <Button
              onClick={() => navigate("/student/register-new-playlist")}
              disabled={!tailorMade}
            >
              Make your own Playlist
            </Button>

            <Button>About Us</Button>
            <Button>Contact Us</Button>
            <hr />
            <Button
              onClick={() => navigate("/student/my-profile")}
              icon={<User />}
              type="success"
              ghost
            >
              {user.name.split(" ")[0]}
            </Button>
            <Button
              type="error"
              onClick={() => {
                setUser(null);
                navigate("/auth");
              }}
            >
              Logout
            </Button>
          </div>
        </Drawer.Content>
      </Drawer>
    </>
  );
}
