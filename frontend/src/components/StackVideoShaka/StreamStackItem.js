import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import "shaka-player/dist/controls.css";
import {
  SEEK_TYPE_MARKER,
  SEEK_TYPE_MOVE,
  SEEK_TYPE_SEEK,
} from "../../enums/seek_types";
import { VIDEO_PAUSE_MARKER } from "../../enums/video_pause_reasons";
import { VIDEO_VIEW_STUDENT_MODE } from "../../enums/video_view_modes";
import {
  ShakaPlayerGoNext,
  ShakaPlayerGoPrev,
  ShakaPlayerGoSeekBackward,
  ShakaPlayerGoSeekForward,
  ShakaPlayerNextMarker,
  ShakaPlayerPrevMarker,
  ShakaPlayerToggleMode,
  handleNextMarker,
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

import shaka from "shaka-player/dist/shaka-player.ui";

function StreamStackItem({
  video,
  isActive,
  handleEnd,
  handleLoading,
  handlePlaybackError,
  setDuration,
  setVideoStateVisible,
}) {
  const playerRef = useRef(null);
  const user = useUserStore((state) => state.user);
  const commitTimeInterval = useRef(null);
  const flushTimeInterval = useRef(null);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [autoplayInitialized, setAutoplayInitialized] = useState(false);

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

  // if its active, set the duration
  useEffect(() => {
    if (isActive && metadataLoaded) {
      console.log(
        "PLAYING ----------------------------->",
        video,
        video.video.id,
        playerRef?.current.videoElement
      );
      setDuration(playerRef?.current?.videoElement?.duration || 0);
    }
  }, [isActive, setDuration, metadataLoaded, video.queue_id]);

  // pause and reset the video when its not active
  useEffect(() => {
    const pr = playerRef.current.videoElement;
    if (!isActive && pr && pr.currentTime > 0) {
      console.log("PAUSE AND RESET ----------------------------->", video.idx);
      pr.muted = true;
      setVolume(0);
      pr?.pause();
      // pr.currentTime = 0;
    }

    return () => {
      if (pr) {
        pr?.pause();
        // pr.currentTime = 0;
      }
    };
  }, [isActive, video.queue_id, setVolume]);

  // set the volume
  useEffect(() => {
    if (playerRef.current) {
      if (volume > 0) {
        playerRef.current.videoElement.muted = false;
      }
      playerRef.current.videoElement.volume = volume;
    }
  }, [volume]);

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
            console.log(
              "SEEKING ----------------------------->",
              playerRef.current.videoElement.currentTime
            );
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
            console.log(
              "SEEKING ----------------------------->",
              playerRef.current.videoElement.currentTime
            );
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

  // change play/pause based on video state
  useEffect(() => {
    console.log("change play/pause based on video state", {
      isActive,
      metadataLoaded,
      autoplayInitialized,
      idx: video.idx,
      videoState,
    });
    if (isActive && metadataLoaded) {
      setPauseReason(null);
      if (videoState === STATE_VIDEO_PAUSED) {
        console.log("Changing to pause", video.idx);
        playerRef.current?.videoElement?.pause();
      } else if (
        !autoplayInitialized &&
        playerRef.current !== null &&
        playerRef.current !== undefined
      ) {
        console.log("Trying to play", video.idx);
        playerRef.current.videoElement
          .play()
          .then((res) => {
            console.log("Autoplay initialized", video.idx);
            if (volume === 0 && !autoplayInitialized) {
              console.log("Setting volume to 0.5");
              setVolume(0.5);
              setAutoplayInitialized(true);
            }
          })
          .catch((err) => {
            console.error("Error autoplay : ", err, video.idx);
            // toast("Error playing video", { type: "error" });
            playerRef.current.videoElement.muted = true;
            playerRef.current.videoElement
              .play()
              .then((res) => {
                console.log("Autoplay initialized after muting", video.idx);
                playerRef.current.videoElement.muted = false;
                if (volume === 0 && !autoplayInitialized) {
                  setVolume(0.5);
                  setAutoplayInitialized(true);
                }
              })
              .catch((err) => {
                console.error("Error autoplay (with mute)", err, video.idx);
              });
          });
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
  ]);

  // poll to update the current time, every 20ms, clear the timeout on unmount
  useEffect(() => {
    const checkSeek = (ct) => {
      // check if seekQueue length is greater than 0,
      // check if seekqueue[0] is of type marker
      // check if the current time is === to the marker time
      // pop from seekQueue
      // console.log(
      //     'checkSeek :',
      //     commitSeekTime.toFixed(0) === ct.toFixed(0),
      //     ct,
      //     commitSeekTime,
      //     seekQueue.length
      // )
      // console.log("Checking seek", ct, commitSeekTime, seekQueue.length);
      if (seekQueue.length > 0 && commitSeekTime.toFixed(0) === ct.toFixed(0)) {
        if (isActive) handleLoading(false);
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
            // console.log('LOOPING ----------------------------->')
            addToSeekQueue({
              type: SEEK_TYPE_MARKER,
              t: currentMarker.timestamp,
            });
            return true;
          } else {
            setVideoState(STATE_VIDEO_PAUSED);
            setPauseReason(VIDEO_PAUSE_MARKER);
            return true;
          }
        }
      }
    };

    const int = setInterval(() => {
      if (playerRef.current?.videoElement?.currentTime && isActive) {
        console.log(videoState, viewMode);
        // check if the marker has been reached
        if (checkSeek(playerRef.current?.videoElement?.currentTime)) {
          // popping from queue
          // console.log(
          // 	"POPPING FROM QUEUE ----------------------------->"
          // );
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
        )
          autoSetCurrentMarkerIdx(playerRef.current?.videoElement?.currentTime);
        setCurrentTime(playerRef.current?.videoElement?.currentTime);
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
  ]);

  // clear timeouts before unmount
  useEffect(() => {
    return () => {
      // clearing previous interval to flush
      if (flushTimeInterval.current) {
        clearInterval(flushTimeInterval.current);
      }

      // clearing previous commitTimeInterval
      if (commitTimeInterval.current) {
        clearInterval(commitTimeInterval.current);
      }
    };
  }, [commitTimeInterval, flushTimeInterval]);

  const flushWatchTimeBufferE = useCallback((user_id) => {
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
        console.log(err);
        // localStorage.setItem(
        // 	"6amyoga_watch_time_logs",
        // 	JSON.stringify(watch_time_logs)
        // );
        appendToWatchTimeBuffer(watch_time_logs);
      });

    setWatchTimeBuffer([]);
  }, []);

  /* when video changes
					- flush 
					- reset committedTs
					- clear previous interval to flush 
					- start interval timer to flush	watch duration buffer  [10s]
					- clear previous interval to commit time
					- start interval timer to commit time [5s]
	
	useEffect(() => {
		if (isActive && enableWatchHistory) {
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
				flushWatchTimeBuffer(user?.user_id);
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
	}, [isActive, enableWatchHistory]);
	*/

  // when theres a pause or play, the state is shown for 300ms
  useEffect(() => {
    let t;

    if (
      (videoState === STATE_VIDEO_PLAY || videoState === STATE_VIDEO_PAUSED) &&
      playerRef?.current?.currentTime > 1
    ) {
      setVideoStateVisible(true);

      t = setTimeout(() => {
        setVideoStateVisible(false);
      }, 300);
    }

    return () => {
      if (t) {
        clearTimeout(t);
      }
    };
  }, [videoState, setVideoStateVisible]);

  const videoUrl = useMemo(() => {
    return (
      (video?.video?.asana_dash_url || video?.video?.transition_dash_url) ?? ""
    );
  }, [video]);

  const playerOnMetadataLoaded = useCallback(() => {
    setMetadataLoaded(true);
  }, []);

  const playerOnError = useCallback(
    (e) => {
      console.log("[StreamStackItem:error] Error playing video", e);
      setVideoState(STATE_VIDEO_ERROR);
      alert(JSON.stringify({ err: e }));
    },
    [setVideoState]
  );

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

  const handleVideoStateChange = useCallback(
    (e) => {
      console.log(e.newstate);
      if (e.newstate === "playing") {
        if (useVideoStore.getState().pauseReason === VIDEO_PAUSE_MARKER) {
          setPauseReason(null);
          handleNextMarker();
        }
        setVideoState(STATE_VIDEO_PLAY);
      } else if (e.newstate === "paused") {
        setVideoState(STATE_VIDEO_PAUSED);
      }
    },
    [setPauseReason, setVideoState]
  );

  const playerInit = useCallback(
    (ref) => {
      if (ref !== null) {
        const check = isMobileTablet();
        // console.log("IS MOBILE : ", check);
        const isMobile = { done: true, check: check };

        // toast("IS MOBILE : " + check);
        // console.log(ref);
        setVideoState(STATE_VIDEO_LOADING);
        playerRef.current = ref;
        console.log("VIDEO IS : ", video);
        if (ref.ui) {
          shaka.ui.Controls.registerElement(
            "next",
            new ShakaPlayerGoNext.Factory(handleNextVideo)
          );

          shaka.ui.Controls.registerElement(
            "prev",
            new ShakaPlayerGoPrev.Factory(handlePrevVideo)
          );

          shaka.ui.Controls.registerElement(
            "seek_forward",
            new ShakaPlayerGoSeekForward.Factory(handleSeekFoward)
          );

          shaka.ui.Controls.registerElement(
            "seek_backward",
            new ShakaPlayerGoSeekBackward.Factory(handleSeekBackward)
          );

          shaka.ui.Controls.registerElement(
            "toggle_mode",
            new ShakaPlayerToggleMode.Factory()
          );

          shaka.ui.Controls.registerElement(
            "prev_marker",
            new ShakaPlayerPrevMarker.Factory()
          );

          shaka.ui.Controls.registerElement(
            "next_marker",
            new ShakaPlayerNextMarker.Factory()
          );

          playerRef.current.ui.configure({
            enableTooltips: true,
            doubleClickForFullscreen: true,
            seekOnTaps: true,
            tapSeekDistance: 5,
            enableKeyboardPlaybackControls: true,
            enableFullscreenOnRotation: true,
            keyboardSeekDistance: 5,
            controlPanelElements: [
              "prev",
              "prev_marker",
              "seek_backward",
              "play_pause",
              "seek_forward",
              "next_marker",
              "next",
              "spacer",
              "mute",
              "volume",
              "time_and_duration",
              "toggle_mode",
              "fullscreen",
            ],
            seekBarColors: {
              base: "#FFFFFF",
              buffered: "#DDDDDD",
              played: "#FFBF00",
            },
            fastForwardRates: [2, 4, 8, 1],
            rewindRates: [-1, -2, -4, -8],
          });
        }

        if (ref.player) {
          // events
          playerRef.current.player.addEventListener("error", playerOnError);
          playerRef.current.player.addEventListener(
            "statechanged",
            handleVideoStateChange
          );

          playerRef.current.player.configure(
            "manifest.dash.ignoreMinBufferTime",
            true
          );

          // stream settings
          playerRef.current.player.configure({
            streaming: {
              maxDisabledTime: 0,
              inaccurateManifestTolerance: 0,
              lowLatencyMode: true,
              bufferingGoal: 16,
              bufferBehind: 8,
              ignoreTextStreamFailures: true,
              stallThreshold: 3,
              segmentPrefetchLimit: 3,
              retryParameters: {
                maxAttempts: 3,
                timeout: 30000,
                connectionTimeout: 30000,
                stallTimeout: 15000,
              },
            },
          });

          // get the playready license acquisition url
          console.log("Fetching DRM Info");
          //fetch only if it is not a transition video

          if (!isNaN(video.video.id) && typeof video.video.id === "number") {
            //   if (!isNaN(video.video.id) && typeof video.video.id !== "number") {
            if (isMobile.check) {
              Fetch({
                url: "/playback/get-widevine-token",
                method: "POST",
                token: false,
              })
                .then((res) => {
                  const data = res.data;
                  // console.log(data);

                  if (data && data.licenseAcquisitionUrl) {
                    console.log("DRM Info Received");
                    toast("DRM Info Received");

                    alert(JSON.stringify(data));

                    // Mobile
                    playerRef.current.player.configure({
                      drm: {
                        servers: {
                          "com.widevine.alpha": data.licenseAcquisitionUrl,
                        },
                      },
                    });

                    console.log("Trying to load video");
                    playerRef.current.player
                      .load(videoUrl)
                      .then((res) => {
                        console.log("Video Loaded");
                        setMetadataLoaded(true);
                      })
                      .catch((err) => {
                        playerOnError(err);
                      });
                  }
                })
                .catch((err) => {
                  console.log("Error fetching DRM info :", err);
                });
            } else {
              Fetch({
                url: "/playback/get-playready-token",
                method: "POST",
                token: false,
              })
                .then((res) => {
                  const data = res.data;
                  // console.log(data);

                  if (data && data.licenseAcquisitionUrl && data.token) {
                    console.log("DRM Info Received");

                    // Non Mobile
                    playerRef.current.player.configure({
                      drm: {
                        servers: {
                          "com.microsoft.playready":
                            data.licenseAcquisitionUrl +
                            "?ExpressPlayToken=" +
                            data.token,
                        },
                      },
                    });

                    console.log("Trying to load video");
                    playerRef.current.player
                      .load(videoUrl)
                      .then((res) => {
                        console.log("Video Loaded");
                        setMetadataLoaded(true);
                      })
                      .catch((err) => {
                        playerOnError(err);
                      });
                  }
                })
                .catch((err) => {
                  console.log("Error fetching DRM info :", err);
                });
            }
          } else {
            console.log("no drm");
            playerRef.current.player
              .load(videoUrl)
              .then(() => {
                console.log("Video Loaded");
                // setMetadataLoaded(true);
              })
              .catch(playerOnError);
          }
        }
      }
    },
    [
      video,
      videoUrl,
      handleNextVideo,
      handlePrevVideo,
      handleSeekFoward,
      handleSeekBackward,
      setVideoState,
      playerOnError,
    ]
  );

  return (
    <div className={`h-full w-full ${isActive ? "block" : "hidden"}`}>
      <ShakaPlayer
        ref={playerInit}
        width="100%"
        height="100%"
        className="custom-shaka"
      />
    </div>
  );
}

export default StreamStackItem;
