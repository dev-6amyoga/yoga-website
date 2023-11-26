import React, { useEffect, useState } from "react";
import asanas from "../../data/asanas.json";

import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";

export default function VideoInfo() {
  const queue = usePlaylistStore((state) => state.queue);
  let currentVideoId = useVideoStore((state) => state.currentVideoID);
  const [markers, setMarker] = useState(null);

  useEffect(() => {
    if (currentVideoId == null) {
      setMarker(null);
    } else {
      setMarker(asanas[queue[0]].asana.markers);
    }
  }, [currentVideoId]);

  return (
    <div className="">
      {currentVideoId ? (
        <div className="flex flex-col gap-4">
          <h3>{asanas[queue[0]].asana.name}</h3>
          <div className="border p-4 rounded-2xl">
            <h5 className="">Markers</h5>
            <div className="flex gap-1 flex-wrap mt-4">
              {markers ? (
                Object.keys(markers).map((k) => {
                  return (
                    <p
                      key={k}
                      className="px-2 py-1 border rounded-full m-0 text-sm"
                    >
                      {k} : {markers[k].step}
                    </p>
                  );
                })
              ) : (
                <></>
              )}
            </div>
          </div>

          <h5>Asana Description</h5>
          <p>{asanas[queue[0]].asana.desc}</p>
        </div>
      ) : (
        <>
          <h3>Pick a playlist to play </h3>
        </>
      )}
    </div>
  );
}
