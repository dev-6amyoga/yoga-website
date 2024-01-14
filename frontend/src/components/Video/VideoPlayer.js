import useVideoStore from "../../store/VideoStore";
import YouTube from "react-youtube";
import React, { useEffect, useState, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
// import asanas from "../../data/asanas.json";
import { Stream } from "@cloudflare/stream-react";

import { STATE_VIDEO_PLAY, STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import { toHaveAccessibleDescription } from "@testing-library/jest-dom/matchers";
import { hasGrantedAllScopesGoogle } from "@react-oauth/google";

function VideoPlayer() {
  const queue = usePlaylistStore((state) => state.queue);

  let currentVideoId = useVideoStore((state) => state.currentVideoID);
  let popFromQueue = usePlaylistStore((state) => state.popFromQueue);
  let videoState = useVideoStore((state) => state.videoState);

  // const [player, setPlayer] = useState(null);
  // const [markers, setMarker] = useState(null);
  const player = useRef(null);
  useEffect(() => {
    console.log(currentVideoId);
  }, [currentVideoId]);

  useEffect(() => {}, [queue]);
  useEffect(() => {
    if (player.current != null) {
      if (videoState === STATE_VIDEO_PAUSED) {
        player.current.pause();
      } else {
        player.current.play();
      }
    }
  }, [videoState]);

  useEffect(() => {
    if (player.current) {
      // console.log(player.current.getDuration());
      // console.log("Stream ref is not null!");
      player.current.play();
    }
  }, [player.current]);

  const handleEnd = () => {
    popFromQueue(0);
  };

  return (
    <div>
      <div className="bg-yblue-100 grid place-items-center aspect-video rounded-xl overflow-hidden border">
        {currentVideoId ? (
          <div className="w-full h-full border">
            <Stream
              autoplay
              streamRef={player}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              src={currentVideoId}
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
