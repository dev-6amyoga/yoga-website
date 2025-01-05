// import PageWrapper from "../../components/Common/PageWrapper";
import { useEffect, useState } from "react";
import TeacherNavbar from "../../components/Common/TeacherNavbar/TeacherNavbar";
import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import VideoQueue from "../../components/StackVideoShaka/VideoQueue";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import ShakaVideo from "../testing/ShakaVideo";
import { CssBaseline, Paper } from "@mui/material";
import Hero from "../student/components/Hero";
import VideoRecorder from "../../components/video-recorder/VideoRecorder";

function TeacherPlaylist() {
  let user = useUserStore((state) => state.user);
  const [userPlan, setUserPlan] = useState({});
  const [planId, setPlanId] = useState(0);
  const [mode, setMode] = useState("light");

  const defaultTheme = createTheme({ palette: { mode } });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });
        const data = response.data;
        setUserPlan(data["userPlan"]);
        setPlanId(data["userPlan"]["plan_id"]);
      } catch (error) {
        console.log(error);
      }
    };
    // fetchData();
  }, [user?.user_id]);

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <TeacherNavbar />
      <Hero heading="6AM Yoga Player" />
      {/* {hasPlan || hasUserPlan ? ( */}
      <div className="max-w-7xl mx-auto">
        <Paper>
          <VideoRecorder />
        </Paper>
        <br />

        <VideoPlayerWrapper />
      </div>
      {/* ) : (
        <div className="max-w-7xl mx-auto flex items-center text-center justify-center">
          <h3>Please purchase a plan to view this page.</h3>
        </div>
      )} */}
    </ThemeProvider>
  );
}

export default TeacherPlaylist;
