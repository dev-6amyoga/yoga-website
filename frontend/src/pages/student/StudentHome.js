import { Paper } from "@mui/material";
// import { ThemeProvider, createTheme } from "@mui/material/styles";
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

import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

function StudentHome() {
  let [watchHistoryExhausted] = useWatchHistoryStore((state) => [
    state.watchHistoryExhausted,
  ]);
  const navigate = useNavigate();

  // Dark Mode State
  const [mode, setMode] = useState("light");

  // Toggle between Dark and Light mode
  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // MUI Theme Configuration
  const theme = createTheme({
    palette: {
      mode: mode,
    },
  });

  // Function to check OS, Chrome version, and Widevine CDM version
  const isNotAllowedToPlay = async () => {
    const userAgent = navigator.userAgent;

    // Detect Windows OS
    const isWindows = userAgent.includes("Windows");

    // Extract Chrome version
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    let chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : null;

    // Check Widevine Content Decryption Module version
    let widevineVersion = null;
    if (navigator.requestMediaKeySystemAccess) {
      try {
        const config = [
          {
            initDataTypes: ["cenc"],
            videoCapabilities: [{ contentType: "video/mp4" }],
          },
        ];
        const access = await navigator.requestMediaKeySystemAccess(
          "com.widevine.alpha",
          config
        );
        const keySystem = access.getConfiguration();
        widevineVersion = keySystem?.distinctiveIdentifier;
      } catch (error) {
        console.warn("Widevine CDM check failed:", error);
      }
    }

    // Widevine version threshold (4.10.2891.0)
    const requiredWidevineVersion = "4.10.2891.0";

    // If on Windows, check both Chrome version and Widevine version
    if (
      isWindows &&
      (chromeVersion < 133 ||
        (widevineVersion && widevineVersion < requiredWidevineVersion))
    ) {
      return true;
    }

    return false; // Allow if conditions are not met
  };

  useEffect(() => {
    isNotAllowedToPlay().then((notAllowed) => {
      if (notAllowed) {
        alert(
          "Your browser is outdated. Please upgrade Chrome to version 133+ and ensure Widevine CDM is version 4.10.2891.0+."
        );
        window.location.href = "https://www.google.com/chrome/";
      }
    });
  }, []);

  useEffect(() => {
    if (watchHistoryExhausted) {
      toast("Watch time exhausted!");
      navigate("/student/purchase-a-plan");
    }
  }, [watchHistoryExhausted]);

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
        if (res.length !== 0) {
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
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Dark Mode Toggle Button */}
      <div className="flex justify-end p-4">
        <IconButton onClick={toggleMode} color="inherit">
          {mode === "light" ? <Brightness4 /> : <Brightness7 />}
        </IconButton>
      </div>

      <StudentNavMUI />
      <Hero heading="6AM Yoga Player" />

      {hasPlan || (hasUserPlan && !watchHistoryExhausted) ? (
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

// function StudentHome() {
//   let [watchHistoryExhausted] = useWatchHistoryStore((state) => [
//     state.watchHistoryExhausted,
//   ]);
//   const navigate = useNavigate();

//   const isNotAllowedToPlay = async () => {
//     const userAgent = navigator.userAgent;
//     const isWindows = userAgent.includes("Windows");
//     const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
//     let chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : null;
//     let widevineVersion = null;
//     if (navigator.requestMediaKeySystemAccess) {
//       try {
//         const config = [
//           {
//             initDataTypes: ["cenc"],
//             videoCapabilities: [{ contentType: "video/mp4" }],
//           },
//         ];
//         const access = await navigator.requestMediaKeySystemAccess(
//           "com.widevine.alpha",
//           config
//         );
//         const keySystem = access.getConfiguration();
//         widevineVersion = keySystem?.distinctiveIdentifier;
//       } catch (error) {
//         console.warn("Widevine CDM check failed:", error);
//       }
//     }
//     const requiredWidevineVersion = "4.10.2891.0";
//     if (
//       isWindows &&
//       (chromeVersion < 133 ||
//         (widevineVersion && widevineVersion < requiredWidevineVersion))
//     ) {
//       return true;
//     }
//     return false;
//   };

//   useEffect(() => {
//     isNotAllowedToPlay().then((notAllowed) => {
//       if (notAllowed) {
//         alert(
//           "Your browser is outdated. Please upgrade Chrome to version 133+ and ensure Widevine CDM is version 4.10.2891.0+."
//         );
//         window.location.href = "https://www.google.com/chrome/";
//       }
//     });
//   }, []);

//   useEffect(() => {
//     if (watchHistoryExhausted) {
//       toast("Watch time exhausted!");
//       navigate("/student/purchase-a-plan");
//     }
//   }, [watchHistoryExhausted]);

//   const [mode, setMode] = useState("light");
//   const defaultTheme = createTheme({ palette: { mode } });
//   const [user, userPlan] = useUserStore((state) => [
//     state.user,
//     state.userPlan,
//   ]);

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
//         if (res.length !== 0) {
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
//       const res = await Fetch({
//         url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
//         token: true,
//         method: "GET",
//       });

//       if (res.status === 200 && res.data.plans) {
//         const today = new Date();
//         const hasValidPlan = res.data.plans.some(
//           (plan) => new Date(plan.validity_to) > today
//         );
//         setHasPlan(hasValidPlan);
//       }
//     };

//     if (user && userPlan) {
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

export default withAuth(StudentHome, ROLE_STUDENT);
