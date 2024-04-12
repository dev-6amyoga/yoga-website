import { createContext } from "solid-js";
import { produce } from "solid-js/store";
import { createWithSignal } from "solid-zustand";
import { createStore } from "zustand";
import { Fetch } from "../utils/Fetch";

const useWatchHistoryStore = createWithSignal((set, get) => ({
	enableWatchHistory: true,
	setEnableWatchHistory: (enable) => set({ enableWatchHistory: enable }),

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
	appendToWatchTimeBuffer: (watchTimeLogs) => {
		set((state) => {
			return {
				watchTimeBuffer: [...watchTimeLogs, ...state.watchTimeBuffer],
			};
		});
	},
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
			url: "/watch-time/update",
			method: "POST",
			token: true,
			data: {
				user_id: user_id,
				watch_time_logs,
				institute_id: null,
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
				url: "/user/watch-duration-history/update",
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

export const WatchHistoryContext = createContext([
	{
		enableWatchHistory: true,
		watchHistory: false,
		committedTs: 0,
		watchTimeBuffer: [],
		watchTimeArchive: [],
	},
	{},
]);

export const WatchHistoryProvider = (props) => {
	const [store, setStore] = createStore({});

	const userStore = [
		store,
		{
			setEnableWatchHistory: (enable) =>
				setStore(
					produce((state) => {
						state.enableWatchHistory = enable;
					})
				),

			updateWatchHistory: (wh) =>
				setStore(
					produce((state) => {
						state.watchHistory.push(wh);
					})
				),

			setCommittedTs: (ts) =>
				setStore(
					produce((state) => {
						state.committedTs = ts;
					})
				),

			addToCommittedTs: (ts) =>
				setStore(
					produce((state) => {
						state.committedTs = ts;
					})
				),

			appendToWatchTimeBuffer: (watchTimeLogs) => {
				setStore(
					produce((state) => {
						state.watchTimeBuffer = [
							...watchTimeLogs,
							...state.watchTimeBuffer,
						];
					})
				);
			},

			updateWatchTimeBuffer: (wh) =>
				setStore(
					produce((state) => {
						const timedelta = wh.currentTime - state.committedTs;
						// console.log({ timedelta });

						if (timedelta < 1) {
							return;
						} else {
							state.watchTimeBuffer.push({
								user_id: wh?.user_id,
								asana_id: wh?.asana_id,
								playlist_id: wh?.playlist_id,
								timedelta: timedelta,
							});
						}
					})
				),

			updateWatchTimeArchive: (wds) => {
				setStore(
					produce((state) => {
						state.watchTimeArchive = [
							...state.watchTimeArchive,
							...wds,
						];
					})
				);
			},

			flushWatchTimeBuffer: async (user_id) => {
				const watch_time_logs = state.watchTimeBuffer;

				// console.log({ watch_time_logs });
				if (watch_time_logs.length === 0) {
					return;
				}

				Fetch({
					url: "/watch-time/update",
					method: "POST",
					token: true,
					data: {
						user_id: user_id,
						watch_time_logs,
						institute_id: null,
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
					watchTimeArchive: [
						...state.watchTimeArchive,
						...watch_time_logs,
					],
				}));
			},

			flushLocalStorageWatchTimeBuffer: async (user_id) => {
				const watch_time_logs = JSON.parse(
					localStorage.getItem("6amyoga_watch_time_logs")
				);

				if (watch_time_logs && watch_time_logs.length > 0) {
					Fetch({
						url: "/user/watch-duration-history/update",
						method: "POST",
						token: true,
						data: {
							user_id: user_id,
							watch_time_logs,
						},
					})
						.then((res) => {
							if (res.status === 200) {
								localStorage.setItem(
									"6amyoga_watch_time_logs",
									"[]"
								);
							}
						})
						.catch((err) => {
							console.log(err);
						});
				}
			},
		},
	];
};

export default useWatchHistoryStore;
