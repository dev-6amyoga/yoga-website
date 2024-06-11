import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  SEEK_TYPE_MARKER,
  SEEK_TYPE_MOVE,
  SEEK_TYPE_SEEK,
} from "../../enums/seek_types";
import usePlaylistStore from "../../store/PlaylistStore";
import useUserStore from "../../store/UserStore";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
  STATE_VIDEO_PAUSED,
  STATE_VIDEO_PLAY,
} from "../../store/VideoStore";
import useWatchHistoryStore from "../../store/WatchHistoryStore";
import { Fetch } from "../../utils/Fetch";

import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_STUDENT_MODE } from "../../enums/video_view_modes";
import DashPlayer from "./DashPlayer";

function StreamStackItem({
  video,
  isActive,
  handleEnd,
  handleLoading,
  handlePlaybackError,
  setDuration,
  setVideoStateVisible,
  handleFullscreen,
}) {
  const playerRef = useRef(null);
  const user = useUserStore((state) => state.user);
  const commitTimeInterval = useRef(null);
  const flushTimeInterval = useRef(null);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [autoplayInitialized, setAutoplayInitialized] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);

  // parse the video url from video object
  const videoUrl = useMemo(() => {
    console.log("VIDEO URL", video);
    return (
      (video?.video?.asana_dash_url || video?.video?.transition_dash_url) ?? ""
    );
  }, [video]);

  const isActiveRef = useRef(isActive);

  // keep the isActiveRef updated
  useEffect(() => {
    isActiveRef.current = isActive;
    if (isActive) {
      console.log(
        "IS ACTIVE",
        video?.idx,
        playerRef.current.videoElement.currentTime
      );
    }
    console.log({
      isActive,
      videoidx: video?.idx,
      isActiveRef: isActiveRef.current,
    });
  }, [isActive, video]);

  const [
    // seek queue
    seekQueue,
    popFromSeekQueue,
    addToSeekQueue,
    // current video
    currentVideo,
    // video state
    videoState,
    setVideoState,
    // current time
    setCurrentTime,
    // volume
    volume,
    setVolume,
    // autoplay initialized
    // autoplayInitialized,
    // setAutoplayInitialized,
    // video event
    videoEvent,
    setVideoEvent,
    // markers
    currentMarkerIdx,
    setCurrentMarkerIdx,
    autoSetCurrentMarkerIdx,
    markers,
    // view mode
    viewMode,
    setViewMode,
    // pause reason
    pauseReason,
    setPauseReason,
    // commitSeekTime
    commitSeekTime,
    setCommitSeekTime,
    // devmode
    devMode,
    // fullScreen
    fullScreen,
  ] = useVideoStore((state) => [
    //
    state.seekQueue,
    state.popFromSeekQueue,
    state.addToSeekQueue,
    //
    state.currentVideo,
    //
    state.videoState,
    state.setVideoState,
    //
    state.setCurrentTime,
    //
    state.volume,
    state.setVolume,
    //
    // state.autoplayInitialized,
    // state.setAutoplayInitialized,
    //
    state.videoEvent,
    state.setVideoEvent,
    //
    state.currentMarkerIdx,
    state.setCurrentMarkerIdx,
    state.autoSetCurrentMarkerIdx,
    state.markers,
    //
    state.viewMode,
    state.setViewMode,
    //
    state.pauseReason,
    state.setPauseReason,
    //
    state.commitSeekTime,
    state.setCommitSeekTime,
    //
    state.devMode,
    //
    state.fullScreen,
  ]);

  const [popFromQueue, popFromArchive] = usePlaylistStore((state) => [
    state.popFromQueue,
    state.popFromArchive,
  ]);

  let [
    enableWatchHistory,
    setCommittedTs,
    addToCommittedTs,
    updateWatchTimeBuffer,
    watchTimeBuffer,
    appendToWatchTimeBuffer,
    setWatchTimeBuffer,
    flushWatchTimeBuffer,
  ] = useWatchHistoryStore((state) => [
    state.enableWatchHistory,
    state.setCommittedTs,
    state.addToCommittedTs,
    state.updateWatchTimeBuffer,
    state.watchTimeBuffer,
    state.appendToWatchTimeBuffer,
    state.setWatchTimeBuffer,
    state.flushWatchTimeBuffer,
  ]);

  const handleNextVideo = useCallback(() => {
    popFromQueue(0);
  }, [popFromQueue]);

  const playerOnError = useCallback(
    (e) => {
      //console.log("[StreamStackItem:error] Error playing video", e);
      setVideoState(STATE_VIDEO_ERROR);
      // alert(JSON.stringify({ err: e }));
    },
    [setVideoState]
  );

  const tryToPlay = useCallback(() => {
    console.log(`Try to play called : ${isActiveRef.current}`);
    if (!isActiveRef.current) return;

    console.log("Try to play called", video.idx, Date.now());
    playerRef.current.player.play();

    if (!autoplayInitialized) {
      setAutoplayInitialized(true);
    }
  }, [autoplayInitialized, setAutoplayInitialized, video]);

  // pause and reset the video when its not active
  useEffect(() => {
    const pr = playerRef.current.videoElement;
    if (!isActive && pr && pr.currentTime > 0) {
      console.log("PAUSE AND RESET ----------------------------->", video.idx);
      pr.muted = true;
      setVolume(0);
      pr.pause();
      // pr.currentTime = 0;
    }

    return () => {
      if (pr && !isActive) {
        // pr.currentTime = 0;
      }
      pr?.pause();
    };
  }, [isActive, video.queue_id, setVolume]);

  // if its active, set the duration
  useEffect(() => {
    if (isActive && metadataLoaded && playerLoaded) {
      console.log(
        "PLAYING ----------------------------->",
        video,
        video.video.id,
        playerRef?.current.videoElement
      );
      if (playerRef.current.videoElement.currentTime > 0.0) {
        // console.log("SEEKING TO 0", video.idx);
        // playerRef.current.videoElement.currentTime = 0.0;
        // setCommitSeekTime(0.0);
      }
    }
  }, [
    isActive,
    setDuration,
    metadataLoaded,
    video,
    playerLoaded,
    setCommitSeekTime,
  ]);

  // change play/pause based on video state
  useEffect(() => {
    console.log("VIDEO_STATE_CHANGE", {
      videoState,
      isActive,
      metadataLoaded,
      autoplayInitialized,
      idx: video.idx,
    });
    // console.trace();
    if (
      isActive &&
      metadataLoaded &&
      playerRef.current !== null &&
      playerRef.current !== undefined
    ) {
      setPauseReason(null);
      if (videoState === STATE_VIDEO_PAUSED) {
        console.log("useEffect : changing to pause", video.idx);
        if (isActiveRef.current) {
          playerRef.current.player.pause();
        }
      } else if (videoState === STATE_VIDEO_PLAY) {
        console.log("useEffect : changing to play", video.idx);
        if (isActiveRef.current) {
          playerRef.current.player.play();
        }
      }
    }
  }, [
    video,
    metadataLoaded,
    videoState,
    isActive,
    autoplayInitialized,
    setAutoplayInitialized,
    setPauseReason,
    setVolume,
    tryToPlay,
  ]);

  // pop from seek queue and update the time
  useEffect(() => {
    if (isActive && seekQueue.length > 0) {
      const seekEvent = seekQueue[0];
      console.log("SEEKING --->", seekEvent);
      // setVideoState(STATE_VIDEO_PLAY)
      // setPauseReason(null)
      if (seekEvent && playerRef.current) {
        switch (seekEvent.type) {
          case SEEK_TYPE_SEEK:
            let ct = playerRef.current.videoElement.currentTime + seekEvent.t;
            if (ct > playerRef.current.videoElement.duration) {
              handleEnd();
              popFromSeekQueue(0);
              return;
            }
            if (ct < 0) ct = 0;

            playerRef.current.videoElement.currentTime = ct;
            // console.log(
            //   "SEEKING ----------------------------->",
            //   playerRef.current.videoElement.currentTime
            // );
            setCommitSeekTime(ct);
            // autoSetCurrentMarkerIdx(playerRef.current?.currentTime)
            // popFromSeekQueue(0)
            break;
          case SEEK_TYPE_MOVE:
            let st = seekEvent.t < 0 ? 0 : seekEvent.t;
            if (st > playerRef.current.videoElement.duration) {
              handleEnd();
              popFromSeekQueue(0);
              return;
            }

            playerRef.current.videoElement.currentTime = st;
            // console.log(
            //   "SEEKING ----------------------------->",
            //   playerRef.current.videoElement.currentTime
            // );
            setCommitSeekTime(st);
            // autoSetCurrentMarkerIdx(playerRef.current?.currentTime)
            // popFromSeekQueue(0)
            break;
          case SEEK_TYPE_MARKER:
            if (seekEvent.t > playerRef.current.videoElement.duration) {
              handleEnd();
              popFromSeekQueue(0);
              return;
            }

            playerRef.current.videoElement.currentTime = seekEvent.t;
            // popFromSeekQueue(0)
            setCommitSeekTime(seekEvent.t);
            break;
          default:
            break;
        }
        addToCommittedTs(playerRef.current?.videoElement.currentTime);
      }
    }
  }, [
    isActive,
    seekQueue,
    popFromSeekQueue,
    addToCommittedTs,
    setVideoEvent,
    setCurrentMarkerIdx,
    autoSetCurrentMarkerIdx,
    setCommitSeekTime,
    setVideoState,
    setPauseReason,
    popFromQueue,
    handleEnd,
  ]);

  // poll to update the current time, every 20ms, clear the timeout on unmount
  useEffect(() => {
    const checkSeek = (ct) => {
      // check if seekQueue length is greater than 0,
      // check if the current time is === to the marker time
      // console.log("Checking seek", ct, commitSeekTime, seekQueue.length);
      if (seekQueue.length > 0 && commitSeekTime.toFixed(0) === ct.toFixed(0)) {
        if (isActive) handleLoading(false, isActive);
        autoSetCurrentMarkerIdx(commitSeekTime);
        return true;
      } else {
        return false;
      }
    };

    const checkPauseOrLoop = (ct) => {
      // console.log("checkPauseOrLoop : ", ct, viewMode);
      if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
        // console.log("STUDENT --------->");
        return false;
      } else {
        // console.log("TEACHER --------->");
        // either pause or loop
        let currentMarker = markers[currentMarkerIdx];

        if (currentMarkerIdx === markers.length - 1) {
          return false;
        } else if (ct > markers[currentMarkerIdx + 1]?.timestamp) {
          if (currentMarker.loop) {
            console.log("LOOPING CUZ OF MARKER");
            addToSeekQueue({
              type: SEEK_TYPE_MARKER,
              t: currentMarker.timestamp,
            });
            return true;
          } else {
            console.log("PAUSING CUZ OF MARKER");
            setVideoState(STATE_VIDEO_PAUSED);
            setPauseReason(VIDEO_PAUSE_MARKER);
            return true;
          }
        }
      }
    };

    const int = setInterval(() => {
      if (playerRef.current?.videoElement?.currentTime && isActive) {
        if (checkSeek(playerRef.current?.videoElement?.currentTime)) {
          popFromSeekQueue(0);
          setVideoState(STATE_VIDEO_PLAY);
          return;
        }

        // pause if currenttime is greater than the timestamp of next?
        if (
          videoState !== STATE_VIDEO_LOADING &&
          checkPauseOrLoop(playerRef.current?.videoElement?.currentTime)
        ) {
          return;
        }

        if (
          videoState !== STATE_VIDEO_LOADING ||
          videoState !== STATE_VIDEO_ERROR ||
          videoState !== STATE_VIDEO_PAUSED
        ) {
          autoSetCurrentMarkerIdx(playerRef.current?.videoElement?.currentTime);
        }
        setCurrentTime(playerRef.current?.videoElement?.currentTime);
        setVolume(playerRef.current?.videoElement?.volume);
      }
    }, 16.67);

    return () => {
      // console.log('CLEANING INTERVAL --------------------------------------->')
      clearInterval(int);
    };
  }, [
    currentVideo,
    isActive,
    setCurrentTime,
    videoState,
    popFromSeekQueue,
    autoSetCurrentMarkerIdx,
    seekQueue,
    setVideoEvent,
    setCurrentMarkerIdx,
    markers,
    viewMode,
    currentMarkerIdx,
    setVideoState,
    addToSeekQueue,
    commitSeekTime,
    setPauseReason,
    handleLoading,
    setVolume,
  ]);

  const flushWatchTimeBufferE = useCallback(
    (user_id) => {
      const watch_time_logs = [...watchTimeBuffer];

      // console.log({ watch_time_logs });
      if (watch_time_logs.length === 0) {
        return;
      }

      Fetch({
        url: "/watch-time/update",
        method: "POST",
        token: true,
        data: {
          user_id: user_id,
          watch_time_logs,
          institute_id: null,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            console.log("watch time buffer flushed");
          }
        })
        .catch((err) => {
          //console.log(err);
          // localStorage.setItem(
          // 	"6amyoga_watch_time_logs",
          // 	JSON.stringify(watch_time_logs)
          // );
          appendToWatchTimeBuffer(watch_time_logs);
        });

      setWatchTimeBuffer([]);
    },
    [appendToWatchTimeBuffer, watchTimeBuffer, setWatchTimeBuffer]
  );

  /* 
		when video changes
		- flush 
		- reset committedTs
		- clear previous interval to flush 
		- start interval timer to flush	watch duration buffer  [10s]
		- clear previous interval to commit time
		- start interval timer to commit time [5s]
	*/

  /*
	useEffect(() => {
		console.log("Watch time useEffect : ", enableWatchHistory);
		if (isActive && enableWatchHistory && user && video) {
			console.log("setting up stuff");
			// console.log('CURRENT VIDEO', video)
			// flushing
			flushWatchTimeBuffer(user?.user_id);

			// resetting committedTs
			setCommittedTs(0);

			// clearing previous interval to flush
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			// clearing previous commitTimeInterval
			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}

			// TODO : send to watch history
			Fetch({
				url: "/watch-history/create",
				method: "POST",
				// TODO : fix thiss
				data: {
					user_id: user?.user_id,
					asana_id: video?.video?.id,
					playlist_id: null,
				},
			})
				.then((res) => {
					console.log("watch history created", res.data);
				})
				.catch((err) => {
					console.log(err);
				});

			// starting interval timer to flush watch duration buffer
			flushTimeInterval.current = setInterval(() => {
				// flushWatchTimeBuffer(user?.user_id);
				flushWatchTimeBufferE(user?.user_id);
			}, 10000);

			// starting interval timer to commit time
			commitTimeInterval.current = setInterval(() => {
				// TODO : fix this
				updateWatchTimeBuffer({
					user_id: user?.user_id,
					asana_id: video?.video?.id,
					playlist_id: null,
					currentTime: playerRef.current.currentTime,
				});
				addToCommittedTs(playerRef.current?.currentTime);
			}, 5000);
		} else {
			if (flushTimeInterval.current) {
				clearInterval(flushTimeInterval.current);
			}

			if (commitTimeInterval.current) {
				clearInterval(commitTimeInterval.current);
			}
		}
	}, [
		isActive,
		enableWatchHistory,
		user,
		video,
		flushWatchTimeBufferE,
		updateWatchTimeBuffer,
		addToCommittedTs,
		setCommittedTs,
		flushWatchTimeBuffer,
	]);
	*/

  const handlePlayerLoading = useCallback(
    (e) => {
      handleLoading(true, isActiveRef.current);
    },
    [handleLoading]
  );

  const handlePlayerLoaded = useCallback(
    (e) => {
      handleLoading(false, isActiveRef.current);
    },
    [handleLoading]
  );

  // video events
  const handleVideoSeeking = useCallback(
    (e) => {
      console.log("Seeking...");
      handleLoading(true, isActiveRef.current);
    },
    [handleLoading]
  );

  const handleVideoSeeked = useCallback(
    (e) => {
      console.log("Seeked...");
      setVideoState(STATE_VIDEO_PLAY);
    },
    [setVideoState]
  );

  const handleVideoCanPlayThrough = useCallback(
    (e) => {
      setMetadataLoaded(true);
      const state = useVideoStore.getState();
      console.log("Can play through...", state.videoState);
      // tryToPlay();
      setVideoState(STATE_VIDEO_PLAY);
    },
    [setVideoState]
  );

  // set the volume
  const handleVideoVolumeChange = useCallback(() => {
    if (playerRef.current !== null && playerRef.current.videoElement) {
      setVolume(playerRef.current.videoElement.volume || 0);
    }
  }, [setVolume]);

  const handlePlay = useCallback(() => {
    if (isActive) {
      const state = useVideoStore.getState();
      if (state.videoState !== STATE_VIDEO_PLAY) {
        console.log("PLAYING ----------------------------->", video.idx);
        // const duration = playerRef.duration();
        // const currentTime = playerRef().time();
        // const inactiveSetTime = duration - currentTime - 5;
        // setVideoState(STATE_VIDEO_PLAY);
      }
    } else {
      playerRef.current.player.pause();
    }
  }, [video, isActive]);

  const handlePause = useCallback(() => {
    if (isActive) {
      const state = useVideoStore.getState();
      if (state.videoState !== STATE_VIDEO_PAUSED) {
        console.log("PAUSING ----------------------------->", video.idx);
        // setVideoState(STATE_VIDEO_PAUSED);
      }
    }
  }, [video, isActive]);

  const playerInit = useCallback((ref) => {
    console.log("player init called", ref);
    if (ref != null) {
      playerRef.current = ref;
      setPlayerLoaded(true);
    }
  }, []);

  return (
    <div className={`relative h-full w-full ${isActive ? "block" : "block"}`}>
      {/*  <div className={`absolute h-full w-full ${isActive ? "flex-1" : "w-60"}`}> */}
      <DashPlayer
        ref={playerInit}
        src={videoUrl}
        isAsanaVideo={
          !isNaN(video?.video?.id) && typeof video?.video?.id === "number"
        }
        isActive={isActive}
        onError={playerOnError}
        onCanPlayThrough={handleVideoCanPlayThrough}
        onVolumeChange={handleVideoVolumeChange}
        onEnded={handleEnd}
        onPlay={handlePlay}
        onPause={handlePause}
        onLoading={handlePlayerLoading}
        onLoaded={handlePlayerLoaded}
        onSeeking={handleVideoSeeking}
        onSeeked={handleVideoSeeked}
        setDuration={setDuration}
        className="dashjs-player w-full h-full"
      />
      {devMode ? (
        <div className="absolute bg-white left-4 top-4 p-2 text-sm flex flex-col">
          <p>
            isActive: {String(isActive)} || {String(isActiveRef.current)}
          </p>
          <p>Video IDX : {video?.idx}</p>
          <p>videoState: {videoState}</p>
          <p>pauseReason: {pauseReason}</p>
          <p>viewMode: {viewMode}</p>
          <p>currentMarkerIdx: {currentMarkerIdx}</p>
          <p>metadataLoaded: {String(metadataLoaded)}</p>
          <p>autoplayInitialized: {String(autoplayInitialized)}</p>
          <p>playerLoaded: {String(playerLoaded)}</p>
          <p>commitSeekTime: {commitSeekTime}</p>
          <p>volume: {volume}</p>
          <p>fullScreen: {String(fullScreen)}</p>
          <div>
            Buffer :{" "}
            {playerRef.current && playerRef.current.videoElement ? (
              <>
                {Array.from(
                  Array(playerRef.current.videoElement.buffered.length).keys()
                ).map((i) => {
                  return (
                    <span>
                      {playerRef.current.videoElement.buffered.start(i)} -{" "}
                      {playerRef.current.videoElement.buffered.end(i)}
                    </span>
                  );
                })}{" "}
                | video : {playerRef.current.player.getBufferLength("video")} |
                audio : {playerRef.current.player.getBufferLength("audio")}
              </>
            ) : (
              "nil"
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default StreamStackItem;
