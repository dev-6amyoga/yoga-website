import { Button } from "@geist-ui/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";

export default function StudentWatchHistory() {
	const user = useUserStore((state) => state.user);
	const [watchHistory, setWatchHistory] = useState([]);
	const [watchTimeLog, setWatchTimeLog] = useState([]);

	const fetchWatchHistory = useCallback(() => {
		Fetch({
			url: "http://localhost:4000/watch-history/get",
			method: "POST",
			token: true,
			data: {
				user_id: user.user_id,
			},
		})
			.then((res) => {
				if (res.status === 200) {
					setWatchHistory(res.data.watchHistory);
				}
			})
			.catch((err) => {
				console.log(err);
				toast("Error fetching watch history", {
					type: "error",
				});
			});
	}, [user]);

	const fetchWatchTimeLog = useCallback(() => {
		Fetch({
			url: "http://localhost:4000/watch-time/get",
			method: "POST",
			token: true,
			data: {
				user_id: user.user_id,
			},
		})
			.then((res) => {
				if (res.status === 200) {
					setWatchTimeLog(res.data.watchTimeLog);
				}
			})
			.catch((err) => {
				console.log(err);
				toast("Error fetching watch time", {
					type: "error",
				});
			});
	}, [user]);

	useEffect(() => {
		fetchWatchHistory();
		fetchWatchTimeLog();
	}, [fetchWatchHistory, fetchWatchTimeLog]);

	const watchTimeString = useMemo(() => {
		const [hh, mm, ss] = new Date(
			watchTimeLog
				?.reduce((acc, curr) => acc + curr.duration, 0)
				.toFixed(2) * 1000
		)
			.toISOString()
			.slice(11, 19)
			.split(":");
		return (
			<div className="grid grid-cols-3">
				<p className="flex flex-col gap-2 items-center">
					<span className="text-5xl font-mono">{hh}</span>
					<span>Hours</span>
				</p>
				<p className="flex flex-col gap-2 items-center">
					<span className="text-5xl font-mono">{mm}</span>
					<span>Minutes</span>
				</p>
				<p className="flex flex-col gap-2 items-center">
					<span className="text-5xl font-mono">{ss}</span>
					<span>Seconds</span>
				</p>
			</div>
		);
	}, [watchTimeLog]);

	return (
		<StudentPageWrapper heading="Watch History">
			<Button
				onClick={() => {
					fetchWatchHistory();
					fetchWatchTimeLog();
				}}>
				Refresh
			</Button>
			<div className="border p-4 bg-slate-800 text-ybrown-100 max-w-xl mx-auto rounded-xl text-center">
				<div className="pb-4">
					<h3 className="text-4xl">Watch Time</h3>
					<small>All Time</small>
				</div>
				{watchTimeString}
			</div>
			<div>
				<div className="shadow-lg hover:shadow-inner rounded-2xl hover:bg-slate-800 hover:text-ybrown-100 transition-all duration-300  p-4 my-10">
					<p className="text-2xl font-bold pb-4">Note</p>
					<p className="text-xl">
						This fancy card is to say, that this will be formatted
						soon!
					</p>
				</div>
				{watchHistory?.map((wh) => (
					<p key={wh._id}>{JSON.stringify(wh)}</p>
				))}
			</div>
		</StudentPageWrapper>
	);
}
