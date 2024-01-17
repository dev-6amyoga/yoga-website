import { Button, Drawer } from "@geist-ui/core";
import { Menu, User } from "@geist-ui/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
// import StudentPlan from "../../../pages/student/StudentPlan";
import { useCookies } from "react-cookie";
import { Divider } from "@geist-ui/core";
import { navigateToDashboard } from "../../../utils/navigateToDashboard";

export default function StudentNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  let currentRole = useUserStore((state) => state.currentRole);
  let userPlan = useUserStore((state) => state.userPlan);
  let setUserPlan = useUserStore((state) => state.setUserPlan);

  const [planId, setPlanId] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [disabledTailorMade, setDisabledTailorMade] = useState(false);

  const resetUserState = useUserStore((state) => state.resetUserState);
  const [cookies, setCookie, removeCookie] = useCookies([
    "6amyoga_access_token",
    "6amyoga_refresh_token",
  ]);

  const handleLogout = () => {
    console.log("logout");
    removeCookie("6amyoga_access_token", { domain: "localhost", path: "/" });
    removeCookie("6amyoga_refresh_token", { domain: "localhost", path: "/" });
    resetUserState();
    navigate("/auth");
  };

  useEffect(() => {
    if (currentRole) {
      navigateToDashboard(currentRole, userPlan, navigate);
    }
  }, [currentRole]);

  useEffect(() => {
    const fetchPlanData = async () => {
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
        // console.log({ data });
        if (data["userPlan"]) {
          setUserPlan(data["userPlan"]);
          setPlanId(data["userPlan"]["plan_id"]);
          if (data?.userPlan?.plan?.has_playlist_creation) {
            setDisabledTailorMade(false);
          } else {
            setDisabledTailorMade(true);
          }
        } else {
          setDisabled(true);
        }
      } catch (error) {
        setDisabledTailorMade(false);
        console.log(error);
      }
    };
    if (user) {
      fetchPlanData();
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
        <Drawer.Subtitle>Student Dashboard</Drawer.Subtitle>
        <hr />
        <Drawer.Content>
          <h5 className="rounded-lg bg-zinc-800 text-white p-2">
            {userPlan ? "Plan : " + userPlan?.plan?.name : ""}
          </h5>
          <Divider />
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
              disabled={disabledTailorMade}
            >
              Make your own Playlist
            </Button>

            <Button>About Us</Button>
            <Button>Contact Us</Button>
            <Button onClick={() => navigate("/student/transactions")}>
              Transaction History
            </Button>
            <hr />
            <Button
              onClick={() => navigate("/student/my-profile")}
              icon={<User />}
              type="success"
              ghost
            >
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
