import React, { useEffect, useState } from "react";

import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";

export default function VideoInfo() {
  const queue = usePlaylistStore((state) => state.queue);
  let currentVideo = useVideoStore((state) => state.currentVideo);
  const [markers, setMarkers] = useState(null);

  useEffect(() => {
    if (currentVideo) {
      setMarkers(queue[0]?.video?.asana_markers);
    } else {
      setMarkers(null);
    }
  }, [queue, currentVideo]);

  return (
    <div className="">
      {currentVideo && queue.length > 0 ? (
        <div className="flex flex-col gap-4">
          <h3>{queue[0].asana_name}</h3>
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
          <p>{queue[0]?.video?.asana_desc}</p>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
