import React, { useEffect, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
  STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";
import { Stream } from "@cloudflare/stream-react";

import { Loading } from "@geist-ui/core";
import { useState } from "react";
import { toast } from "react-toastify";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";

function VideoPlayer() {
  const player = useRef(null);
  const queue = usePlaylistStore((state) => state.queue);
  let popFromQueue = usePlaylistStore((state) => state.popFromQueue);

  const seekQueue = useVideoStore((state) => state.seekQueue);
  let popFromSeekQueue = useVideoStore((state) => state.popFromSeekQueue);

  let currentVideo = useVideoStore((state) => state.currentVideo);
  let videoState = useVideoStore((state) => state.videoState);
  let setVideoState = useVideoStore((state) => state.setVideoState);

  const [playerVideoId, setPlayerVideoId] = useState(currentVideo);

  useEffect(() => {
    console.log(currentVideo?.idx, currentVideo?.video?.asana_videoID);
    if (currentVideo) {
      // console.log(currentVideo);
      setPlayerVideoId(currentVideo?.video?.asana_videoID);
      if (player.current) {
        player.current.currentTime = 0;
      }
    } else {
      setPlayerVideoId(null);
    }
  }, [currentVideo]);

  useEffect(() => {
    if (seekQueue.length > 0) {
      const seekTime = seekQueue[0];

      if (seekTime && player.current) {
        console.log(
          "Seeking ",
          seekTime,
          player.current.currentTime,
          player.current.currentTime + seekTime
        );
        player.current.currentTime =
          player.current.currentTime + Number(seekTime);
      }

      popFromSeekQueue(0);
    }
  }, [seekQueue, popFromSeekQueue]);

  useEffect(() => {
    if (player.current != null) {
      if (videoState === STATE_VIDEO_PAUSED) {
        player.current.pause();
      } else {
        /*
                Attempts to play the video. Returns a promise that will resolve 
                if playback begins successfully, and rejects if it fails. 
                The most common reason for this to fail is browser policies 
                which prevent unmuted playback that is not initiated by the user.
                */

        player.current
          .play()
          .then((res) => {})
          .catch((err) => {
            toast("Error playing video", { type: "error" });
          });
      }
    }
  }, [videoState]);

  useEffect(() => {
    if (player.current) {
      console.log("Stream ref initiated!");
    }
  }, []);

  const handleEnd = () => {
    popFromQueue(0);
  };

  const handleLoading = (loading) => {
    if (loading) setVideoState(STATE_VIDEO_LOADING);
    else setVideoState(STATE_VIDEO_PLAY);
  };

  const handlePlaybackError = () => {
    setVideoState(STATE_VIDEO_ERROR);
  };

  return (
    <div>
      <div className="bg-yblue-100 grid place-items-center aspect-video rounded-xl overflow-hidden border">
        {playerVideoId ? (
          <>
            {videoState === STATE_VIDEO_ERROR ? (
              <div className="text-lg">Error : Video playback error</div>
            ) : (
              <div className="relative w-full h-full">
                <Stream
                  autoplay
                  streamRef={player}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  src={playerVideoId}
                  startTime={0}
                  onEnded={handleEnd}
                  onLoadStart={() => handleLoading(true)}
                  onCanPlay={() => handleLoading(false)}
                  onSeeking={() => handleLoading(true)}
                  onSeeked={() => handleLoading(false)}
                  onError={handlePlaybackError}
                />
                {videoState === STATE_VIDEO_LOADING ? (
                  <div className="absolute w-full h-full bg-zinc-800 bg-opacity-40 top-0 left-0 right-0 bottom-0">
                    <Loading color="#fff" />
                  </div>
                ) : (
                  <></>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-lg">No video in queue</div>
        )}
      </div>
    </div>
  );
}
export default VideoPlayer;
