import { useEffect, useMemo, useState } from "react";
import useUserStore from "../../store/UserStore";
import PlayCircleFilledWhiteOutlinedIcon from "@mui/icons-material/PlayCircleFilledWhiteOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import OndemandVideoOutlinedIcon from "@mui/icons-material/OndemandVideoOutlined";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import YouTube from "react-youtube";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import { Fetch } from "../../utils/Fetch";
import Hero from "./components/Hero";

const thumbnailUrl = (videoId) =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

export default function FreeVideos() {
  const [planId, setPlanId] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState("sKlJT1WIEbI");
  const [searchTerm, setSearchTerm] = useState("");
  const user = useUserStore((state) => state.user);

  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });
        const userPlans = response.data?.userPlan || [];
        const activePlan = Array.isArray(userPlans)
          ? userPlans.find((plan) => plan.current_status === "ACTIVE")
          : null;

        if (activePlan) setPlanId(activePlan.plan_id);
      } catch (error) {
        setPlanId(0);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const freeVideos = useMemo(
    () => [
      { videoId: "sKlJT1WIEbI", title: "What yoga means to me" },
      { videoId: "U7HrzV8dpvs", title: "My weightloss journey" },
      { videoId: "jYIE9dtfmr8", title: "Yoga to improve bowel movements" },
      { videoId: "iRFQyZa-L6A", title: "Try this to know your BMI!" },
      { videoId: "MLXrRYpbskg", title: "Improve Lung Capacity through yoga" },
      { videoId: "sIT1RyjWgJM", title: "Slow down and reduce stress" },
      { videoId: "20fvnDTOkRg", title: "Yoga for eyes" },
      { videoId: "hRD0coM5esM", title: "Benefits of sweating" },
      { videoId: "EYe_w4HlRoo", title: "Easy Headstand" },
      { videoId: "CojVgFpvFlw", title: "Don't cut nails at night" },
      { videoId: "CP8HZllEO_s", title: "Ujjayi Pranayama" },
      { videoId: "JMdWiSQ4cXE", title: "Weight Loss Yoga" },
      { videoId: "odFz9kG3BaM", title: "Why chant Om" },
      { videoId: "GsBv5kuTAug", title: "Improve back posture" },
      { videoId: "vKn5-2vusMc", title: "OM or AUM" },
      { videoId: "sFmxJtjb43Y", title: "Master Class 16Dec23" },
    ],
    [],
  );

  const filteredVideos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return freeVideos;

    return freeVideos.filter((video) =>
      video.title.toLowerCase().includes(normalizedSearch),
    );
  }, [freeVideos, searchTerm]);

  const selectedVideo =
    freeVideos.find((video) => video.videoId === currentVideoId) ||
    freeVideos[0];

  return (
    <Box sx={{ bgcolor: "#f7f8fb", minHeight: "100vh" }}>
      <StudentNavMUI />
      <Hero heading="Free Videos" />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                <Chip
                  icon={<OndemandVideoOutlinedIcon />}
                  label={`${freeVideos.length} free lessons`}
                  sx={{ bgcolor: "#fff", fontWeight: 700 }}
                />
                <Chip
                  icon={<AccessTimeOutlinedIcon />}
                  label={planId ? "Subscription active" : "No plan required"}
                  color={planId ? "success" : "default"}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
              <Typography
                component="h1"
                sx={{
                  color: "#101828",
                  fontSize: { xs: 26, md: 36 },
                  fontWeight: 900,
                }}
              >
                Watch guided yoga videos
              </Typography>
              <Typography sx={{ color: "#667085", mt: 0.75, maxWidth: 720 }}>
                Browse short practices, wellness explainers, and beginner
                friendly yoga guidance.
              </Typography>
            </Box>

            <TextField
              size="small"
              placeholder="Search videos"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              sx={{
                width: { xs: "100%", md: 320 },
                bgcolor: "#fff",
                alignSelf: { md: "flex-end" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Card
              elevation={0}
              sx={{
                overflow: "hidden",
                border: "1px solid #dfe5ec",
                borderRadius: 2,
                bgcolor: "#fff",
              }}
            >
              <Box
                sx={{
                  bgcolor: "#101828",
                  aspectRatio: "16 / 9",
                  "& .yt-container": { height: "100%" },
                  "& iframe": {
                    display: "block",
                    width: "100%",
                    height: "100%",
                  },
                }}
              >
                <YouTube
                  videoId={currentVideoId}
                  opts={videoOptions}
                  containerClassName="yt-container"
                />
              </Box>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography
                  component="h2"
                  sx={{ color: "#101828", fontSize: 24, fontWeight: 900 }}
                >
                  {selectedVideo.title}
                </Typography>
                <Typography sx={{ color: "#667085", mt: 0.75 }}>
                  Select another video from the playlist to continue watching.
                </Typography>
              </CardContent>
            </Card>

            <Card
              elevation={0}
              sx={{
                border: "1px solid #dfe5ec",
                borderRadius: 2,
                bgcolor: "#fff",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 2, borderBottom: "1px solid #eef2f6" }}>
                <Typography sx={{ color: "#101828", fontWeight: 900 }}>
                  Playlist
                </Typography>
                <Typography variant="body2" sx={{ color: "#667085" }}>
                  {filteredVideos.length} videos available
                </Typography>
              </Box>

              <Stack
                spacing={1}
                sx={{
                  p: 1.5,
                  maxHeight: { xs: "none", lg: 650 },
                  overflowY: { xs: "visible", lg: "auto" },
                }}
              >
                {filteredVideos.length === 0 ? (
                  <Alert severity="info">No videos match your search.</Alert>
                ) : (
                  filteredVideos.map((video) => {
                    const isSelected = video.videoId === currentVideoId;

                    return (
                      <Button
                        key={video.videoId}
                        fullWidth
                        onClick={() => setCurrentVideoId(video.videoId)}
                        sx={{
                          justifyContent: "flex-start",
                          p: 1,
                          borderRadius: 1.5,
                          textTransform: "none",
                          bgcolor: isSelected
                            ? "rgba(31, 111, 91, 0.1)"
                            : "transparent",
                          border: "1px solid",
                          borderColor: isSelected ? "#1f6f5b" : "transparent",
                          "&:hover": {
                            bgcolor: "rgba(31, 111, 91, 0.08)",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                          sx={{ width: "100%", minWidth: 0 }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: 96,
                              aspectRatio: "16 / 9",
                              flexShrink: 0,
                              borderRadius: 1,
                              overflow: "hidden",
                              bgcolor: "#101828",
                              backgroundImage: `url(${thumbnailUrl(
                                video.videoId,
                              )})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: isSelected
                                  ? "rgba(31, 111, 91, 0.35)"
                                  : "rgba(16, 24, 40, 0.22)",
                              }}
                            >
                              <PlayCircleFilledWhiteOutlinedIcon
                                sx={{ color: "#fff", fontSize: 30 }}
                              />
                            </Box>
                          </Box>

                          <Typography
                            sx={{
                              color: "#101828",
                              fontWeight: isSelected ? 900 : 700,
                              textAlign: "left",
                              lineHeight: 1.35,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {video.title}
                          </Typography>
                        </Stack>
                      </Button>
                    );
                  })
                )}
              </Stack>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
