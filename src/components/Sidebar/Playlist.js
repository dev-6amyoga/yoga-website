import usePlaylistStore from "../../store/PlaylistStore";
import data from "../../data/asanas.json";
import { useState } from "react";
import { Button } from "@geist-ui/core";

function PlaylistItem({ asana, add }) {
  return (
    <div className="px-2 py-2 rounded-xl border border-zinc-800">
      <div className="flex justify-between gap-8 items-center">
        <p>{asana.name}</p>
        <div className="flex gap-4 items-center scale-75">
          {/* <p>0</p> */}
          <Button auto type="outline" onClick={add}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}

function Playlist() {
  const allAsanas = [];
  const asanaMap = {};

  for (var key in data) {
    allAsanas.push(key);
    asanaMap[key] = data[key].asana;
  }

  const queue = usePlaylistStore((state) => state.queue);
  const archive = usePlaylistStore((state) => state.archive);
  const addToQueue = usePlaylistStore((state) => state.addToQueue);

  return (
    <div className="rounded-xl">
      <h3>Playlists</h3>
      <p className="pb-4 text-sm">
        Choose from a variety of playlists to practice.
      </p>
      <div className="flex flex-row gap-2">
        {allAsanas.map((x) => (
          <PlaylistItem
            key={asanaMap[x].name}
            type={
              queue
                ? queue.includes(x)
                  ? "success"
                  : "secondary"
                : "secondary"
            }
            add={() => {
              addToQueue(x);
            }}
            asana={asanaMap[x]}
          />
        ))}
      </div>
    </div>
  );
}

export default Playlist;
