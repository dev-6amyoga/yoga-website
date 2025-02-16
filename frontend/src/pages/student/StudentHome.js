import { CssBaseline, Paper } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { withAuth } from "../../utils/withAuth";
import "./MovingText.css";
import Hero from "./components/Hero";
import { Fetch } from "../../utils/Fetch";
import VideoRecorder from "../../components/video-recorder/VideoRecorder";

import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function StudentHome() {
  let [watchHistoryExhausted] = useWatchHistoryStore((state) => [
    state.watchHistoryExhausted,
  ]);
  const navigate = useNavigate();
  const isOldWindows = () => {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (match) {
      const version = parseFloat(match[1]);
      return version < 10.0;
    }
    return true;
  };

  if (isOldWindows()) {
    alert(
      "Your Windows version is outdated. Please upgrade to Windows 10 or later."
    );
    window.location.href =
      "https://www.microsoft.com/en-us/windows/get-windows-10"; // Redirect to upgrade page
  }

  useEffect(() => {
    if (watchHistoryExhausted) {
      toast("Watch time exhausted!");
      navigate("/student/purchase-a-plan");
    }
  }, [watchHistoryExhausted]);

  const [mode, setMode] = useState("light");
  const defaultTheme = createTheme({ palette: { mode } });
  const [user, userPlan] = useUserStore((state) => [
    state.user,
    state.userPlan,
  ]);

  const [hasPlan, setHasPlan] = useState(false);
  const [hasUserPlan, setHasUserPlan] = useState(false);

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
        let res = data.userPlan.filter((d) =>
          d.current_status.toLowerCase().includes("active")
        );
        console.log(res, "hello");
        if (res != null) {
          setHasUserPlan(true);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlanData();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await Fetch({
        url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
        token: true,
        method: "GET",
      });

      if (res.status === 200 && res.data.plans) {
        const today = new Date();
        const hasValidPlan = res.data.plans.some(
          (plan) => new Date(plan.validity_to) > today
        );
        setHasPlan(hasValidPlan);
      }
    };

    if (user && userPlan) {
      if (userPlan.current_status === "ACTIVE") {
        if (userPlan?.plan?.has_basic_playlist) {
          setHasPlan(true);
          return;
        }
      }
      fetchData();
    } else {
      fetchData();
    }
  }, [user, userPlan]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <StudentNavMUI />
      <Hero heading="6AM Yoga Player" />

      {isOldWindows() ? (
        <div className="max-w-7xl mx-auto flex items-center text-center justify-center">
          <h3>Please upgrade to Windows 10 or higher to view this player.</h3>
        </div>
      ) : hasPlan || (hasUserPlan && !watchHistoryExhausted) ? (
        <div className="max-w-7xl mx-auto">
          <Paper>
            <VideoRecorder />
          </Paper>
          <br />
          <VideoPlayerWrapper />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto flex items-center text-center justify-center">
          <h3>Please purchase a plan to view this page.</h3>
        </div>
      )}
    </ThemeProvider>
  );
}

export default withAuth(StudentHome, ROLE_STUDENT);

// function StudentHome() {
//   let [watchHistoryExhausted] = useWatchHistoryStore((state) => [
//     state.watchHistoryExhausted,
//   ]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (watchHistoryExhausted) {
//       toast("Watch time exhausted!");
//       navigate("/student/purchase-a-plan");
//     } else {
//       console.log("Watch time not exhausted!");
//     }
//   }, [watchHistoryExhausted]);

//   const [mode, setMode] = useState("light");
//   const defaultTheme = createTheme({ palette: { mode } });
//   const [user, userPlan] = useUserStore((state) => [
//     state.user,
//     state.userPlan,
//   ]);

//   // check if user has plan
//   const [hasPlan, setHasPlan] = useState(false);
//   const [hasUserPlan, setHasUserPlan] = useState(false);

//   useEffect(() => {
//     const fetchPlanData = async () => {
//       try {
//         const response = await Fetch({
//           url: "/user-plan/get-user-plan-by-id",
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           data: { user_id: user?.user_id },
//         });
//         const data = response.data;
//         let res = data.userPlan.filter((d) =>
//           d.current_status.toLowerCase().includes("active")
//         );
//         if (res != null) {
//           setHasUserPlan(true);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     fetchPlanData();
//   }, [user]);

//   useEffect(() => {
//     const fetchData = async () => {
//       console.log("user plan is : ", user);
//       const res = await Fetch({
//         url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
//         token: true,
//         method: "GET",
//       });
//       if (res.status === 200) {
//         if (res.data.plans) {
//           const today = new Date();
//           const validPlans = res.data.plans.filter(
//             (plan) => new Date(plan.validity_to) > today
//           );
//           const sortedPlans = validPlans.sort(
//             (a, b) => new Date(b.created.$date) - new Date(a.created.$date)
//           );
//           if (sortedPlans.length > 0) {
//             setHasPlan(true);
//           } else {
//             setHasPlan(false);
//           }
//         }
//       }
//     };

//     if (
//       user !== null &&
//       user !== undefined &&
//       userPlan !== null &&
//       userPlan !== undefined
//     ) {
//       // console.log(user, userPlan);
//       if (userPlan.current_status === "ACTIVE") {
//         if (userPlan?.plan?.has_basic_playlist) {
//           setHasPlan(true);
//           return;
//         }
//       }
//       fetchData();
//     } else {
//       fetchData();
//     }
//   }, [user, userPlan]);

//   return (
//     <ThemeProvider theme={defaultTheme}>
//       <CssBaseline />
//       <StudentNavMUI />
//       <Hero heading="6AM Yoga Player" />
//       {hasPlan || (hasUserPlan && !watchHistoryExhausted) ? (
//         <div className="max-w-7xl mx-auto">
//           <Paper>
//             <VideoRecorder />
//           </Paper>
//           <br />

//           <VideoPlayerWrapper />
//         </div>
//       ) : (
//         <div className="max-w-7xl mx-auto flex items-center text-center justify-center">
//           <h3>Please purchase a plan to view this page.</h3>
//         </div>
//       )}
//     </ThemeProvider>
//   );
// }
