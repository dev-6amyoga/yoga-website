import dashjs from "dashjs";
import { createEffect, createSignal, on, onCleanup } from "solid-js";
import { VIDEO_EVENT_PLAY_INACTIVE } from "../../enums/video_event";
import { dashSettings } from "../../lib/dashjs-settings";
import { useVideoStoreContext } from "../../store/VideoStore";
import { Fetch } from "../../utils/Fetch";
import { isMobileTablet } from "../../utils/isMobileOrTablet";
import {
  STATE_VIDEO_LOADING,
  STATE_VIDEO_ERROR,
  STATE_VIDEO_PAUSED,
  STATE_VIDEO_PLAY,
} from "../../store/VideoStore";

// {
// 		src,
// 		isActive,
// 		isAsanaVideo,
// 		props.setDuration,
// 		props.onCanPlayThrough,
// 		props.onEnded,
// 		props.onPlay,
// 		props.onPause,
// 		props.onError,
// 		props.onVolumeChange,
// 		onLoading,
// 		onLoaded,
// 		props.onSeeking,
// 		props.onSeeked,
// 		className,
// 		...rest
// 	},
// 	ref

function DashPlayer(props) {
  const videoRef = { current: null };
  const [playerRef, setPlayerRef] = createSignal(null);
  const [playerRefSet, setPlayerRefSet] = createSignal(false);
  const [metadataLoaded, setMetadataLoaded] = createSignal(false);
  const [streamInitialized, setStreamInitialized] = createSignal(false);
  const [drmSet, setDrmSet] = createSignal(false);
  const [playInActive, setPlayInActive] = createSignal(false);
  let playInActiveTimer = null;

  console.log("dashplayer! >>>>");

  const [videoStore, { setPlayreadyKeyUrl, addVideoEvent, clearVideoEvents }] =
    useVideoStoreContext();

  createEffect(
    on([() => videoStore.videoEvents, () => props.isActive], () => {
      if (videoStore.videoEvents.length > 0 && !props.isActive) {
        const event = videoStore.videoEvents[0];
        if (event?.t === VIDEO_EVENT_PLAY_INACTIVE) {
          console.log("[DASH PLAYER] : [INACTIVE] play event received");
          setPlayInActive(true);
        }
        clearVideoEvents();
      }
    })
  );

  createEffect(
    on([() => props.src], () => {
      console.log("[DASH PLAYER] : setup", { src: props.src });
      let p = null;
      if (props.src) {
        p = dashjs.MediaPlayer().create();
        setPlayerRef(p);
        p.updateSettings(dashSettings);
        p.initialize(null, props.src, true, 0.000);
        // p.initialize(null, props.src, true, { autoplay: true, muted: true });
        p.attachView(videoRef.current);
        p.preload();
        p.play();
        setPlayerRefSet(true);
        console.log("[DASH PLAYER] : player created");
      }
      onCleanup(() => {
        console.log("[DASH PLAYER] Cleanup, player reset");
      });
    })
  );

  // createEffect(
  // 	on([playerRefSet, () => props.src, drmSet], () => {
  // 		if (playerRefSet() && drmSet() && props.src) {
  // 			console.log("[DASH PLAYER] : preloading");
  // 			playerRef().preload();
  // 			playerRef().play().catch((error) => {
  // 				console.error("Play failed");
  // 			});
  // 		}
  // 	})
  // );

  // createEffect(
  // 	on([playerRefSet, () => props.src, drmSet], () => {
  // 		if (playerRefSet() && drmSet() && props.src) {
  // 			console.log("[DASH PLAYER] : preloading");
  // 			playerRef().preload();
  // 			const playPromise = playerRef()
  // 				.play()
  // 				.catch((error) => {
  // 					console.error("Play failed:", error);
  // 				});
  // 			playPromise.then(() => {
  // 				playerRef().pause();
  // 			});
  // 		}
  // 	})
  // );

  createEffect(
    on(
      [
        playerRefSet,
        () => props.src,
        metadataLoaded,
        streamInitialized,
        () => props.isActive,
        playInActive,
      ],
      () => {
        if (
          playerRefSet() &&
          props.src &&
          metadataLoaded() &&
          streamInitialized() &&
          (props.isActive || playInActive())
        ) {
          console.log(
            "[DASH PLAYER] : play video effect event",
            props.src,
            props.isActive,
            playInActive()
          );
          // playerRef().play();
          videoRef.current
            .play()
            .then(() => {
              console.log(
                "[DASH PLAYER] : Video play event success from create hahahah"
              );
            })
            .catch((err) => {
              console.log("[DASH PLAYER] : Video play event failed", err);
            });

          if (!props.isActive) {
            const currentTime = playerRef().time();
            const duration = playerRef().duration();
            const remainingTime = duration - currentTime;
			const inactiveVideoDuration = remainingTime - 0.1;
			console.log(
				"[DASH PLAYER IS NOT ACTIVE] starting event timer for playing inactive : currentTime = ",
				currentTime,
				"duration",
				duration,
				"remainingTime",
				remainingTime,
				"inactiveVideoDuration",
				inactiveVideoDuration
			);
            console.log(
              "[DASH PLAYER] starting event timer for playing inactive @ ",
              inactiveVideoDuration,
              props.isActive,
              props.video.idx
            );
            playInActiveTimer = setTimeout(() => {
              console.log("sending video event!");
              addVideoEvent({ t: VIDEO_EVENT_PLAY_INACTIVE });
            }, inactiveVideoDuration * 1000);
          }
        }
      }
    )
  );

  // DRM Info
  createEffect(
    on([playerRefSet, () => props.src, () => props.isAsanaVideo], () => {
      if (playerRefSet && props.src && videoRef.current) {
        console.log("[DASH PLAYER] : setting DRM Info");
        const check = isMobileTablet();
        const isMobile = { done: true, check: check };
        console.log("Checking for isMobile", isMobile);
        // const store = useVideoStore.getState();
        var playreadyKeyUrl;
        playreadyKeyUrl = undefined;
        // const setPlayreadyKeyUrl = videoStore.setPlayreadyKeyUrl;
        //console.log("Fetching DRM Info");
        console.log("[DASH PLAYER] : isAsanaVideo", props.isAsanaVideo);

        if (props.isAsanaVideo) {
          if (isMobile.check) {
            // Mobile
            Fetch({
              url: "/playback/get-widevine-token",
              method: "POST",
              token: false,
            })
              .then((res) => {
                const data = res.data;
                console.log("[DASH PLAYER] : widevine token");

                if (data && data.licenseAcquisitionUrl) {
                  playerRef().setProtectionData({
                    "com.widevine.alpha": {
                      serverURL: data.licenseAcquisitionUrl,
                    },
                  });
                  setDrmSet(true);
                }
              })
              .catch((err) => {
                console.log("Error fetching DRM info :", err);
                props.onError();
              });
          } else {
            // Non Mobile
            if (playreadyKeyUrl) {
              console.log("[DASH PLAYER] : playready token cached");
              playerRef().setProtectionData({
                "com.microsoft.playready": {
                  serverURL: playreadyKeyUrl,
                },
              });
              setDrmSet(true);
            } else {
              Fetch({
                url: "/playback/get-playready-token",
                method: "POST",
                token: false,
              })
                .then((res) => {
                  const data = res.data;
                  console.log("[DASH PLAYER] : playready token");
                  if (data && data.licenseAcquisitionUrl && data.token) {
                    playerRef().setProtectionData({
                      "com.microsoft.playready": {
                        serverURL:
                          data.licenseAcquisitionUrl +
                          "?ExpressPlayToken=" +
                          data.token,
                      },
                    });
                    console.log("[DASH PLAYER] : playready token caching now!");
                    setPlayreadyKeyUrl(
                      data.licenseAcquisitionUrl +
                        "?ExpressPlayToken=" +
                        data.token
                    );
                    setDrmSet(true);
                  }
                })
                .catch((err) => {
                  console.log("Error fetching DRM info :", err);
                  props.onError();
                });
            }
          }
        } else {
          console.log("[DASH PLAYER] : transition video");
          setDrmSet(true);
        }
      }
    })
  );

  const onMetadataLoaded = () => {
    console.log("[DASH PLAYER] : metadata loaded");
    setMetadataLoaded(true);
  };

  const onPlaybackNotAllowed = () => {
    if (playerRef() && isActive) {
      console.log("[DASH PLAYER] : playback not allowed");
      playerRef().setMute(true);
      playerRef().initialize(videoRef.current, props.src, true, 0.000);
      playerRef().setMute(false);
    }
  };

  const onStreamInitialized = () => {
    console.log("[DASH PLAYER] : stream initialized");
    setStreamInitialized(true);
  };

  const onCanPlay = () => {
    if (!props.isActive) {
      console.log("[DASH PLAYER] : onCanPlay event");
      playerRef().pause();
    }
  };

  const onPlay = () => {
    console.log(
      "[DASH PLAYER] handlePlay event called",
      props.isActive,
      props.video.idx
    );
	
    if (props.isActive) {
      if (videoStore.videoState !== STATE_VIDEO_PLAY) {
        console.log("PLAYING ----------------------------->", props.video.idx);
      }
      // playerRef().current.player.play();
      if (playInActiveTimer) {
        clearTimeout(playInActiveTimer);
      }
	//   playerRef().current.currentTime = 0; 

	  const currentTime = playerRef().time();
      const duration = playerRef().duration();
      const remainingTime = duration - currentTime;
      const inactiveVideoDuration = remainingTime - 0.1;
	  console.log(
        "[DASH PLAYER IS ACTIVE] starting event timer for playing inactive : currentTime = ",
         currentTime,
         "duration",
         duration,
         "remainingTime",
         remainingTime,
         "inactiveVideoDuration",
         inactiveVideoDuration
      );
      console.log(
        "[DASH PLAYER] starting event timer for playing inactive @ ",
        inactiveVideoDuration,
        props.isActive,
        props.video.idx
      );
      playInActiveTimer = setTimeout(() => {
        console.log("sending video event!");
        addVideoEvent({ t: VIDEO_EVENT_PLAY_INACTIVE });
      }, inactiveVideoDuration * 1000);
    }
  };

  const onPause = () => {
    if (props.isActive) {
      if (videoStore.videoState !== STATE_VIDEO_PAUSED) {
        console.log("PAUSING ----------------------------->", props.video.idx);
        // setVideoState(STATE_VIDEO_PAUSED);
      }
	  clearVideoEvents();

	  if (playInActiveTimer) {
        clearTimeout(playInActiveTimer);
      }
    }
  };

  // Setting event listeners
  createEffect(
    on(
      [
        playerRefSet,
        () => props.src,
        () => onMetadataLoaded,
        () => props.setDuration,
        () => props.onCanPlayThrough,
        () => props.onEnded,
        () => onPlaybackNotAllowed,
        () => props.onError,
        () => onPlay,
        () => onPause,
        () => props.onVolumeChange,
        () => props.onSeeked,
        () => props.onSeeking,
      ],
      () => {

        if (playerRefSet() && props.src && videoRef.current) {
          console.log("[DASH PLAYER] : setting up event listeners");
          playerRef().on(
            dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
            props.onCanPlayThrough
          );
          playerRef().on(dashjs.MediaPlayer.events.PLAYBACK_LOADED_DATA, () => {
            videoRef.current.currentTime = 0;
          });
          playerRef().on(dashjs.MediaPlayer.events.CAN_PLAY, onCanPlay);
          playerRef().on(dashjs.MediaPlayer.events.ERROR, props.onError);
          playerRef().on(
            dashjs.MediaPlayer.events.PLAYBACK_ENDED,
            props.onEnded
          );
          playerRef().on(
            dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
            props.onSeeked
          );
          playerRef().on(
            dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
            props.onSeeking
          );
          playerRef().on(
            dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
            onPlaybackNotAllowed
          );

          playerRef().on(dashjs.MediaPlayer.events.PLAYBACK_PAUSED, onPause);
          playerRef().on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, onPlay);
          playerRef().on(
            dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
            props.onVolumeChange
          );
          playerRef().on(
            dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
            onMetadataLoaded
          );
          playerRef().on(
            dashjs.MediaPlayer.events.STREAM_INITIALIZED,
            onStreamInitialized
          );
        }

        return () => {
          console.log("[DASH PLAYER] switching off event listeners");
          playerRef().off(
            dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
            props.onCanPlayThrough
          );
          playerRef().off(dashjs.MediaPlayer.events.CAN_PLAY, onCanPlay);
          playerRef().off(dashjs.MediaPlayer.events.ERROR, props.onError);
          playerRef().off(
            dashjs.MediaPlayer.events.PLAYBACK_ENDED,
            props.onEnded
          );
          playerRef().off(
            dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
            props.onSeeked
          );
          playerRef().off(
            dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
            props.onSeeking
          );
          playerRef().off(
            dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
            onPlaybackNotAllowed
          );
          playerRef().off(dashjs.MediaPlayer.events.PLAYBACK_PAUSED, onPause);
          playerRef().off(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, onPlay);
          playerRef().off(
            dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
            props.onVolumeChange
          );
          playerRef().off(
            dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
            onMetadataLoaded
          );
          playerRef().off(
            dashjs.MediaPlayer.events.STREAM_INITIALIZED,
            onStreamInitialized
          );
        };
      }
    )
  );

  const setVideoRef = (element) => {
    console.log("[DASH PLAYER] SETTING REF >>>>>>>>>>>>>");
    videoRef.current = element;
  };

  createEffect(
    on([playerRefSet, playerRef], () => {
      console.log("[DASH PLAYER] : platyerRefChanged", playerRefSet());
      if (playerRefSet()) {
        props.ref({
          player: playerRef(),
          videoElement: videoRef.current,
        });
      }
    })
  );

  return (
    <div class={props.className + " relative"}>
      <video ref={setVideoRef} controls></video>
    </div>
  );
}

export default DashPlayer;
