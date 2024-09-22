import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export const useTimeStore = create(
	subscribeWithSelector((set) => ({
		currentTime: 0,
		setCurrentTime: (time) =>
			set(() => {
				return { currentTime: time };
			}),
	}))
);

export default useTimeStore;
