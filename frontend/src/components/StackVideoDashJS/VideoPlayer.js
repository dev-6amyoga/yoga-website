import "./StackVideo.css";

import { useCallback, useEffect, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
  STATE_VIDEO_PLAY,
} from "../../store/VideoStore";

import { Button, Loading } from "@geist-ui/core";
import { useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa6";
import { SEEK_TYPE_MOVE } from "../../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_TEACHING_MODE } from "../../enums/video_view_modes";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import StreamStackItem from "./StreamStackItem";
import VideoPlaybar from "./VideoPlaybar";

function VideoPlayer() {
  const playerVideo = useRef(null);
  const [fullScreen, setFullScreen] = useVideoStore((state) => [
    state.fullScreen,
    state.setFullScreen,
  ]);

  const [queue, popFromQueue] = usePlaylistStore((state) => [
    state.queue,
    state.popFromQueue,
    state.queueMetadata,
    state.setQueueMetadata,
  ]);

  const [
    currentVideo,
    setCurrentVideo,
    videoState,
    setVideoState,
    playlistState,
    setPlaylistState,
    viewMode,
    addToSeekQueue,
    pauseReason,
    setPauseReason,
    currentMarkerIdx,
    setCurrentMarkerIdx,
    // autoSetCurrentMarkerIdx,
    setCurrentTime,
    markersLength,
  ] = useVideoStore((state) => [
    state.currentVideo,
    state.setCurrentVideo,
    state.videoState,
    state.setVideoState,
    state.playlistState,
    state.setPlaylistState,
    state.viewMode,
    state.addToSeekQueue,
    state.pauseReason,
    state.setPauseReason,
    state.currentMarkerIdx,
    state.setCurrentMarkerIdx,
    state.setCurrentTime,
    // state.autoSetCurrentMarkerIdx,
    state?.markers?.length || 0,
  ]);

  // watch history store
  // let [addToCommittedTs] = useWatchHistoryStore((state) => [
  // 	state.addToCommittedTs,
  // ]);

  const [duration, setDuration] = useState(0);
  const [videoStateVisible, setVideoStateVisible] = useState(false);

  const draggableHandle = useRef(null);

  // set player video ref
  useEffect(() => {
    if (currentVideo) {
      console.log("SETTING PLAYER VIDEO CURRENT -> ", currentVideo);
      playerVideo.current = currentVideo;
    } else {
      playerVideo.current = null;
    }
  }, [currentVideo]);

  useEffect(() => {
    if (queue && queue.length > 0 && playlistState) {
      setCurrentVideo(queue[0]);
    } else {
      setCurrentVideo(null);
      setVideoState(STATE_VIDEO_LOADING);
      setPlaylistState(false);
    }
  }, [queue, playlistState, setCurrentVideo, setVideoState, setPlaylistState]);

  const handleReset = useCallback(() => {
    setCurrentMarkerIdx(null);
    setDuration(0);
    setPauseReason(null);
    // setVideoState(STATE_VIDEO_LOADING);
    setCurrentTime(0);
  }, [setCurrentMarkerIdx, setDuration, setPauseReason, setCurrentTime]);

  const handleEnd = useCallback(() => {
    // console.log("Video ended ------------------>");
    const state = useVideoStore.getState();

    let currentMarker = null;

    if (
      state.currentMarkerIdx === null ||
      !state.markers ||
      state.markers.length === 0
    ) {
      currentMarker = null;
    } else {
      currentMarker = state.markers[state.currentMarkerIdx];
    }

    // check if teaching mode, loopback to previous marker
    if (state.viewMode === VIDEO_VIEW_TEACHING_MODE) {
      if (currentMarker && currentMarker?.loop) {
        console.log("VIDEO END : TEACHING MODE: moving to ", currentMarker);
        addToSeekQueue({
          t: currentMarker?.timestamp || 0,
          type: SEEK_TYPE_MOVE,
        });
        return;
      }
      console.log("VIDEO END : TEACHING MODE: popping video, marker null");

      handleReset();
      popFromQueue(0);
    } else {
      console.log("VIDEO END : STUDENT MODE: popping video");
      // if student mode, pop from queue
      handleReset();
      popFromQueue(0);
    }
  }, [popFromQueue, addToSeekQueue, handleReset]);

  const handleSetPlay = useCallback(
    (isActive) => {
      console.log("SETTING VIDEO STATE TO PLAY ------------>");

      if (isActive) {
        let state = useVideoStore.getState();
        let videoState = state.videoState;
        let markersLength = state?.markers?.length || 0;
        let currentMarkerIdx = state.currentMarkerIdx;
        let pauseReason = state.pauseReason;

        if (videoState === STATE_VIDEO_PAUSED) {
          if (pauseReason === VIDEO_PAUSE_MARKER) {
            console.log("VIDEO PLAY : PAUSE REASON MARKER");
            // autoSetCurrentMarkerIdx()
            // set next marker
            setCurrentMarkerIdx((currentMarkerIdx + 1) % markersLength);
            setPauseReason(null);
          }
        }

        if (videoState !== STATE_VIDEO_PLAY) {
          setVideoState(STATE_VIDEO_PLAY);
        }
      }
    },
    [setVideoState, setCurrentMarkerIdx, setPauseReason]
  );

  const handleSetPause = useCallback(
    (isActive) => {
      console.log("SETTING VIDEO STATE TO PAUSE ------------>");
      if (isActive) {
        setVideoState(STATE_VIDEO_PAUSED);
      }
    },
    [setVideoState]
  );

  const handleLoading = useCallback(
    (loading, isActive) => {
      if (isActive) {
        if (loading) setVideoState(STATE_VIDEO_LOADING);
        else {
          handleSetPlay(isActive);
        }
      }
    },
    [handleSetPlay, setVideoState]
  );

  const handlePlaybackError = useCallback(() => {
    console.log("Error playing video ------------------->");
    if (useVideoStore.getState().isActive) {
      setVideoState(STATE_VIDEO_ERROR);
    }
  }, [setVideoState]);

  const handleStartPlaylist = useCallback(() => {
    if (currentVideo === null && queue.length > 0) {
      setPlaylistState(true);
    }
  }, [currentVideo, queue, setPlaylistState]);

  // const handleAlternatePlayPause = useCallback(() => {
  // 	if (videoState === STATE_VIDEO_PLAY) {
  // 		handleSetPause();
  // 	} else if (videoState === STATE_VIDEO_PAUSED) {
  // 		handleSetPlay();
  // 	}
  // }, [videoState, handleSetPlay, handleSetPause]);

  // const handleFullScreen = useFullScreenHandle();

  const toTimeString = useCallback((seconds) => {
    const s = seconds > 0 ? seconds : 0;

    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      Math.ceil(s) % 60
    ).padStart(2, "0")}`;
  }, []);

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    let timeout = null;
    if (timeout) {
      clearTimeout(timeout);
    }
    if (queue.length > 0) {
      console.log("VIDEOPLAYER.js : Setting first video");
      setVideos((prevVideos) => {
        if (queue.length > 0) {
          const firstVideo = queue[0];
          prevVideos.splice(0, 2, firstVideo);
          return prevVideos;
        } else {
          return prevVideos;
        }
      });
      timeout = setTimeout(() => {
        console.log("VIDEOPLAYER.js : Setting second video");
        setVideos((prevVideos) => {
          if (queue.length > 1) {
            const secondVideo = queue[1];
            prevVideos.splice(1, 1, secondVideo);
            return prevVideos;
          } else {
            return prevVideos;
          }
        });
      }, 2000);
    } else {
      setVideos([]);
    }
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [queue]);

  useEffect(() => {
    if (currentVideo) {
      console.log(currentVideo.queue_id);
    }
  }, [currentVideo, queue]);
  return (
    <div
      className={`hover:cursor-pointer bg-black w-full ${fullScreen ? "h-screen" : "rounded-xl overflow-hidden"}`}
    >
      <div className={`mx-auto aspect-video ${fullScreen ? "h-full" : ""}`}>
        {currentVideo ? (
          <>
            {videoState === STATE_VIDEO_ERROR ? (
              <div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full border border-red-500">
                <p>Error : Video playback error</p>
                <Button onClick={handleSetPlay}>Refresh</Button>
              </div>
            ) : (
              <div className="relative h-full w-full">
                {queue.length > 0 ? (
                  <div className="">
                    {videos.slice(0, 1).map((queueItem, idx) => {
                      return (
                        <StreamStackItem
                          key={queueItem.queue_id}
                          video={queueItem}
                          handleEnd={handleEnd}
                          handleLoading={handleLoading}
                          handlePlaybackError={handlePlaybackError}
                          setDuration={setDuration}
                          isActive={
                            currentVideo?.queue_id === queueItem?.queue_id
                          }
                          setVideoStateVisible={setVideoStateVisible}
                          handleFullScreen={() => {}}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <></>
                )}
                <div className="absolute bottom-0 z-20 h-40 w-full opacity-0 transition-opacity delay-1000 duration-300 ease-in-out hover:opacity-100 hover:delay-0">
                  <div className="absolute bottom-0 w-full ">
                    <VideoPlaybar
                      duration={duration}
                      draggableHandle={draggableHandle}
                      toTimeString={toTimeString}
                      handleSetPause={handleSetPause}
                      handleSetPlay={handleSetPlay}
                      handleFullScreen={() => {}}
                    />
                  </div>
                </div>
                <div
                  className={`pointer-events absolute bottom-0 left-0 right-0 top-0 z-10 h-full w-full bg-zinc-800 transition-all ${
                    videoState === STATE_VIDEO_LOADING || videoStateVisible
                      ? "bg-opacity-40"
                      : "bg-opacity-0"
                  }`}
                  onClick={() => {
                    // handleAlternatePlayPause();
                  }}
                >
                  {videoState === STATE_VIDEO_LOADING ? (
                    <Loading color="#fff" />
                  ) : videoStateVisible ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 text-white">
                        {videoState === STATE_VIDEO_PLAY ? (
                          <FaPlay className="h-full w-full" />
                        ) : (
                          <FaPause className="h-full w-full" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            )}
          </>
        ) : queue.length > 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full border border-red-500">
            <Button onClick={handleStartPlaylist}>Start</Button>
          </div>
        ) : (
          <div className="text-lg"> </div>
        )}
      </div>
    </div>
  );
}
export default VideoPlayer;
