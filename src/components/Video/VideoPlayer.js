import useVideoStore from "../../store/VideoStore";
import YouTube from "react-youtube";
import React, { useEffect, useState } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import asanas from "../../data/asanas.json";

import { STATE_VIDEO_PLAY, STATE_VIDEO_PAUSED } from "../../store/VideoStore";

function VideoPlayer() {
  const queue = usePlaylistStore((state) => state.queue);
  
  let currentVideoId = useVideoStore((state) => state.currentVideoID);
  let popFromQueue = usePlaylistStore((state) => state.popFromQueue);

  let videoState = useVideoStore((state) => state.videoState);

  const [player, setPlayer] = useState(null);
  const [markers, setMarker] = useState(null);


  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0
    },
  };

  useEffect(() => {
    if(currentVideoId == null){
        setMarker(null)
    }
  }, [currentVideoId]);

  useEffect(() => {}, [queue]);

  useEffect(() => {
    //console.log({videoState})
    if (player != null) {
      if (videoState === STATE_VIDEO_PAUSED) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  }, [videoState]);

  useEffect(() => {
    //console.log({videoState})
    if (player) {
      console.log(player.getDuration());
    }
  }, [player]);

  const handleEnd = () => {
    popFromQueue(0);
  };

  const saveTarget = (e) => {
    // setting event target to gain control on player
    setPlayer(e.target);

    // get markers for current video
    setMarker(asanas[queue[0]].asana.markers);

    // set duration

    // start timer for duration

    // check marker every second
  };

  const iChanged = (s) => {
    console.log(s);
  };

  return (
    <div>
      <div className="border-2 border-r-500 bg-blue-300 grid place-items-center p-4">
        <p className="text-lg">
          {currentVideoId ? currentVideoId : "NO CURRENT VIDEO"}
        </p>
        {currentVideoId && (
          <YouTube
            videoId={currentVideoId}
            opts={videoOptions}
            onEnd={handleEnd}
            onReady={saveTarget}
            onStateChange={iChanged}
            onPlay={() => {}}
            onPause={() => {}}
          />
        )}
        <div className="flex gap-1 max-w-5xl mx-auto flex-wrap justify-center">
          {markers ? (
            Object.keys(markers).map((k) => {
              return (
                <p key={k} className="p-1 border">
                  {k} : {markers[k].step}
                </p>
              );
            })
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
export default VideoPlayer;
