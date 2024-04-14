import dashjs from "dashjs";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { dashSettings } from "../../lib/dashjs-settings";
import useVideoStore from "../../store/VideoStore";
import { Fetch } from "../../utils/Fetch";
import { isMobileTablet } from "../../utils/isMobileOrTablet";

function DashPlayer(
  {
    src,
    isActive,
    isAsanaVideo,
    setDuration,
    onCanPlayThrough,
    onEnded,
    onPlay,
    onPause,
    onError,
    onVolumeChange,
    onLoading,
    onLoaded,
    onSeeking,
    onSeeked,
    className,
    ...rest
  },
  ref
) {
  const videoRef = useRef(null);
  const [playerRefSet, setPlayerRefSet] = useState(false);
  const playerRef = useRef(null);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [streamInitialized, setStreamInitialized] = useState(false);
  const [drmSet, setDrmSet] = useState(false);

  const onMetadataLoaded = useCallback(() => {
    console.log("[DASH PLAYER] : metadata loaded");
    setMetadataLoaded(true);
  }, []);

  const onPlaybackNotAllowed = useCallback(() => {
    if (playerRef.current && isActive) {
      console.log("[DASH PLAYER] : playback not allowed");
      playerRef.current.setMute(true);
      playerRef.current.initialize(videoRef.current, src, true);
      playerRef.current.setMute(false);
    }
  }, [isActive, src]);

  const onStreamInitialized = useCallback(() => {
    console.log("[DASH PLAYER] : stream initialized");
    setStreamInitialized(true);
  }, []);

  useEffect(() => {
    console.log("[DASH PLAYER] : setup");
    const p = dashjs.MediaPlayer().create();
    playerRef.current = p;
    playerRef.current.updateSettings(dashSettings);
    playerRef.current.initialize(null, src, true);
    setPlayerRefSet(true);
    return () => {
      console.log("[DASH PLAYER] Cleanup, player reset");
      p.reset();
    };
  }, [src]);

  useEffect(() => {
    if (playerRefSet && drmSet && src) {
      console.log("[DASH PLAYER] : preloading");
      playerRef.current.attachView(videoRef.current);
      playerRef.current.preload();
    }
  }, [playerRefSet, src, drmSet]);

  useEffect(() => {
    if (playerRefSet && src && videoRef.current) {
      console.log(
        "[DASH PLAYER] : setting DRM Info"
        // playerRef.current,
        // playerRefSet
      );
      const check = isMobileTablet();
      const isMobile = { done: true, check: check };
      console.log("Checking for isMobile", isMobile);
      const store = useVideoStore.getState();
      const playreadyKeyUrl = store.playreadyKeyUrl;
      const setPlayreadyKeyUrl = store.setPlayreadyKeyUrl;

      //console.log("Fetching DRM Info");
      //fetch only if it is not a transition video
      // playerRef.current.initialize(videoRef.current, src, false);
      console.log("[DASH PLAYER] : isAsanaVideo", isAsanaVideo);

      if (isAsanaVideo) {
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
                playerRef.current.setProtectionData({
                  "com.widevine.alpha": {
                    serverURL: data.licenseAcquisitionUrl,
                  },
                });
                setDrmSet(true);
              }
            })
            .catch((err) => {
              console.log("Error fetching DRM info :", err);
              onError();
            });
        } else {
          // Non Mobile
          if (playreadyKeyUrl) {
            console.log("[DASH PLAYER] : playready token cached");
            playerRef.current.setProtectionData({
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
                  playerRef.current.setProtectionData({
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
                onError();
              });
          }
        }
      } else {
        console.log("[DASH PLAYER] : transition video");
        setDrmSet(true);
      }
    }
  }, [playerRefSet, src, isAsanaVideo, onError]);

  // useEffect(() => {
  // 	if (
  // 		playerRefSet &&
  // 		isActive &&
  // 		drmSet &&
  // 		streamInitialized &&
  // 		src &&
  // 		metadataLoaded
  // 	) {
  // 		console.log(isActive, "FROM DASH PLAYER\n");
  // 		console.log("[DASH PLAYER] : playing [isActive]");
  // 		// playerRef.current.attachView(videoRef.current);
  // 		// playerRef.current.play();
  // 		// playerRef.current.setAutoplay(true)
  // 	}
  // }, [
  // 	isActive,
  // 	playerRefSet,
  // 	drmSet,
  // 	streamInitialized,
  // 	metadataLoaded,
  // 	src,
  // ]);

  useEffect(() => {
    if (playerRefSet && isActive && metadataLoaded) {
      console.log("[DASH PLAYER] : setting duration");
      setDuration(playerRef.current.duration());
    }
  }, [playerRefSet, isActive, setDuration, metadataLoaded]);

  // events
  useEffect(() => {
    if (playerRefSet && src && videoRef.current) {
      console.log("[DASH PLAYER] : setting up event listeners");
      // CAN_PLAY_THROUGH
      playerRef.current.on(
        dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
        onCanPlayThrough
      );

      // FRAGMENT_LOADING_STARTED
      // FRAGMENT_LOADING_COMPLETED
      // FRAGMENT_LOADING_ABANDONED

      // MANIFEST_LOADING_STARTED
      // MANIFEST_LOADING_FINISHED

      // ERROR
      playerRef.current.on(dashjs.MediaPlayer.events.ERROR, onError);

      // PLAYBACK_ERROR

      // PLAYBACK_ENDED
      playerRef.current.on(dashjs.MediaPlayer.events.PLAYBACK_ENDED, onEnded);
      // PLAYBACK_SEEKED
      playerRef.current.on(dashjs.MediaPlayer.events.PLAYBACK_SEEKED, onSeeked);
      // PLAYBACK_SEEKING
      playerRef.current.on(
        dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
        onSeeking
      );
      // PLAYBACK_NOT_ALLOWED
      playerRef.current.on(
        dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
        onPlaybackNotAllowed
      );

      // PLAYBACK_PAUSED
      playerRef.current.on(dashjs.MediaPlayer.events.PLAYBACK_PAUSED, onPause);
      // PLAYBACK_PLAYING
      playerRef.current.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, onPlay);
      // PLAYBACK_STALLED

      // PLAYBACK_VOLUME_CHANGED
      playerRef.current.on(
        dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
        onVolumeChange
      );
      // PLAYBACK_METADATA_LOADED
      playerRef.current.on(
        dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
        onMetadataLoaded
      );

      playerRef.current.on(
        dashjs.MediaPlayer.events.STREAM_INITIALIZED,
        onStreamInitialized
      );
    }

    return () => {
      console.log("[DASH PLAYER] switching off event listeners");
      // CAN_PLAY_THROUGH
      playerRef.current.off(
        dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
        onCanPlayThrough
      );

      // FRAGMENT_LOADING_STARTED
      // FRAGMENT_LOADING_COMPLETED
      // FRAGMENT_LOADING_ABANDONED

      // MANIFEST_LOADING_STARTED
      // MANIFEST_LOADING_FINISHED

      // ERROR
      playerRef.current.off(dashjs.MediaPlayer.events.ERROR, onError);

      // PLAYBACK_ERROR

      // PLAYBACK_ENDED
      playerRef.current.off(dashjs.MediaPlayer.events.PLAYBACK_ENDED, onEnded);
      // PLAYBACK_SEEKED
      playerRef.current.off(
        dashjs.MediaPlayer.events.PLAYBACK_SEEKED,
        onSeeked
      );
      // PLAYBACK_SEEKING
      playerRef.current.off(
        dashjs.MediaPlayer.events.PLAYBACK_SEEKING,
        onSeeking
      );
      // PLAYBACK_NOT_ALLOWED
      playerRef.current.off(
        dashjs.MediaPlayer.events.PLAYBACK_NOT_ALLOWED,
        onPlaybackNotAllowed
      );

      // PLAYBACK_PAUSED
      playerRef.current.off(dashjs.MediaPlayer.events.PLAYBACK_PAUSED, onPause);
      // PLAYBACK_PLAYING
      playerRef.current.off(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, onPlay);
      // PLAYBACK_STALLED

      // PLAYBACK_VOLUME_CHANGED
      playerRef.current.off(
        dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
        onVolumeChange
      );
      // PLAYBACK_METADATA_LOADED
      playerRef.current.off(
        dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED,
        onMetadataLoaded
      );

      playerRef.current.off(
        dashjs.MediaPlayer.events.STREAM_INITIALIZED,
        onStreamInitialized
      );
    };
  }, [
    playerRefSet,
    src,
    onMetadataLoaded,
    setDuration,
    onCanPlayThrough,
    onEnded,
    onPlaybackNotAllowed,
    onError,
    onPause,
    onPlay,
    onVolumeChange,
    onSeeked,
    onSeeking,
  ]);

  // set ref
  useImperativeHandle(
    ref,
    () => {
      console.log("[DASH PLAYER] : ref");
      return {
        get player() {
          return playerRef.current;
        },
        get videoElement() {
          return videoRef.current;
        },
        get videoUrl() {
          try {
            return playerRef.current.getSource();
          } catch (error) {
            return null;
          }
        },
        set videoUrl(url) {
          if (playerRef.current === null) {
            return;
          }

          // playerRef.current.setSource(url);
          // playerRef.current.player.initialize();
        },
      };
    },
    [playerRefSet]
  );

  const setVideoRef = useCallback(
    (element) => {
      // console.log("[DASH PLAYER] : setVideoRef", element);
      if (element !== null) {
        videoRef.current = element;
        if (playerRefSet) {
          // playerRef.current.attachView(element);
        }
      }
    },
    [playerRefSet]
  );

  return (
    <div className={className + " relative"}>
      <video ref={setVideoRef} {...rest}></video>
      <button
        className="absolute bottom-4 right-4"
        onClick={() => {
          playerRef.current.attachView(videoRef.current);
        }}
      >
        Attach
      </button>
    </div>
  );
}

export default memo(forwardRef(DashPlayer));
