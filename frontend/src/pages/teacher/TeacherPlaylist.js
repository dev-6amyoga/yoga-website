// import PageWrapper from "../../components/Common/PageWrapper";
import { useEffect, useState } from "react";
import TeacherNavbar from "../../components/Common/TeacherNavbar/TeacherNavbar";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import useUserStore from "../../store/UserStore";
import { getPlaylists } from "../../api/teacherApi";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { CssBaseline, Paper } from "@mui/material";
import Hero from "../student/components/Hero";
import VideoRecorder from "../../components/video-recorder/VideoRecorder";

function TeacherPlaylist() {
  let user = useUserStore((state) => state.user);
  const [mode, setMode] = useState("light");
  const [playlists, setPlaylists] = useState([]);

  const defaultTheme = createTheme({ palette: { mode } });

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await getPlaylists();
        setPlaylists(response?.playlists || []);
      } catch (error) {
        console.error("Error fetching teacher playlists:", error);
      }
    };
    fetchPlaylists();
  }, []);

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

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">
            Your Teacher Playlists
          </h2>
          {playlists.length === 0 ? (
            <p className="text-slate-600">
              No playlists found for your account.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="rounded-xl border border-slate-200 p-4 shadow-sm bg-white"
                >
                  <h3 className="text-lg font-semibold">{playlist.name}</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {playlist.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-3">
                    {playlist.videoCount} videos • {playlist.totalDuration}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

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
