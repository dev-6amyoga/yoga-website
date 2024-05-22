import { Button, Divider, Note } from "@geist-ui/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { getMongoDecimalValue } from "../../utils/getMongoDecimalValue";

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

export default function StudentWatchHistory() {
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
					setWatchTimeLimit(
						res.data?.user_plan?.plan?.watch_time_limit
					);
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

	return (
		<StudentPageWrapper heading="Watch History">
			<Button
				onClick={() => {
					fetchWatchHistory();
					fetchWatchTimeStats();
					fetchWatchTimeQuota();
				}}>
				Refresh
			</Button>

			<section className="my-8 flex flex-col justify-between gap-2 text-white md:grid md:grid-cols-3 md:items-start">
				<div className="text-ybrown-100 max-w-xl flex-1 rounded-xl border bg-slate-800 p-4 text-center ">
					<div className="pb-4">
						<h3 className="text-4xl">Watch Time</h3>
						<small>All Time</small>
					</div>
					{watchTimeAllString}
				</div>
				<div className="text-ybrown-100 max-w-xl flex-1 rounded-xl border bg-slate-800 p-4 text-center">
					<div className="pb-4">
						<h3 className="text-4xl">Watch Time</h3>
						<small>Today</small>
					</div>
					{watchTimeTodayString}
				</div>
				<div className="text-ybrown-100 max-w-xl flex-1 rounded-xl border bg-slate-800 p-4 text-center">
					<div className="pb-4">
						<h3 className="text-4xl">Quota</h3>
						<small>{activePlan}</small>
					</div>
					{activePlan ? (
						<p className="flex flex-col items-center gap-2">
							<span className="font-mono text-5xl">
								{(
									getMongoDecimalValue(watchTimeQuota) / 3600
								).toFixed(2)}
								<span> / </span>
								{(watchTimeLimit / 3600).toFixed(2)}
							</span>
							<span>Hours</span>
						</p>
					) : (
						<p>No Active Plan</p>
					)}
				</div>
			</section>

			<Divider />
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
			</section>
		</StudentPageWrapper>
	);
}
