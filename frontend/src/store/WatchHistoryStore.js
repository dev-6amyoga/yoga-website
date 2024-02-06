import { create } from "zustand";
import { Fetch } from "../utils/Fetch";

const useWatchHistoryStore = create((set, get) => ({
	watchHistory: false,
	updateWatchHistory: (wh) =>
		set((state) => {
			return {
				watchHistory: [...state.watchHistory, wh],
			};
		}),

	committedTs: 0,
	setCommittedTs: (ts) => set({ committedTs: ts }),
	addToCommittedTs: (ts) => set((state) => ({ committedTs: ts })),

	/* 
   {
    user_id,
    asana_id,
    playlist_id,
    timedelta,
   }
  */
	watchTimeBuffer: [],
	updateWatchTimeBuffer: (wh) => {
		const timedelta = wh.currentTime - get().committedTs;
		// console.log({ timedelta });

		if (timedelta < 1) {
			return;
		}

		set((state) => {
			return {
				watchTimeBuffer: [
					...state.watchTimeBuffer,
					{
						user_id: wh?.user_id,
						asana_id: wh?.asana_id,
						playlist_id: wh?.playlist_id,
						timedelta: timedelta,
					},
				],
			};
		});
	},

	watchTimeArchive: [],
	updateWatchTimeArchive: (wds) => {
		set((state) => {
			return {
				watchTimeArchive: [...state.watchTimeArchive, ...wds],
			};
		});
	},

	flushWatchTimeBuffer: async (user_id) => {
		const watch_time_logs = get().watchTimeBuffer;

		// console.log({ watch_time_logs });
		if (watch_time_logs.length === 0) {
			return;
		}

		Fetch({
			url: "http://localhost:4000/watch-time/update",
			method: "POST",
			token: true,
			data: {
				user_id: user_id,
				watch_time_logs,
			},
		})
			.then((res) => {
				if (res.status === 200) {
					console.log("watch time buffer flushed");
				}
			})
			.catch((err) => {
				console.log(err);
				// localStorage.setItem(
				// 	"6amyoga_watch_time_logs",
				// 	JSON.stringify(watch_time_logs)
				// );
				set((state) => ({
					watchTimeBuffer: [
						...state.watchTimeBuffer,
						...watch_time_logs,
					],
				}));
			});

		set((state) => ({
			watchTimeBuffer: [],
			watchTimeArchive: [...state.watchTimeArchive, ...watch_time_logs],
		}));
	},

	flushLocalStorageWatchTimeBuffer: async (user_id) => {
		const watch_time_logs = JSON.parse(
			localStorage.getItem("6amyoga_watch_time_logs")
		);

		if (watch_time_logs && watch_time_logs.length > 0) {
			Fetch({
				url: "http://localhost:4000/user/watch-duration-history/update",
				method: "POST",
				token: true,
				data: {
					user_id: user_id,
					watch_time_logs,
				},
			})
				.then((res) => {
					if (res.status === 200) {
						localStorage.setItem("6amyoga_watch_time_logs", "[]");
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	},
}));

export default useWatchHistoryStore;
