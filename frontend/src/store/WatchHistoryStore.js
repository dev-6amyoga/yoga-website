import { create } from "zustand";
import { Fetch } from "../utils/Fetch";

const useWatchHistoryStore = create((set, get) => ({
  enableWatchHistory: true,

  watchHistoryExhausted: false,
  setWatchHistoryExhausted: (watchHistoryExhausted) =>
    set({ watchHistoryExhausted: watchHistoryExhausted }),

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

  addToCommittedTs: (ts) =>
    set((state) => {
      return { committedTs: ts };
    }),

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

  flushWatchTimeBuffer: async (user_id, playlist_id = null) => {
    const watch_time_logs = get().watchTimeBuffer;
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
        playlist_id,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          console.log("watch time buffer flushed");
        }
      })
      .catch((err) => {
        console.log(err, err?.response?.data?.message);
        if (err?.response?.data?.message === "Watch time quota exceeded") {
          //plan expired
          set({ watchHistoryExhausted: true });
        }

        localStorage.setItem(
          "6amyoga_watch_time_logs",
          JSON.stringify(watch_time_logs)
        );
        set((state) => ({
          watchTimeBuffer: [...state.watchTimeBuffer, ...watch_time_logs],
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

export default useWatchHistoryStore;
