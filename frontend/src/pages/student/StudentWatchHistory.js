import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { getMongoDecimalValue } from "../../utils/getMongoDecimalValue";
import { withAuth } from "../../utils/withAuth";
import Hero from "./components/Hero";

function DisplayWatchTime({ hh, mm, ss }) {
  return (
    <div className="grid grid-cols-3">
      <p className="flex flex-col items-center gap-2">
        <span className="font-mono text-5xl">{hh}</span>
        <span>Hours</span>
      </p>
      <p className="flex flex-col items-center gap-2">
        <span className="font-mono text-5xl">{mm}</span>
        <span>Minutes</span>
      </p>
      <p className="flex flex-col items-center gap-2">
        <span className="font-mono text-5xl">{ss}</span>
        <span>Seconds</span>
      </p>
    </div>
  );
}

function StudentWatchHistory() {
  const user = useUserStore((state) => state.user);
  const [watchHistory, setWatchHistory] = useState([]);

  const [watchTimeAll, setWatchTimeAll] = useState(0);
  const [watchTimeToday, setWatchTimeToday] = useState(0);

  const [customerCode, setCustomerCode] = useState("");
  const [watchTimeLimit, setWatchTimeLimit] = useState(0);
  const [watchTimeQuota, setWatchTimeQuota] = useState(0);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    setCustomerCode(import.meta.env.VITE_CLOUDFLARE_CUSTOMER_CODE);
  }, []);

  const fetchWatchHistory = useCallback(() => {
    Fetch({
      url: "/watch-history/get",
      method: "POST",
      token: true,
      data: {
        user_id: user?.user_id,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          setWatchHistory(res.data.watchHistory);
          console.log(res.data.watchHistory);
        }
      })
      .catch((err) => {
        console.log(err);
        toast("Error fetching watch history", {
          type: "error",
        });
      });
  }, [user]);

  const fetchWatchTimeStats = useCallback(() => {
    Fetch({
      url: "/watch-time/get-stats",
      method: "POST",
      token: true,
      data: {
        user_id: user?.user_id,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          setWatchTimeAll(res.data?.watchTimeAll ?? 0);
          setWatchTimeToday(res.data?.watchTimeToday ?? 0);
        }
      })
      .catch((err) => {
        console.log(err);
        toast("Error fetching watch time", {
          type: "error",
        });
      });
  }, [user]);

  const fetchWatchTimeQuota = useCallback(() => {
    Fetch({
      url: "/watch-time/get-quota",
      method: "POST",
      token: true,
      data: {
        user_id: user?.user_id,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          console.log(res.data);
          setWatchTimeLimit(res.data?.user_plan?.plan?.watch_time_limit);
          setActivePlan(res.data?.user_plan?.plan?.name);
          setWatchTimeQuota(res.data?.quota?.quota);
        }
      })
      .catch((err) => {
        console.log(err);
        // toast('Error fetching watch time', {
        //     type: 'error',
        // })
      });
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWatchHistory();
      fetchWatchTimeStats();
      fetchWatchTimeQuota();
    }
  }, [user, fetchWatchHistory, fetchWatchTimeStats, fetchWatchTimeQuota]);

  const watchTimeAllString = useMemo(() => {
    const [hh, mm, ss] = new Date(watchTimeAll.toFixed(2) * 1000)
      .toISOString()
      .slice(11, 19)
      .split(":");
    return <DisplayWatchTime hh={hh} mm={mm} ss={ss} />;
  }, [watchTimeAll]);

  const watchTimeTodayString = useMemo(() => {
    const [hh, mm, ss] = new Date(watchTimeToday.toFixed(2) * 1000)
      .toISOString()
      .slice(11, 19)
      .split(":");
    return <DisplayWatchTime hh={hh} mm={mm} ss={ss} />;
  }, [watchTimeToday]);

  function convertSecondsToHMS(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }

  function subtractTimes(time1, time2) {
    const totalSeconds = time1 - time2;
    return convertSecondsToHMS(totalSeconds);
  }

  function formatHMS({ hours, minutes, seconds }) {
    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");
    return <DisplayWatchTime hh={hh} mm={mm} ss={ss} />;
  }

  const [pendingAllTime, setPendingAllTime] = useState(null);
  const done = subtractTimes(watchTimeLimit, watchTimeAll);
  const pendingTime = formatHMS(done);

  const userTestimonials = [
    {
      name: "All Time",
      testimonial: watchTimeAllString,
    },
    {
      name: "Today",
      testimonial: watchTimeTodayString,
    },
    // {
    //   name: "Quota",
    //   testimonial: activePlan ? (
    //     <p className="flex flex-col items-center gap-2">
    //       <span className="font-mono text-5xl">
    //         {(getMongoDecimalValue(watchTimeQuota) / 3600).toFixed(2)} /{" "}
    //         {(watchTimeLimit / 3600).toFixed(2)}
    //       </span>
    //       <span>Hours</span>
    //     </p>
    //   ) : (
    //     // Display for no active plan
    //     <p>No Active Plan</p>
    //   ),
    // },
    {
      name: "Pending Time",
      testimonial: pendingTime,
    },
  ];
  const [mode, setMode] = useState("light");

  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <StudentNavMUI />
      <Hero heading="Watch History" />
      <Container
        id="testimonials"
        sx={{
          pt: { xs: 2, sm: 2 },
          pb: { xs: 8, sm: 16 },
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
          background: "linear-gradient(#033363, #021F3B)",
          borderRadius: 8, // Add this line for rounded corners

          // border: "1px solid lightgray",
        }}
      >
        <Grid container spacing={2}>
          {userTestimonials.map((testimonial, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  flexGrow: 1,
                  p: 1,
                }}
              >
                <CardContent>
                  <div className="flex flex-col items-center">
                    <Typography
                      component="h6"
                      variant="h6"
                      color="text.primary"
                    >
                      {testimonial.name}
                    </Typography>
                  </div>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.testimonial}
                  </Typography>
                  {/* </div> */}
                </CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    pr: 2,
                  }}
                >
                  {/* <CardHeader
                    title={testimonial.name}
                    // subheader={testimonial.occupation}
                  /> */}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
        {/* <Button
          onClick={() => {
            fetchWatchHistory();
            fetchWatchTimeStats();
            fetchWatchTimeQuota();
          }}
        >
          Refresh
        </Button> */}
      </Container>

      {/* 
			<section className="my-8">
				<h2>Watch History</h2>
				<div className="my-4 grid grid-cols-1 gap-2 md:grid-cols-2">
					{watchHistory?.map((wh) => (
						<Note key={wh?.history?._id} label={false}>
							<div className="flex flex-row items-start gap-4">
								<img
									src={`https://customer-${customerCode}.cloudflarestream.com/${wh.asana?.asana_videoID}/thumbnails/thumbnail.jpg?time=1s?height=150`}
									alt={
										wh.asana
											? wh.asana?.asana_name
											: wh._id + "video"
									}
									className="h-24 rounded-xl"
								/>
								<div>
									<p className="text-base font-bold">
										{wh?.asana?.asana_name}
									</p>
									<p className="text-sm text-zinc-700">
										{wh?.asana?.asana_desc}
									</p>
									<p className="">
										{new Date(wh.created_at).toDateString()}
									</p>
								</div>
							</div>
						</Note>
					))}
				</div>
			</section> */}
    </ThemeProvider>
  );
}
export default withAuth(StudentWatchHistory, ROLE_STUDENT);
