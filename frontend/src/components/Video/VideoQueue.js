import usePlaylistStore from "../../store/PlaylistStore";
import data from "../../data/asanas.json";
import { useState } from "react";
import { IoRemoveCircleOutline } from "react-icons/io5";
import { LuMoveUp, LuMoveDown } from "react-icons/lu";
import { Button } from "@geist-ui/core";

function QueueItem({ asana, idx, pop, moveUp, moveDown }) {
  return (
    <div className="flex flex-row gap-2 items-center">
      <p>{idx + 1}</p>
      <div className="grid grid-cols-4 gap-4 px-2 py-3 bg-yblue-900 text-white rounded-xl">
        <p className="m-0 col-start-1 col-span-3">{asana.asana_name}</p>
        <div className="flex gap-2 col-start-4 col-span-1">
          <button className="w-6 h-6" onClick={() => moveUp(idx)}>
            <LuMoveUp className="w-full h-full" />
          </button>
          <button className="w-6 h-6" onClick={() => moveDown(idx)}>
            <LuMoveDown className="w-full h-full" />
          </button>
          <button className="w-6 h-6" onClick={() => pop(idx)}>
            <IoRemoveCircleOutline className="w-full h-full" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoQueue() {
  const queue = usePlaylistStore((state) => state.queue);
  const popFromQueue = usePlaylistStore((state) => state.popFromQueue);
  const moveUpQueue = usePlaylistStore((state) => state.moveUpQueue);
  const moveDownQueue = usePlaylistStore((state) => state.moveDownQueue);
  return (
    <div className="col-start-6 col-span-3 bg-yblue-50 rounded-xl">
      <h3 className="text-center pt-2">Queue</h3>
      <div className="flex flex-col gap-2">
        {queue.length === 0 ? (
          <p className="text-center">No videos in queue</p>
        ) : (
          <div className="p-2 flex flex-col gap-2">
            {queue.map((queue_item, idx) => {
              return (
                <QueueItem
                  key={queue_item + idx}
                  asana={queue_item}
                  pop={popFromQueue}
                  moveUp={moveUpQueue}
                  moveDown={moveDownQueue}
                  idx={idx}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
