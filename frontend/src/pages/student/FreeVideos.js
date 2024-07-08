import { useEffect, useMemo, useState } from "react";
import useUserStore from "../../store/UserStore";
// import { useNavigate } from "react-router-dom";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined"; // Icon for "Watch"
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  Typography,
  alpha,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import YouTube from "react-youtube";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import { Fetch } from "../../utils/Fetch";
import Hero from "./components/Hero";

export default function FreeVideos() {
  const [planId, setPlanId] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState("sKlJT1WIEbI");
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
    setPlayer(e.target);
  };

  const iChanged = (s) => {};
  const handleEnd = () => {};

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
        videoId: "sKlJT1WIEbI",
        title: "What yoga means to me",
      },
      {
        videoId: "U7HrzV8dpvs",
        title: "My weightloss journey",
      },

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

        <Box
          id="image"
          sx={(theme) => ({
            mt: { xs: 0, sm: 0 },
            alignSelf: "center",
            height: { xs: 200, sm: 900 },
            width: "80%",
            backgroundSize: "cover",
            borderRadius: "10px",
            outline: "1px solid",
            mb: 4,
            background: "linear-gradient(#033363, #021F3B)",
            outlineColor: alpha("#BFCCD9", 0.5),
            boxShadow: `0 0 12px 8px ${alpha("#9CCCFC", 0.2)}`,
          })}
        >
          <Container
            maxWidth="xl"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              mt: 4,
            }}
          >
            <Box
              sx={{
                mb: 4,
                width: {
                  xs: "100%",
                  md: "70%",
                },
                aspectRatio: 16 / 9,
              }}
            >
              <YouTube
                videoId={currentVideoId}
                opts={videoOptions}
                onEnd={handleEnd}
                onReady={saveTarget}
                onStateChange={iChanged}
                containerClassName="yt-container"
                iframeClassName="h-auto w-full aspect-video"
              />{" "}
            </Box>
            <Box
              sx={{
                width: { xs: "100%", md: "30%" },
                overflowY: "auto",
                maxHeight: 400,
                mb: 4,
              }}
            >
              {freeVideos.map((video) => (
                <Button
                  key={video.videoId}
                  fullWidth
                  onClick={() => setCurrentVideoId(video.videoId)}
                  sx={{ mb: 2 }}
                >
                  <Card className="hover-card" sx={{ width: "100%" }}>
                    <CardContent>
                      <div className="flex flex-row items-center gap-2">
                        <Typography variant="subtitle1" className="truncate">
                          {video.title}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Button>
              ))}
            </Box>
          </Container>
        </Box>
      </div>
    </ThemeProvider>
  );
}
