import { CssBaseline } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AreaChart } from "@tremor/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DisplayWatchTime from "../../components/Common/DisplayWatchTime";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import Hero from "./components/Hero";

function StudentWatchHistory() {
	const user = useUserStore((state) => state.user);
	const [watchHistory, setWatchHistory] = useState([]);

	const [watchTimeAll, setWatchTimeAll] = useState(0);
	const [watchTimeToday, setWatchTimeToday] = useState(0);
	const [watchTimePerMonth, setWatchTimePerMonth] = useState([]);

	const [customerCode, setCustomerCode] = useState("");
	const [watchTimeLimit, setWatchTimeLimit] = useState(0);
	const [watchTimeQuota, setWatchTimeQuota] = useState(0);
	const [activePlan, setActivePlan] = useState(null);

	const [userPlan, setUserPlan] = useState(null);
	const [customUserPlans, setCustomUserPlans] = useState([]);

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
					console.log(res.data?.watchTimePerMonth);
					setWatchTimeAll(res.data?.watchTimeAll ?? 0);
					setWatchTimeToday(res.data?.watchTimeToday ?? 0);
					setWatchTimePerMonth(res.data?.watchTimePerMonth ?? []);
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
					setWatchTimeLimit(
						res.data?.user_plan?.plan?.watch_time_limit
					);
					setActivePlan(res.data?.user_plan?.plan?.name);
					setWatchTimeQuota(res.data?.user_plan?.quota);

					setUserPlan(res.data?.user_plan);
					setCustomUserPlans(res.data?.custom_user_plans);
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
		console.log({ totalSeconds });
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = (totalSeconds % 60).toFixed();
		return { hours, minutes, seconds };
	}

	function subtractTimes(time1, time2) {
		const totalSeconds = time1 - time2;
		return convertSecondsToHMS(totalSeconds);
	}

	const formatHMS = useMemo(() => {
		// console.log({ activePlan });
		const done = convertSecondsToHMS(userPlan?.quota);
		const { hours, minutes, seconds } = done;
		// console.log(done, watchTimeQuota, watchTimeAll);

		const hh = String(hours).padStart(2, "0");
		const mm = String(minutes).padStart(2, "0");
		const ss = String(seconds).padStart(2, "0");
		return <DisplayWatchTime hh={hh} mm={mm} ss={ss} />;
	}, [watchTimeLimit, watchTimeAll, userPlan]);

	// const [pendingAllTime, setPendingAllTime] = useState(null);
	// const done = subtractTimes(watchTimeLimit, watchTimeAll);
	// const pendingTime = formatHMS(done);

	const userTestimonials = useMemo(
		() => [
			{
				name: "All Time",
				testimonial: watchTimeAllString,
			},
			{
				name: "Today",
				testimonial: watchTimeTodayString,
			},
			{
				name: activePlan,
				testimonial: formatHMS,
			},

			...customUserPlans.map((plan) => {
				console.log(plan.quota);
				const { hours, minutes, seconds } = convertSecondsToHMS(
					plan.quota
				);

				const hh = String(hours).padStart(2, "0");
				const mm = String(minutes).padStart(2, "0");
				const ss = String(seconds).padStart(2, "0");

				return {
					name: plan.plan.plan_name,
					testimonial: <DisplayWatchTime hh={hh} mm={mm} ss={ss} />,
				};
			}),
		],
		[
			watchTimeAllString,
			watchTimeTodayString,
			activePlan,
			formatHMS,
			customUserPlans,
		]
	);

	const [mode, setMode] = useState("light");

	const defaultTheme = createTheme({ palette: { mode } });

	const watchTimePerMonthValueFormatter = (val) =>
		`${(val / 60).toFixed(2)} minutes`;

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
				}}>
				<div className="bg-white w-full p-4 rounded-lg">
					<h4>Watch Time Per Month</h4>
					<AreaChart
						data={watchTimePerMonth}
						index="_id"
						categories={["Watch Time per Month"]}
						allowDecimals={true}
						colors={["blue"]}
						valueFormatter={watchTimePerMonthValueFormatter}
						showLegend={true}
						showYAxis={true}
						showGradient={false}
						startEndOnly={true}
						className="mt-6 h-64"
						yAxisWidth={125}
					/>
				</div>
				<Grid container spacing={2}>
					{userTestimonials.map((testimonial, index) => (
						<Grid
							item
							xs={12}
							sm={6}
							md={6}
							key={index}
							sx={{ display: "flex" }}>
							<Card
								sx={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									flexGrow: 1,
									p: 1,
								}}>
								<CardContent>
									<div className="flex flex-col items-center">
										<Typography
											component="h6"
											variant="h6"
											color="text.primary">
											{testimonial.name}
										</Typography>
									</div>
									<Typography
										variant="body2"
										color="text.secondary">
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
									}}>
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
		</ThemeProvider>
	);
}
export default withAuth(StudentWatchHistory, ROLE_STUDENT);
