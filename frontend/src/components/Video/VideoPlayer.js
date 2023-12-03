import useVideoStore from "../../store/VideoStore";
import YouTube from "react-youtube";
import React, { useEffect, useState } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
// import asanas from "../../data/asanas.json";

import { STATE_VIDEO_PLAY, STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import { toHaveAccessibleDescription } from "@testing-library/jest-dom/matchers";
import { hasGrantedAllScopesGoogle } from "@react-oauth/google";

function VideoPlayer() {
  const queue = usePlaylistStore((state) => state.queue);

  let currentVideoId = useVideoStore((state) => state.currentVideoID);
  let popFromQueue = usePlaylistStore((state) => state.popFromQueue);

  let videoState = useVideoStore((state) => state.videoState);

  const [player, setPlayer] = useState(null);
  // const [markers, setMarker] = useState(null);

  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
    },
  };

  useEffect(() => {}, [queue]);

  useEffect(() => {
    if (player != null) {
      if (videoState === STATE_VIDEO_PAUSED) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
    }
  }, [videoState]);

  useEffect(() => {
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
    // setMarker(asanas[queue[0]].asana.markers);

    // set duration

    // start timer for duration

    // check marker every second
  };

  const iChanged = (s) => {
    console.log(s);
  };

  return (
    <div>
      <div className="bg-yblue-100 grid place-items-center aspect-video rounded-xl overflow-hidden border">
        {currentVideoId ? (
          <div className="w-full h-full border">
            <YouTube
              className="w-full border h-full"
              iframeClassName="w-full h-full"
              videoId={currentVideoId}
              opts={videoOptions}
              onEnd={handleEnd}
              onReady={saveTarget}
              onStateChange={iChanged}
              onPlay={() => {}}
              onPause={() => {}}
            />
          </div>
        ) : (
          <p className="text-lg">NO VIDEO IN QUEUE</p>
        )}
      </div>
    </div>
  );
}
export default VideoPlayer;
