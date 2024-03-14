import "./StackVideo.css";

import { useCallback, useEffect, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
  STATE_VIDEO_PLAY,
} from "../../store/VideoStore";

import { Button } from "@geist-ui/core";
import { useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { SEEK_TYPE_MOVE } from "../../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_TEACHING_MODE } from "../../enums/video_view_modes";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import StreamStackItem from "./StreamStackItem";

function VideoPlayer() {
  const playerVideo = useRef(null);

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
    // state.autoSetCurrentMarkerIdx,
    state?.markers?.length || 0,
  ]);

  const currentMarker = useVideoStore((state) => {
    if (
      state.currentMarkerIdx === null ||
      !state.markers ||
      state.markers.length === 0
    ) {
      return null;
    }
    return state.markers[state.currentMarkerIdx];
  });

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
      setVideoState(STATE_VIDEO_PAUSED);
    }
  }, [queue, playlistState, setCurrentVideo, setVideoState]);

  const handleEnd = useCallback(() => {
    console.log("Video ended ------------------>");
    // check if teaching mode, loopback to previous marker
    if (viewMode === VIDEO_VIEW_TEACHING_MODE) {
      if (currentMarker && currentMarker?.loop) {
        console.log("VIDEO END : TEACHING MODE: moving to ", currentMarker);
        addToSeekQueue({
          t: currentMarker?.timestamp || 0,
          type: SEEK_TYPE_MOVE,
        });
        return;
      }
      console.log("VIDEO END : TEACHING MODE: popping video, marker null");
      popFromQueue(0);
    } else {
      console.log("VIDEO END : STUDENT MODE: popping video");
      // if student mode, pop from queue
      popFromQueue(0);
    }
  }, [popFromQueue, viewMode, addToSeekQueue, currentMarker]);

  const handleSetPlay = useCallback(() => {
    console.log("SETTING VIDEO STATE TO PLAY ------------>");

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
  }, [
    setVideoState,
    videoState,
    pauseReason,
    currentMarkerIdx,
    markersLength,
    setCurrentMarkerIdx,
    setPauseReason,
  ]);

  const handleSetPause = useCallback(() => {
    console.log("SETTING VIDEO STATE TO PAUSE ------------>");
    setVideoState(STATE_VIDEO_PAUSED);
  }, [setVideoState]);

  const handleLoading = useCallback(
    (loading) => {
      if (loading) setVideoState(STATE_VIDEO_LOADING);
      else {
        handleSetPlay();
      }
    },
    [handleSetPlay, setVideoState]
  );

  const handlePlaybackError = useCallback(() => {
    console.log("Error playing video ------------------->");
    setVideoState(STATE_VIDEO_ERROR);
  }, [setVideoState]);

  const handleStartPlaylist = useCallback(() => {
    if (currentVideo === null && queue.length > 0) {
      setPlaylistState(true);
      setCurrentVideo(queue[0]);
    }
  }, [currentVideo, queue, setPlaylistState, setCurrentVideo]);

  const handleAlternatePlayPause = useCallback(() => {
    console.log("ALTERNATE PLAY PAUSE ------------>");
    if (videoState === STATE_VIDEO_PLAY) {
      handleSetPause();
    } else if (videoState === STATE_VIDEO_PAUSED) {
      handleSetPlay();
    }
  }, [videoState, handleSetPlay, handleSetPause]);

  const handleFullScreen = useFullScreenHandle();

  const toTimeString = useCallback((seconds) => {
    const s = seconds > 0 ? seconds : 0;

    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(
      Math.ceil(s) % 60
    ).padStart(2, "0")}`;
  }, []);

  return (
    <FullScreen handle={handleFullScreen}>
      <div className="hover:cursor-pointer">
        <div className="grid aspect-video place-items-center overflow-hidden rounded-xl bg-black ">
          {currentVideo ? (
            <>
              {videoState === STATE_VIDEO_ERROR ? (
                <div className="flex flex-col items-center justify-center gap-4 text-lg">
                  <p>Error : Video playback error</p>
                  <Button onClick={handleSetPlay}>Refresh</Button>
                </div>
              ) : (
                <div className="relative h-full w-full">
                  {queue.length > 0 ? (
                    <div className="">
                      {queue.slice(0, 2).map((queueItem) => {
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
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <></>
                  )}
                  {/* <div className="absolute bottom-0 z-20 h-40 w-full opacity-0 transition-opacity delay-1000 duration-300 ease-in-out hover:opacity-100 hover:delay-0">
                                        <div className="absolute bottom-0 w-full ">
                                            <VideoPlaybar
                                                duration={duration}
                                                draggableHandle={
                                                    draggableHandle
                                                }
                                                toTimeString={toTimeString}
                                                handleSetPause={handleSetPause}
                                                handleSetPlay={handleSetPlay}
                                                handleFullScreen={
                                                    handleFullScreen
                                                }
                                            />
                                        </div>
                                    </div> */}
                  {/* <div
										className={`pointer-events absolute bottom-0 left-0 right-0 top-0 z-10 h-full w-full bg-zinc-800 transition-all ${
											videoState ===
												STATE_VIDEO_LOADING ||
											videoStateVisible
												? "bg-opacity-40"
												: "bg-opacity-0"
										}`}
										onClick={() => {
											// handleAlternatePlayPause();
										}}>
										{videoState === STATE_VIDEO_LOADING ? (
											<Loading color="#fff" />
										) : videoStateVisible ? (
											<div className="flex h-full w-full items-center justify-center">
												<div className="h-8 w-8 text-white">
													{videoState ===
													STATE_VIDEO_PLAY ? (
														<FaPlay className="h-full w-full" />
													) : (
														<FaPause className="h-full w-full" />
													)}
												</div>
											</div>
										) : (
											<></>
										)}
									</div> */}
                </div>
              )}
            </>
          ) : queue.length > 0 ? (
            <div className="text-lg">
              <Button onClick={handleStartPlaylist}>Start</Button>
            </div>
          ) : (
            <div className="text-lg"> </div>
          )}
        </div>
      </div>
    </FullScreen>
  );
}
export default VideoPlayer;
