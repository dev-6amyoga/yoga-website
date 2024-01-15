import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, { STATE_VIDEO_LOADING } from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";
import { Loading } from "@geist-ui/core";
import { useEffect } from "react";
import {
  FaBackward,
  FaForward,
  FaPause,
  FaPlay,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { STATE_VIDEO_PAUSED, STATE_VIDEO_PLAY } from "../../store/VideoStore";

export default function VideoControls() {
  const queue = usePlaylistStore((state) => state.queue);
  let popFromQueue = usePlaylistStore((state) => state.popFromQueue);
  let popFromArchive = usePlaylistStore((state) => state.popFromArchive);

  let playlistState = useVideoStore((state) => state.playlistState);
  let setPlaylistState = useVideoStore((state) => state.setPlaylistState);

  let currentVideo = useVideoStore((state) => state.currentVideo);
  let setCurrentVideo = useVideoStore((state) => state.setCurrentVideo);

  let videoState = useVideoStore((state) => state.videoState);
  let setVideoState = useVideoStore((state) => state.setVideoState);

  let addToSeekQueue = useVideoStore((state) => state.addToSeekQueue);

  useEffect(() => {
    if (queue && queue.length > 0 && playlistState) {
      console.log("setCurrentVideo : Setting current video");
      setCurrentVideo(queue[0]);
    } else {
      console.log("setCurrentVideo : No videos in queue");
      setCurrentVideo(null);
      setVideoState(STATE_VIDEO_PAUSED);
    }
  }, [queue, playlistState, setCurrentVideo, setVideoState]);

  const handlePlay = () => {
    /*
          -- if currentVideo is null then play (video starts)
          -- else if video is running, pause. if video not running(paused), play
        */
    if (currentVideo === null && queue.length > 0) {
      setPlaylistState(true);
      setCurrentVideo(queue[0]);
    } else if (currentVideo === null && queue.length === 0) {
      setPlaylistState(false);
      toast("Please add videos to queue!", { type: "warning" });
      return;
    } else {
    }
    setVideoState(STATE_VIDEO_PLAY);
  };

  const handlePause = () => {
    /*
        -- if playing pause it
      */
    setVideoState(STATE_VIDEO_PAUSED);
  };

  const handleNextVideo = () => {
    // remove from queue add to archive
    popFromQueue(0);
  };

  const handleSeekFoward = () => {
    console.log("adding +5 seek");
    addToSeekQueue(5);
  };

  const handleSeekBackward = () => {
    console.log("adding -5 seek");
    addToSeekQueue(-5);
  };

  return (
    <div>
      <div className="bg-yblue-900 flex gap-8 items-center justify-center text-white rounded-xl my-4 p-2">
        <button
          className="w-6 h-6"
          onClick={() => {
            popFromArchive(-1);
          }}
        >
          <FaStepBackward className="w-full h-full" />
        </button>

        <button onClick={handleSeekBackward}>
          <FaBackward />
        </button>

        <button
          className={`w-6 h-6 ${
            videoState === STATE_VIDEO_LOADING ? "opacity-30" : ""
          }`}
          onClick={() => {
            if (videoState === STATE_VIDEO_PLAY) {
              handlePause();
            } else if (videoState === STATE_VIDEO_PAUSED) {
              handlePlay();
            }
          }}
          disabled={videoState === STATE_VIDEO_LOADING}
        >
          {videoState === STATE_VIDEO_PLAY ? (
            <FaPause className="w-full h-full" />
          ) : videoState === STATE_VIDEO_PAUSED ? (
            <FaPlay className="w-full h-full" />
          ) : (
            <Loading color="#fff" />
          )}
        </button>

        <button onClick={handleSeekFoward}>
          <FaForward />
        </button>

        <button className="w-6 h-6" onClick={handleNextVideo}>
          <FaStepForward className="w-full h-full" />
        </button>
      </div>
    </div>
  );
}
