import { Button, Drawer, Select } from "@geist-ui/core";
import { Menu } from "@geist-ui/icons";
import { memo, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
import { FetchRetry } from "../../../utils/Fetch";
import RoleShifter from "../RoleShifter";
import { Fetch } from "../../../utils/Fetch";
import { toast } from "react-toastify";
function InstituteNavbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  let institutes = useUserStore((state) => state.institutes);
  const [activePlanID, setActivePlanID] = useState(0);
  const [basicPlaylist, setBasicPlaylist] = useState(false);
  const [playlistCreation, setPlaylistCreation] = useState(false);
  const [selfAudio, setSelfAudio] = useState(false);
  const [moreTeachers, setMoreTeachers] = useState(false);
  let currentInstituteId = useUserStore((state) => state.currentInstituteId);
  let setCurrentInstituteId = useUserStore(
    (state) => state.setCurrentInstituteId
  );

  const handleInstituteSelection = (value) => {
    setCurrentInstituteId(parseInt(value));
  };

  const resetUserState = useUserStore((state) => state.resetUserState);
  const [cookies, setCookie, removeCookie] = useCookies([
    "6amyoga_access_token",
    "6amyoga_refresh_token",
  ]);

  const handleLogout = () => {
    FetchRetry({
      url: "http://localhost:4000/auth/logout",
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
        console.error("Logout Error:", err);
      });
  };

  useEffect(() => {
    Fetch({
      url: "http://localhost:4000/user-plan/get-user-institute-plan-by-id",
      method: "POST",
      data: {
        user_id: user.user_id,
        institute_id: currentInstituteId,
      },
    }).then((res) => {
      for (var i = 0; i !== res.data.userplans.length; i++) {
        if (res.data.userplans[i].current_status === "ACTIVE") {
          setActivePlanID(res.data.userplans[i]?.plan_id);
          if (res.data.userplans[i].plan.has_basic_playlist) {
            setBasicPlaylist(true);
          } else {
            setBasicPlaylist(false);
          }
          if (res.data.userplans[i].plan.has_playlist_creation) {
            setPlaylistCreation(true);
          } else {
            setPlaylistCreation(false);
          }
          if (res.data.userplans[i].plan.has_self_audio_upload) {
            setSelfAudio(true);
          } else {
            setSelfAudio(false);
          }
          if (res.data.userplans[i].plan.number_of_teachers > 0) {
            setMoreTeachers(true);
          } else {
            setMoreTeachers(false);
          }
          break;
        } else {
          toast(
            "You dont have an active plan! Please head to the Purchase A Plan page"
          );
        }
      }
    });
  }, [user]);

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
      <Drawer visible={open} onClose={() => setOpen(false)} placement="left">
        <Drawer.Title>6AM Yoga</Drawer.Title>
        <Drawer.Subtitle>Institute Dashboard</Drawer.Subtitle>
        <Drawer.Content>
          <div className="py-4">
            <RoleShifter />
            <Select
              width="100%"
              value={String(currentInstituteId)}
              placeholder="Select An Institute"
              onChange={handleInstituteSelection}
            >
              {institutes?.map((institute) => {
                return (
                  <Select.Option
                    key={institute.institute_id}
                    value={String(institute.institute_id)}
                  >
                    {institute.name}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <Button className="w-full">
              <Link to={"/institute"} className="w-full text-zinc-800">
                Dashboard
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/institute/purchase-a-plan"}
                className="w-full text-zinc-800"
              >
                Purchase A Plan
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/institute/member-management"}
                className="w-full text-zinc-800"
              >
                Member Management
              </Link>
            </Button>
            <Button
              onClick={() => {
                navigate("/institute/add-new-teacher");
              }}
              disabled={!moreTeachers}
            >
              Add New Teacher
            </Button>
            <Button
              onClick={() => {
                navigate("/institute/playlist-page");
              }}
              disabled={!basicPlaylist}
            >
              Playlist Page
            </Button>
            <Button
              onClick={() => {
                navigate("/institute/make-playlist");
              }}
              disabled={!playlistCreation}
            >
              Make New Playlist
            </Button>
            <Button
              className="w-full"
              onClick={() => {
                navigate("/institute/view-transactions");
              }}
              disabled={!selfAudio}
            >
              Upload your own audio
            </Button>
            <Button className="w-full">
              <Link
                to={"/institute/add-new-teacher"}
                className="w-full text-zinc-800"
              >
                Reports
              </Link>
            </Button>
            <hr />
            <Button className="w-full">
              <Link to={"/institute/settings"} className="w-full text-zinc-800">
                Institute Settings
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/institute/user/settings"}
                className="w-full text-zinc-800"
              >
                User Settings
              </Link>
            </Button>
            <Button className="w-full">
              <Link
                to={"/institute/view-transactions"}
                className="w-full text-zinc-800"
              >
                View Transactions
              </Link>
            </Button>

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

export default memo(InstituteNavbar);
