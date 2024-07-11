import { Spacer } from "@geist-ui/core";
import { Button } from "@mui/material";
import { useState } from "react";
import PlaylistItem from "./PlaylistItem";

export default function PlaylistList({
  name,
  desc,
  playlists,
  handleAddToQueue,
  showDetails,
  show,
  query,
}) {
  const [showIndex, setShowIndex] = useState(5);

  const handleShowMore = () => {
    setShowIndex(() => Math.min(showIndex + 5, playlists.length));
  };

  const handleShowLess = () => {
    setShowIndex(() => Math.max(showIndex - 5, 5));
  };

  const searchFilter = (p) => {
    if (query === undefined || query === null || !query) {
      return true;
    }

    if (query === "") {
      return true;
    }

    const name = p?.playlist_name ?? p?.schedule_name;

    return name ? name.toLowerCase().includes(query) : false;
  };

  return (
    <>
      {show ? (
        <div>
          <Spacer h={2}></Spacer>
          <div className="flex flex-col md:flex-row justify-between items-start w-full">
            <div className="flex flex-col">
              <h4>{name}</h4>
              <p className="pb-4 text-sm">{desc}</p>
            </div>
          </div>

          <>
            {playlists && playlists.length > 0 ? (
              <>
                <div className="flex flex-col max-h-[60vh] overflow-y-auto gap-4 py-6">
                  {playlists
                    ?.slice(0, showIndex)
                    .filter(searchFilter)
                    .map((playlist, idx) => (
                      <PlaylistItem
                        key={
                          (playlist?.playlist_name ?? playlist?.schedule_name) +
                          idx
                        }
                        add={() => handleAddToQueue(playlist)}
                        deets={() => showDetails(playlist)}
                        playlist={playlist}
                        isFuture={false}
                      />
                    ))}
                </div>
                <div className="flex gap-2 py-4">
                  <Button
                    onClick={handleShowMore}
                    size="small"
                    disabled={showIndex >= playlists.length}
                  >
                    Show More
                  </Button>
                  <Button
                    onClick={handleShowLess}
                    size="small"
                    disabled={showIndex <= 5}
                  >
                    Show Less
                  </Button>
                </div>
              </>
            ) : (
              <p></p>
            )}
          </>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
