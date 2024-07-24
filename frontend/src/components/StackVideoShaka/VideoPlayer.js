import "./StackVideo.css";

import { useCallback, useEffect, useRef } from "react";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
  STATE_VIDEO_PLAY,
} from "../../store/VideoStore";

import { Button } from "@mui/material";
import { useState } from "react";
import { SEEK_TYPE_MOVE } from "../../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_TEACHING_MODE } from "../../enums/video_view_modes";
import { STATE_VIDEO_PAUSED } from "../../store/VideoStore";
import StreamStackItem from "./StreamStackItem";

function VideoPlayer() {
  const playerVideo = useRef(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

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

    videoStarted,
    setVideoStarted,
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

    state.videoStarted,
    state.setVideoStarted,
  ]);

  // watch history store
  // let [addToCommittedTs] = useWatchHistoryStore((state) => [
  // 	state.addToCommittedTs,
  // ]);

  // const [duration, setDuration] = useState(0);
  const [videoStateVisible, setVideoStateVisible] = useState(false);

  const draggableHandle = useRef(null);

  // set player video ref
  useEffect(() => {
    setVideoStarted(false);

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
      setPlaylistState(false);
    }
  }, [queue, playlistState, setCurrentVideo, setVideoState, setPlaylistState]);

  const handleReset = useCallback(() => {
    setCurrentMarkerIdx(null);
    // setDuration(0);
    setPauseReason(null);
    // setVideoState(STATE_VIDEO_LOADING);
    setCurrentTime(0);
  }, [setCurrentMarkerIdx, setPauseReason, setCurrentTime]);

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
  }, [addToSeekQueue]);

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

  //   const handleStartPlaylist = useCallback(() => {
  //     if (currentVideo === null && queue.length > 0) {
  //       setPlaylistState(true);
  //     }
  //   }, [currentVideo, queue, setPlaylistState]);

  const handleStartPlaylist = useCallback(() => {
    if (currentVideo === null && queue.length > 0) {
      setShowDisclaimer(true);
    }
  }, [currentVideo, queue]);

  const scrollToPlaylists = useCallback(() => {
    document
      .getElementById("playlist-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleConfirmDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
    setPlaylistState(true);
  }, [setPlaylistState]);

  const handleRejectDisclaimer = useCallback(() => {
    setShowDisclaimer(false);
  }, []);

  return (
    <div
      className={`hover:cursor-pointer bg-black w-full ${fullScreen ? "h-screen" : "h-auto rounded-xl overflow-hidden"}`}
    >
      <div className={`mx-auto aspect-video ${fullScreen ? "h-full" : ""}`}>
        {currentVideo ? (
          <>
            {videoState === STATE_VIDEO_ERROR ? (
              <div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full border border-red-500">
                <p>Error : Video playback error</p>
                <Button onClick={handleSetPlay} variant="contained">
                  Refresh
                </Button>
              </div>
            ) : (
              <div className="relative h-full w-full">
                {queue.length > 0 ? (
                  <>
                    {queue.slice(0, 2).map((queueItem, idx) => {
                      return (
                        <StreamStackItem
                          key={queueItem.queue_id}
                          video={queueItem}
                          handleEnd={handleEnd}
                          handleLoading={handleLoading}
                          handlePlaybackError={handlePlaybackError}
                          isActive={
                            currentVideo?.queue_id === queueItem?.queue_id
                          }
                          setVideoStateVisible={setVideoStateVisible}
                          handleFullScreen={() => {}}
                        />
                      );
                    })}
                  </>
                ) : (
                  <></>
                )}
              </div>
            )}
          </>
        ) : queue.length > 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full">
            {showDisclaimer ? (
              <>
                <div className="m-3">
                  <p className="text-white">
                    Disclaimer: This video is not medical advice. Providing
                    accurate diagnosis through the website is not possible. So,
                    do not use this video to avoid going to your own healthcare
                    advisor or doctor.
                  </p>
                  <br />
                  <p className="text-white">
                    This video is only intended to show you the correct
                    techniques for practising yoga and should not be used for
                    self-diagnosis or self-treatment. At any time if you feel
                    difficulty while practising, stop immediately and consult
                    with your healthcare professional.
                  </p>
                </div>
                <div className="flex flex-row gap-3">
                  <Button onClick={handleConfirmDisclaimer} variant="contained">
                    Yes
                  </Button>
                  <Button onClick={handleRejectDisclaimer} variant="contained">
                    No
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={handleStartPlaylist} variant="contained">
                Start
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-lg w-full h-full">
            <p className="text-white">Add playlists to practice!</p>
            <Button onClick={scrollToPlaylists} variant="contained">
              View Playlists
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
export default VideoPlayer;
