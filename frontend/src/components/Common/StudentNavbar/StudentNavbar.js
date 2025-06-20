import { Menu } from "@geist-ui/icons";
import { memo, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserStore from "../../../store/UserStore";
// import StudentPlan from "../../../pages/student/StudentPlan";
import { useCookies } from "react-cookie";
import {
  SIXAMYOGA_ACCESS_TOKEN,
  SIXAMYOGA_REFRESH_TOKEN,
} from "../../../enums/cookies";
import { USER_PLAN_ACTIVE } from "../../../enums/user_plan_status";
import { Fetch } from "../../../utils/Fetch";
import { Button } from "../../ui/button";
import {
  CustomDropdown,
  CustomDropdownContent,
  CustomDropdownItem,
  CustomDropdownTrigger,
} from "../../ui/custom-dropdown";

function StudentNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  let userPlan = useUserStore((state) => state.userPlan);
  let setUserPlan = useUserStore((state) => state.setUserPlan);
  const [planId, setPlanId] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [disabledTailorMade, setDisabledTailorMade] = useState(false);

  const resetUserState = useUserStore((state) => state.resetUserState);

  const [cookies, setCookie, removeCookie] = useCookies([
    SIXAMYOGA_ACCESS_TOKEN,
    SIXAMYOGA_REFRESH_TOKEN,
  ]);

  const handleLogout = () => {
    Fetch({
      url: "/auth/logout",
      method: "POST",
      token: true,
    })
      .then((res) => {
        removeCookie(SIXAMYOGA_ACCESS_TOKEN);
        removeCookie(SIXAMYOGA_REFRESH_TOKEN);

        resetUserState();
        navigate("/auth");
      })
      .catch((err) => {
        console.log("Logout Error:", err);
        removeCookie(SIXAMYOGA_ACCESS_TOKEN);
        removeCookie(SIXAMYOGA_REFRESH_TOKEN);
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
          setPlanId(data["userPlan"][indexOfActiveUserPlan]["plan_id"]);
          if (
            data["userPlan"][indexOfActiveUserPlan]["plan"]
              .has_playlist_creation
          ) {
            setDisabledTailorMade(false);
          } else {
            setDisabledTailorMade(true);
          }
          if (
            data["userPlan"][indexOfActiveUserPlan]["plan"].has_basic_playlist
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
  }, [user]);

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
      // {
      //   type: "group",
      //   path: "/student/playlist-view",
      //   title: "My Playlists",
      //   props: {
      //     disabled: disabledTailorMade,
      //   },
      //   subPaths: [
      //     {
      //       path: "/student/register-new-playlist",
      //       title: "Register New Playlist",
      //     },
      //     {
      //       path: "/student/view-all-playlists",
      //       title: "View All Playlists",
      //     },
      //   ],
      // },
      // {
      //   path: "/student/about-us",
      //   title: "About Us",
      //   props: {
      //     disabled: false,
      //   },
      // },
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
      {
        path: "/student/my-profile",
        title: user ? user?.name : "",
        props: {
          disabled: false,
        },
      },
    ];
  }, [user, disabledTailorMade, disabled]);

  return (
    <>
      <div className="fixed z-[998] flex w-full items-center gap-4 bg-zinc-900 px-8 py-4 text-white pointer-events-auto">
        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
        <h1 className="text-xl font-bold">6AM Yoga</h1>
      </div>
      <div
        className={`fixed w-screen h-screen bg-black z-[997] ${open ? "bg-opacity-30" : "bg-opacity-0"} transition-opacity delay-300 duration-200 pointer-events-none`}
        onClick={() => {
          setOpen(false);
        }}
      ></div>
      <div
        className={`z-[1500] fixed w-96 h-full p-4 ${open ? "translate-x-0" : "-translate-x-[600px]"} transition-transform duration-500 pointer-events-auto`}
      >
        <div className="relative w-full h-full border-4 border-y-green rounded-2xl bg-white overflow-y-auto p-4 flex flex-col gap-4">
          <div>
            <img src="/logo_6am.png" />
          </div>
          <div
            className="absolute rounded-full px-2 text-sm py-1 top-4 right-4"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </div>
          {paths.map((path, index) => {
            if (path?.type === "group") {
              return (
                <CustomDropdown type="single" collapsible>
                  <CustomDropdownItem value="item-1">
                    <CustomDropdownTrigger>{path.title}</CustomDropdownTrigger>
                    <CustomDropdownContent>
                      {path.subPaths.map((subPath, index) => (
                        <Button
                          key={"subPath" + subPath.path + index}
                          onClick={() => navigate(subPath.path)}
                        >
                          {subPath.title}
                        </Button>
                      ))}
                    </CustomDropdownContent>
                  </CustomDropdownItem>
                </CustomDropdown>
              );
            } else {
              return (
                <Button
                  variant="ghost"
                  key={"nav_path" + path.title}
                  onClick={() => {
                    navigate(path.path);
                  }}
                  disabled={path.props?.disabled}
                >
                  {path.title}
                </Button>
              );
            }
          })}
          <hr />
          {user ? (
            <>
              <h2 className="text-center text-sm">Logged in as {user?.name}</h2>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Link to={"/auth"} className="w-full">
              <Button className="w-full">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(StudentNavbar);
