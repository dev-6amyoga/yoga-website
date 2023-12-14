import usePlaylistStore from "../../store/PlaylistStore";
import data from "../../data/asanas.json";
import { useState, useEffect } from "react";
import { Button } from "@geist-ui/core";

function PlaylistItem({ playlist, add }) {
  return (
    <div className="px-2 py-2 rounded-xl border border-zinc-800">
      <div className="flex justify-between gap-8 items-center">
        <p>{playlist.playlist_name}</p>
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
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/playlists/getAllPlaylists"
        );
        const data = await response.json();
        setPlaylists(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const getAllAsanas = async (asana_ids) => {
    try {
      const response = await fetch(
        "http://localhost:4000/content/video/getAllAsanas"
      );
      const data = await response.json();
      return data.filter((asana) => asana_ids.includes(asana.id));
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  const handleAddToQueue = (asana_ids) => {
    // get all asana details from asana_ids
    getAllAsanas(asana_ids)
      .then((asanas) => {
        // clearQueue();
        addToQueue(asanas);
      })
      .catch((err) => console.log(err));
  };

  const queue = usePlaylistStore((state) => state.queue);
  const archive = usePlaylistStore((state) => state.archive);
  const addToQueue = usePlaylistStore((state) => state.addToQueue);
  const clearQueue = usePlaylistStore((state) => state.clearQueue);

  return (
    <div className="rounded-xl">
      <h3>Playlists</h3>
      <p className="pb-4 text-sm">
        Choose from a variety of playlists to practice.
      </p>
      <div className="flex flex-row gap-2">
        {playlists.map((playlist) => (
          <PlaylistItem
            key={playlist.playlist_name}
            type={
              queue
                ? queue.includes(playlist)
                  ? "success"
                  : "secondary"
                : "secondary"
            }
            add={() => handleAddToQueue(playlist.asana_ids)}
            playlist={playlist}
          />
        ))}
      </div>
    </div>
  );
}

export default Playlist;
