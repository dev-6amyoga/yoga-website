import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "shaka-player/dist/controls.css";
import dashjs from "dashjs";
import { forwardRef } from "react";
import { useImperativeHandle } from "react";
import {
  SEEK_TYPE_MARKER,
  SEEK_TYPE_MOVE,
  SEEK_TYPE_SEEK,
} from "../../enums/seek_types";
import {
  ShakaPlayerFullscreen,
  ShakaPlayerGoNext,
  ShakaPlayerGoPrev,
  ShakaPlayerGoSeekBackward,
  ShakaPlayerGoSeekForward,
  ShakaPlayerNextMarker,
  ShakaPlayerPrevMarker,
  ShakaPlayerToggleMode,
  shakaStreamConfig,
  shakaUIConfig,
} from "../../lib/shaka-controls";
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
import { isMobileTablet } from "../../utils/isMobileOrTablet";
import ShakaPlayer from "./ShakaPlayer";

// import shakaL from "shaka-player/dist/shaka-player.compiled.debug";
import shaka from "shaka-player/dist/shaka-player.ui";

// import shakaLog from "shaka-player/dist/shaka-player"
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_STUDENT_MODE } from "../../enums/video_view_modes";

// shakaL.log.setLogLevel(shaka.log.Level.V1);

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

  useEffect(() => {
    return () => {
      if (playerRef.current.player) {
        console.log("Unloading video");
        playerRef.current.player.unload();
      }
    };
  }, []);

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

  const handlePrevVideo = useCallback(() => {
    popFromArchive(-1);
  }, [popFromArchive]);

  const handleSeekFoward = useCallback(() => {
    addToSeekQueue({ t: 5, type: "seek" });
  }, [addToSeekQueue]);

  const handleSeekBackward = useCallback(() => {
    addToSeekQueue({ t: -5, type: "seek" });
  }, [addToSeekQueue]);

  const playerOnError = useCallback(
    (e) => {
      //console.log("[StreamStackItem:error] Error playing video", e);
      setVideoState(STATE_VIDEO_ERROR);
      // alert(JSON.stringify({ err: e }));
    },
    [setVideoState]
  );

  const tryToPlay = useCallback(() => {
    // toast(`Try to play called : ${isActiveRef.current}`, { type: "info" });
    if (!isActiveRef.current) return;

    console.log("Try to play called", video.idx, Date.now());
    playerRef.current.videoElement
      .play()
      .then((res) => {
        console.log("Autoplay initialized", video.idx);
        if (volume === 0 && !autoplayInitialized) {
          console.log("Setting volume to 0.5");
          playerRef.current.videoElement.muted = false;
          playerRef.current.videoElement.volume = 1;
          setAutoplayInitialized(true);
        } else {
          console.log("Setting volume to ", volume);
          playerRef.current.videoElement.muted = false;
          // playerRef.current.videoElement.volume = volume;
        }
      })
      .catch((err) => {
        console.error("Error autoplay : ", err, video.idx);
        // toast("Error playing video", { type: "error" });
        if (
          playerRef.current.videoElement !== null &&
          playerRef.current.videoElement !== undefined
        ) {
          console.log("Trying to play using mute", video.idx);
          playerRef.current.videoElement.muted = true;
          playerRef.current.videoElement
            .play()
            .then((res) => {
              console.log("Autoplay initialized after muting", video.idx);
              playerRef.current.videoElement.muted = false;
              if (volume === 0 && !autoplayInitialized) {
                console.log("Setting volume to 1");
                playerRef.current.videoElement.muted = false;
                playerRef.current.videoElement.volume = 1;
                setAutoplayInitialized(true);
              } else {
                console.log("Setting volume to ", volume);
                playerRef.current.videoElement.muted = false;
                // playerRef.current.videoElement.volume = volume;
              }
            })
            .catch((err) => {
              console.error("Error autoplay (with mute)", err, video.idx);
            });
        }
      });
  }, [autoplayInitialized, setAutoplayInitialized, video]);

  // pause and reset the video when its not active
  useEffect(() => {
    const pr = playerRef.current.videoElement;
    if (!isActive && pr && pr.currentTime > 0) {
      //console.log("PAUSE AND RESET ----------------------------->", video.idx);
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
        playerRef.current.videoElement.currentTime = 0.0;
        setCommitSeekTime(0.0);
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
        playerRef.current.videoElement.pause();
      } else if (videoState === STATE_VIDEO_PLAY) {
        console.log("useEffect : changing to play", video.idx);
        tryToPlay();
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

  // setup the player
  // useEffect(
  // 	() => {
  // 		console.log("Setting up player", video.idx, playerRefSet);
  // 		if (!playerRefSet?.done) return;

  // 		if (video === undefined || video === null) return;

  // 		if (videoUrl === undefined || videoUrl === null || videoUrl === "")
  // 			return;

  // 		setPlayerLoaded(true);
  // 	},
  // 	[
  // 		playerRefSet,
  // 		video,
  // 		videoUrl,
  // 		// handleNextVideo,
  // 		// handlePrevVideo,
  // 		// handleSeekFoward,
  // 		// handleSeekBackward,
  // 		// setVideoState,
  // 		// playerOnError,
  // 		// handleEnd,
  // 		// handleLoading,
  // 		// setVolume,
  // 		// tryToPlay,
  // 	]
  // );

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
    }, 250);

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
      const state = useVideoStore.getState();
      console.log("Can play through...", state.videoState);
      tryToPlay();
    },
    [tryToPlay]
  );

  // set the volume
  const handleVideoVolumeChange = useCallback(() => {
    if (playerRef.current !== null && playerRef.current.videoElement) {
      setVolume(playerRef.current.videoElement.volume || 0);
    }
  }, [setVolume]);

  const playerInit = useCallback(
    (ref) => {
      console.log("player init called", ref);
      //   if (ref != null) {
      //     playerRef.current = ref;
      //     const check = isMobileTablet();
      //     const isMobile = { done: true, check: check };
      //     console.log("Checking for isMobile", isMobile);

      //     if (playerRef.current.ui) {
      //       console.log("Setting up UI");
      //       shaka.ui.Controls.registerElement(
      //         "next",
      //         new ShakaPlayerGoNext.Factory(handleNextVideo)
      //       );
      //       shaka.ui.Controls.registerElement(
      //         "prev",
      //         new ShakaPlayerGoPrev.Factory(handlePrevVideo)
      //       );
      //       shaka.ui.Controls.registerElement(
      //         "seek_forward",
      //         new ShakaPlayerGoSeekForward.Factory(handleSeekFoward)
      //       );
      //       shaka.ui.Controls.registerElement(
      //         "seek_backward",
      //         new ShakaPlayerGoSeekBackward.Factory(handleSeekBackward)
      //       );
      //       shaka.ui.Controls.registerElement(
      //         "toggle_mode",
      //         new ShakaPlayerToggleMode.Factory()
      //       );
      //       shaka.ui.Controls.registerElement(
      //         "prev_marker",
      //         new ShakaPlayerPrevMarker.Factory()
      //       );
      //       shaka.ui.Controls.registerElement(
      //         "next_marker",
      //         new ShakaPlayerNextMarker.Factory()
      //       );
      //       shaka.ui.Controls.registerElement(
      //         "custom_fullscreen",
      //         new ShakaPlayerFullscreen.Factory(handleFullscreen)
      //       );

      //       playerRef.current.ui.configure(shakaUIConfig);
      //     }

      //     if (playerRef.current.videoElement) {
      //       console.log("Setting up videoElement events");
      //       playerRef.current.videoElement.addEventListener(
      //         "seeking",
      //         handleVideoSeeking
      //       );
      //       playerRef.current.videoElement.addEventListener(
      //         "seeked",
      //         handleVideoSeeked
      //       );

      //       playerRef.current.videoElement.addEventListener(
      //         "volumechange",
      //         handleVideoVolumeChange
      //       );

      //       playerRef.current.videoElement.addEventListener(
      //         "canplaythrough",
      //         handleVideoCanPlayThrough
      //       );

      //       playerRef.current.videoElement.addEventListener("ended", handleEnd);
      //     }

      //     if (playerRef.current.player) {
      //       console.log("Setting up player events");
      //       playerRef.current.player.addEventListener(
      //         "loading",
      //         handlePlayerLoading
      //       );

      //       playerRef.current.player.addEventListener(
      //         "loaded",
      //         handlePlayerLoaded
      //       );

      //       playerRef.current.player.addEventListener("statechange", (e) => {
      //         console.log(
      //           "State Change",
      //           e.newstate,
      //           isActiveRef.current === null ? "null" : isActiveRef.current
      //         );
      //         if (isActiveRef.current) {
      //           switch (e.newstate) {
      //             case "buffering":
      //               handleLoading(true, isActiveRef.current);
      //               break;

      //             case "playing":
      //               setVideoState(STATE_VIDEO_PLAY);
      //               break;

      //             case "paused":
      //               break;

      //             default:
      //               break;
      //           }
      //         }
      //       });

      //       playerRef.current.player.configure(
      //         "manifest.dash.ignoreMinBufferTime",
      //         true
      //       );

      //       // stream settings
      //       playerRef.current.player.configure(shakaStreamConfig);

      //       //console.log("Fetching DRM Info");
      //       //fetch only if it is not a transition video
      //       if (
      //         !isNaN(video?.video?.id) &&
      //         typeof video?.video?.id === "number"
      //       ) {
      //         //   if (!isNaN(video.video.id) && typeof video.video.id !== "number") {
      //         if (isMobile.check) {
      //           Fetch({
      //             url: "/playback/get-widevine-token",
      //             method: "POST",
      //             token: false,
      //           })
      //             .then((res) => {
      //               const data = res.data;
      //               // console.log(data);

      //               if (data && data.licenseAcquisitionUrl) {
      //                 // Mobile
      //                 playerRef.current.player.configure({
      //                   drm: {
      //                     servers: {
      //                       "com.widevine.alpha": data.licenseAcquisitionUrl,
      //                     },
      //                   },
      //                 });

      //                 //console.log("Trying to load video");
      //                 playerRef.current.player
      //                   .load(videoUrl)
      //                   .then((res) => {
      //                     //console.log("Video Loaded");
      //                     setMetadataLoaded(true);
      //                   })
      //                   .catch((err) => {
      //                     playerOnError(err);
      //                   });
      //               }
      //             })
      //             .catch((err) => {
      //               console.log("Error fetching DRM info :", err);
      //             });
      //         } else {
      //           Fetch({
      //             url: "/playback/get-playready-token",
      //             method: "POST",
      //             token: false,
      //           })
      //             .then((res) => {
      //               const data = res.data;
      //               if (data && data.licenseAcquisitionUrl && data.token) {
      //                 // Non Mobile
      //                 playerRef.current.player.configure({
      //                   drm: {
      //                     servers: {
      //                       "com.microsoft.playready":
      //                         data.licenseAcquisitionUrl +
      //                         "?ExpressPlayToken=" +
      //                         data.token,
      //                     },
      //                   },
      //                 });

      //                 playerRef.current.player
      //                   .load(videoUrl)
      //                   .then((res) => {
      //                     setMetadataLoaded(true);
      //                   })
      //                   .catch((err) => {
      //                     playerOnError(err);
      //                   });
      //               }
      //             })
      //             .catch((err) => {
      //               console.log("Error fetching DRM info :", err);
      //             });
      //         }
      //       } else {
      //         //console.log("no drm");
      //         playerRef.current.player
      //           .load(videoUrl)
      //           .then(() => {
      //             //console.log("Video Loaded");
      //             setMetadataLoaded(true);
      //           })
      //           .catch(playerOnError);
      //       }
      //     }
      //     setPlayerLoaded(true);
      //   }
    },
    [
      video,
      videoUrl,
      handleNextVideo,
      handlePrevVideo,
      handleSeekFoward,
      handleSeekBackward,
      playerOnError,
      handlePlayerLoaded,
      handlePlayerLoading,
      handleVideoSeeking,
      handleVideoSeeked,
      handleVideoVolumeChange,
      handleVideoCanPlayThrough,
    ]
  );

  const DashPlayer = forwardRef((_, ref) => {
    const videoRef = useRef(null);

    useEffect(() => {
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, null, true);
      return () => {
        player.reset();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      videoElement: videoRef.current,
    }));

    return <video ref={videoRef} className="custom-dash-video w-full h-full" />;
  });

  return (
    <div className={`relative h-full w-full ${isActive ? "block" : "block"}`}>
      {/* <ShakaPlayer ref={playerInit} className="custom-shaka w-full h-full" /> */}
      <DashPlayer ref={playerInit} className="custom-shaka w-full h-full" />

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
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default StreamStackItem;
