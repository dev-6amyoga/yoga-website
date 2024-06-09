import { useEffect, useMemo, useState } from "react";
import useUserStore from "../../store/UserStore";
// import { useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import { Fetch } from "../../utils/Fetch";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  CssBaseline,
} from "@mui/material";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined"; // Icon for "Watch"
import { Spacer } from "@geist-ui/core";
import Hero from "./components/Hero";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";

export default function FreeVideos() {
  const [planId, setPlanId] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState("");
  let user = useUserStore((state) => state.user);
  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
    },
  };
  const [player, setPlayer] = useState(null);

  const saveTarget = (e) => {
    // setting event target to gain control on player
    setPlayer(e.target);

    // get markers for current video
    // setMarker(asanas[queue[0]].asana.markers);

    // set duration

    // start timer for duration

    // check marker every second
  };

  const iChanged = (s) => {
    console.log(s);
  };
  const handleEnd = () => {
    console.log("the end");
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });
        const data = await response.data;
        if (data["userPlan"]) {
          setPlanId(data["userPlan"]["plan_id"]);
        } else {
          console.log(data["error"]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const [mode, setMode] = useState("light");

  const freeVideos = useMemo(
    () => [
      {
        videoId: "jYIE9dtfmr8",
        title: "Yoga to improve bowel movements",
      },
      { videoId: "iRFQyZa-L6A", title: "Try this to know your BMI!" },
      {
        videoId: "MLXrRYpbskg",
        title: "Improve Lung Capacity through yoga",
      },
      { videoId: "sIT1RyjWgJM", title: "Slow down and reduce stress" },
      { videoId: "20fvnDTOkRg", title: "Yoga for eyes" },
      { videoId: "hRD0coM5esM", title: "Benefits of sweating" },
      { videoId: "EYe_w4HlRoo", title: "Easy Headstand" },
      { videoId: "CojVgFpvFlw", title: "Dont cut nails at night" },
      { videoId: "CP8HZllEO_s", title: "Ujjayi Pranayama" },
      { videoId: "JMdWiSQ4cXE", title: "Weight Loss Yoga" },
      { videoId: "odFz9kG3BaM", title: "Why chant Om" },
      { videoId: "GsBv5kuTAug", title: "Improve back posture" },
      { videoId: "vKn5-2vusMc", title: "OM or AUM" },
      { videoId: "sFmxJtjb43Y", title: "Master Class 16Dec23" },
    ],
    []
  );
  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <StudentNavMUI />
      <div className="flex flex-col items-center h-96">
        <Hero heading="Free Videos" />
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mt: 4,
          }}
        >
          <Box sx={{ mb: 4, width: { xs: "100%", md: "70%" } }}>
            <YouTube
              videoId={currentVideoId}
              opts={videoOptions}
              onEnd={handleEnd}
              onReady={saveTarget}
              onStateChange={iChanged}
              containerClassName="yt-container"
              iframeClassName="w-full"
            />{" "}
          </Box>

          {/* Free Videos List (Scrollable) */}
          <Box
            sx={{
              width: { xs: "100%", md: "30%" },
              overflowY: "auto",
              maxHeight: 400,
            }}
          >
            {freeVideos.map((video) => (
              <Card key={video.videoId} sx={{ mb: 2 }}>
                {" "}
                {/* Add margin-bottom to each card */}
                <CardContent>
                  <div className="flex flex-row items-center">
                    <Button
                      variant="contained"
                      onClick={() => setCurrentVideoId(video.videoId)}
                      startIcon={<PlayCircleFilledWhiteOutlinedIcon />}
                    />
                    <Typography variant="subtitle1" className="truncate ml-2">
                      {video.title}
                    </Typography>
                  </div>
                </CardContent>
                {/* <CardActions>
                  <Button
                    variant="contained"
                    onClick={() => setCurrentVideoId(video.videoId)}
                    startIcon={<PlayCircleFilledWhiteOutlinedIcon />}
                  >
                    Watch
                  </Button>
                </CardActions> */}
              </Card>
            ))}
          </Box>
        </Container>
        {/* Video Title (Remains the same) */}
      </div>
    </ThemeProvider>
  );
}
