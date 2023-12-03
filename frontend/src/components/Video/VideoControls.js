import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";
// import asanas from "../../data/asanas.json";
import { STATE_VIDEO_PLAY, STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import { useEffect } from "react";
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from "react-icons/fa";
import parseYouTubeUrl from "../../utils/parseYouTubeUrl";

export default function VideoControls() {
  const queue = usePlaylistStore((state) => state.queue);
  let popFromQueue = usePlaylistStore((state) => state.popFromQueue);
  let popFromArchive = usePlaylistStore((state) => state.popFromArchive);

  let playlistState = useVideoStore((state) => state.playlistState);
  let setPlaylistState = useVideoStore((state) => state.setPlaylistState);
  let currentVideoID = useVideoStore((state) => state.currentVideoID);
  let setCurrentVideoID = useVideoStore((state) => state.setCurrentVideoID);
  let videoState = useVideoStore((state) => state.videoState);
  let setVideoState = useVideoStore((state) => state.setVideoState);

  useEffect(() => {
    if (queue && queue.length > 0 && playlistState) {
      setCurrentVideoID(
        queue[0].asana_videoID.length === 11
          ? queue[0].asana_videoID
          : parseYouTubeUrl(queue[0].asana_videoID).videoId
      );
    } else {
      setCurrentVideoID(null);
    }
  }, [queue]);

  const handlePlay = () => {
    /*
        -- if currentVideo is null then play (video starts)
        -- else if video is running, pause. if video not running(paused), play
        */

    if (currentVideoID === null && queue.length > 0) {
      // console.log("Starting to play the playlist")
      // console.log("Starting with video ID", asanas[queue[0]].asana.videoID)
      setPlaylistState(true);
      console.log(
        queue[0].asana_videoID,
        parseYouTubeUrl(queue[0].asana_videoID)
      );
      setCurrentVideoID(
        queue[0].asana_videoID.length === 11
          ? queue[0].asana_videoID
          : parseYouTubeUrl(queue[0].asana_videoID).videoId
      );
      // console.log("currentVideoID", currentVideoID);
    } else if (currentVideoID === null && queue.length === 0) {
      setPlaylistState(false);
      //console.log("empty queue??")
    } else {
      //console.log("in queue somewhere")
    }
    setVideoState(STATE_VIDEO_PLAY);
    // console.log("Handle Play")
  };

  const handlePause = () => {
    /*
        -- if playing pause it
        */

    setVideoState(STATE_VIDEO_PAUSED);
    //console.log("Handle Pause")
  };

  const handleNextVideo = () => {
    // remove from queue add to archive
    // console.log("first was : ", queue)
    popFromQueue(0);
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

        <button
          className="w-6 h-6"
          onClick={() => {
            if (videoState === STATE_VIDEO_PLAY) {
              handlePause();
            } else {
              handlePlay();
            }
          }}
        >
          {videoState === STATE_VIDEO_PLAY ? (
            <FaPause className="w-full h-full" />
          ) : (
            <FaPlay className="w-full h-full" />
          )}
        </button>

        <button className="w-6 h-6" onClick={handleNextVideo}>
          <FaStepForward className="w-full h-full" />
        </button>
      </div>
    </div>
  );
}
