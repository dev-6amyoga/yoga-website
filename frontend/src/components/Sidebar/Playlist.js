import { Button, Divider } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";

function PlaylistItem({ playlist, add }) {
  return (
    <div className="px-2 py-2 rounded-xl border border-zinc-800">
      <div className="flex justify-between gap-8 items-center">
        <p>{playlist.playlist_name}</p>
        <div className="flex gap-4 items-center scale-75">
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
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );
  const [currentInstitute, setCurrentInstitute] = useState(null);
  useState(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);
  const user_id = user?.user_id;
  console.log(user_id, currentInstituteId);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/playlists/getAllPlaylists"
        );
        const data = await response.json();
        console.log(data);
        setPlaylists(data);
        setLoading(false);
        if (currentInstituteId != 1) {
          const newRecord = {
            user_id: user_id,
            institute_id: currentInstituteId,
          };
          try {
            const response = await fetch(
              "http://localhost:4000/teacher-playlist/get-playlists",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(newRecord),
              }
            );
            if (response.ok) {
              const data = await response.json();
              setUserPlaylists(data);
            } else {
              console.error("Failed to add playlist");
            }
          } catch (error) {
            console.error("Error during playlist addition:", error);
          }
        } else {
          try {
            const response1 = await fetch(
              `http://localhost:4000/user-playlists/getAllUserPlaylists/${user?.user_id}`
            );
            const data1 = await response1.json();
            setUserPlaylists(data1);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [user_id, currentInstituteId]);

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
    getAllAsanas(asana_ids)
      .then((asanas) => {
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
      <h4>My Playlists</h4>
      <p className="pb-4 text-sm">Choose from your playlists to practice.</p>
      <div className="flex flex-row gap-2">
        {userPlaylists.map((playlist) => (
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
      <Divider />
      <h4>6AM Yoga Playlists</h4>
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
