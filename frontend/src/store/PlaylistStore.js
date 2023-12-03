import { create } from "zustand";

const usePlaylistStore = create((set) => ({
  queue: [],
  archive: [],
  clearQueue: () =>
    set((_) => {
      return { queue: [] };
    }),
  clearArchive: () =>
    set((_) => {
      return { archive: [] };
    }),
  moveUpQueue: (index) =>
    set((state) => {
      if (index > 0) {
        const item = state.queue.splice(index, 1);
        const q = [...state.queue];
        q.splice(index - 1, 0, item[0]);
        return { queue: q };
      }
      console.log("Cannot move up");
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
      console.log("Cannot move down");
      return {};
    }),
  addToQueue: (items) =>
    set((state) => {
      return { queue: [...state.queue, ...items] };
    }),
  popFromQueue: (index) =>
    set((state) => {
      console.log("in func");
      if (state.queue.length > index) {
        console.log(state.queue, "in func");
        const q = [...state.queue];
        const removed = q.splice(index, 1);
        console.log(q, "in func after splice");
        return {
          queue: q,
          archive: [...state.archive, removed[0]],
        };
      }
      console.log("Cannot pop from empty queue");
      return {};
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
      console.log("Cannot pop from empty archive");
      return {};
    }),
}));

export default usePlaylistStore;
