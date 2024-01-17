import { Button, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
import { useCookies } from "react-cookie";

export default function TeacherNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [userPlan, setUserPlan] = useState({});
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
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-plan/get-user-plan-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user?.user_id }),
          }
        );
        const data = await response.json();
        if (data["userPlan"]) {
          setUserPlan(data["userPlan"]);
          setPlanId(data["userPlan"]["plan_id"]);
          try {
            const response1 = await fetch(
              "http://localhost:4000/plan/get-plan-by-id",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  plan_id: data["userPlan"]["plan_id"],
                }),
              }
            );
            const data1 = await response1.json();
            if (data1["plan"]) {
              setTailorMade(data1["plan"]["has_playlist_creation"]);
              setSelfAudio(data1["plan"]["has_self_audio_upload"]);
            } else {
              setTailorMade(false);
            }
          } catch (error) {
            console.log(error);
          }
        } else {
          setDisabled(true);
        }
      } catch (error) {
        setTailorMade(false);
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
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
