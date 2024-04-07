import { v5 as uuidV5 } from "uuid";
import { create } from "zustand";

const usePlaylistStore = create((set) => ({
	// playlist metadata state

	// store duration, title, etc
	queueMetadata: {},
	setQueueMetadata: (videoId, metadata, value) =>
		set((state) => {
			const qm = state.queueMetadata;
			if (!qm[videoId]) {
				qm[videoId] = {};
			}
			qm[videoId][metadata] = value;

			return { queueMetadata: qm };
		}),

	queue: [],

	moveUpQueue: (index) =>
		set((state) => {
			if (index > 0) {
				const item = state.queue.splice(index, 1);
				const q = [...state.queue];
				q.splice(index - 1, 0, item[0]);
				return { queue: q };
			}
			return {};
		}),

	moveDownQueue: (index) =>
		set((state) => {
			if (state.queue.length > index + 1) {
				const item = state.queue.splice(index, 1);
				const q = [...state.queue];
				q.splice(index + 1, 0, item[0]);
				return { queue: q };
			}
			return {};
		}),

	addToQueue: (items) =>
		set((state) => {
			return {
				queue: [
					...state.queue,
					...items.map((i, idx) => {
						const vi_id = i?._id || i?.id;
						// console.log('vi_id', vi_id)
						// console.log({ video: i });
						return {
							video: i,
							idx: state.queue.length + idx + 1,
							queue_id: uuidV5(
								vi_id + Math.floor(Math.random() * 100000),
								"ed46bc72-c770-4478-a8af-6183469acb64"
							),
						};
					}),
				],
			};
		}),

	popFromQueue: (index) =>
		set((state) => {
			if (state.queue.length > index) {
				const q = [...state.queue];
				const removed = q.splice(index, 1);
				return {
					queue: q,
					archive: [...state.archive, removed[0]],
				};
			}
			return {};
		}),

	clearQueue: () =>
		set((_) => {
			return { queue: [] };
		}),

	archive: [],
	clearArchive: () =>
		set((_) => {
			return { archive: [] };
		}),

	popFromArchive: (index) =>
		set((state) => {
			if (state.archive.length > index + 1) {
				let i = index;
				if (index === -1) {
					i = state.archive.length - 1;
				}
				const a = [...state.archive];
				const removed = a.splice(i, 1);

				return {
					queue: [removed[0], ...state.queue],
					archive: a,
				};
			}
			return {};
		}),
}));

export default usePlaylistStore;
