import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// info about the current time of the video
export const useShakaOfflineStore = create(
  subscribeWithSelector((set) => ({
    // set when network is offline
    offlineMode: false,
    setOfflineMode: (om) =>
      set(() => {
        return { offlineMode: om };
      }),

    // enabled : player loads for downloaded video, uses offline uri
    useDownloadedVideo: false,
    setUseDownloadedVideo: (udv) =>
      set(() => {
        return { useDownloadedVideo: udv };
      }),

    // stores the progress of the download
    downloadProgress: 0,
    setDownloadProgress: (dp) =>
      set(() => {
        console.log(
          "[useShakaOfflineStore:setDownloadProgress] progress set : ",
          dp
        );
        return { downloadProgress: dp };
      }),

    // stores the object with offline store
    shakaOfflineStore: null,
    setShakaOfflineStore: (shakaOfflineStore) =>
      set((state) => {
        if (shakaOfflineStore !== null && state.shakaOfflineStore === null) {
          console.log(
            "[VideoStore] setting shakaOfflineStore.",
            shakaOfflineStore
          );
        }

        return { shakaOfflineStore };
      }),

    drmConfig: null,
    setDrmConfig: (drmConfig) => set(() => ({ drmConfig })),
  }))
);

export default useShakaOfflineStore;
