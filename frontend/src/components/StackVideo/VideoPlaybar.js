import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DraggableCore } from "react-draggable";
import { SEEK_TYPE_MOVE } from "../../enums/seek_types";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
} from "../../store/VideoStore";
import VideoControls from "./VideoControls";

export default function VideoPlaybar({
  playbarVisible,
  duration,
  draggableHandle,
  toTimeString,
  handleSetPlay,
  handleSetPause,
  handleFullScreen,
}) {
  const [
    currentTime,
    addToSeekQueue,
    setCurrentTime,
    currentVideo,
    markers,
    currentMarkerIdx,
    setCurrentMarkerIdx,
    viewMode,
    setVideoState,
    setPauseReason,
    videoEvent,
    setVideoEvent,
  ] = useVideoStore((state) => [
    state.currentTime,
    state.addToSeekQueue,
    state.setCurrentTime,
    state.currentVideo,
    state.markers,
    state.currentMarkerIdx,
    state.setCurrentMarkerIdx,
    state.viewMode,
    state.setVideoState,
    state.setPauseReason,
    state.videoEvent,
    state.setVideoEvent,
  ]);

  const popFromQueue = usePlaylistStore((state) => state.popFromQueue);

  const popTimeout = useRef(null);

  useEffect(() => {
    setCurrentTime(0);
  }, [currentVideo, setCurrentTime]);

  const prevNextMarkers = useMemo(() => {
    console.log(
      "CURRENT IDX CHANGED, SETTING PREV NEXT MARKERS",
      currentMarkerIdx
    );
    if (currentMarkerIdx === null || !markers || markers.length === 0) {
      return [null, null];
    }

    if (currentMarkerIdx === markers.length - 1) {
      return [markers[currentMarkerIdx], null];
    }

    return [markers[currentMarkerIdx], markers[currentMarkerIdx + 1]];
  }, [currentMarkerIdx, markers]);

  // jugaad : if the video is less than 10 seconds, pop it from queue after 7.5 seconds
  // check if the current time is past the marker, set the current marker index / go back to start of marker
  // FIX :
  useEffect(() => {
    if (currentVideo && duration > 0 && duration < 10 && currentTime >= 7.5) {
      popTimeout.current = setTimeout(() => {
        console.log("Popping from queue");
        popFromQueue(0);
      }, 60);
    }

    // console.log(viewMode, currentTime, prevNextMarkers);
    // 0 : cur marker, 1 : next marker
    return () => {
      if (popTimeout.current) {
        clearTimeout(popTimeout.current);
      }
    };
  }, [currentVideo, duration, popFromQueue, currentTime]);

  useEffect(
    () => {
      // console.log(
      //     videoEvent,
      //     currentTime,
      //     prevNextMarkers[0],
      //     prevNextMarkers[1]
      // )
      // if (
      //     videoEvent &&
      //     videoEvent?.type === VIDEO_EVENT_MOVING_MARKER &&
      //     Math.abs(currentTime - markers[videoEvent?.markerIdx].timestamp) < 1
      // ) {
      //     console.log('SETTING CURRENT IDX --->', videoEvent?.markerIdx || 0)
      //     setCurrentMarkerIdx(videoEvent?.markerIdx || 0)
      //     console.log('VIDEO EVENT --->', null)
      //     setVideoEvent(null)
      //     return
      // }
      // if (videoEvent?.type !== VIDEO_EVENT_MOVING_MARKER) {
      //     if (
      //         prevNextMarkers[1] &&
      //         currentTime >= prevNextMarkers[1].timestamp
      //     ) {
      //         if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
      //             setCurrentMarkerIdx(
      //                 currentMarkerIdx + 1 > markers.length - 1
      //                     ? 0
      //                     : currentMarkerIdx + 1
      //             )
      //         } else {
      //             // if in teaching mode, then go to start of current marker
      //             if (prevNextMarkers[0] && prevNextMarkers[0]?.loop) {
      //                 addToSeekQueue({
      //                     t: prevNextMarkers[0].timestamp,
      //                     type: SEEK_TYPE_MOVE,
      //                 })
      //             } else if (
      //                 prevNextMarkers[0] &&
      //                 !prevNextMarkers[0]?.loop
      //             ) {
      //                 console.log(
      //                     "SETTING PAUSE REASON TO 'VIDEO_PAUSE_MARKER'"
      //                 )
      //                 setVideoState(STATE_VIDEO_PAUSED)
      //                 setPauseReason(VIDEO_PAUSE_MARKER)
      //             }
      //         }
      //     }
      // }
    },
    [
      // setVideoEvent,
      // videoEvent,
      // currentTime,
      // setVideoState,
      // prevNextMarkers,
      // viewMode,
      // markers,
      // currentMarkerIdx,
      // setCurrentMarkerIdx,
      // addToSeekQueue,
      // setPauseReason,
    ]
  );

  const [mouseDown, setMouseDown] = useState(false);
  const barRef = useRef(null);
  const [barBound, setBarBound] = useState({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  });
  const [currentBoopPosition, setCurrentBoopPosition] = useState(0);
  const videoState = useVideoStore((state) => state.videoState);

  const handleSetBarBounds = () => {
    if (barRef.current) {
      const bounds = barRef.current.getBoundingClientRect();
      setBarBound({
        top: bounds.top,
        bottom: bounds.bottom,
        left: bounds.left,
        right: bounds.right,
        width: bounds.width,
        height: bounds.height,
      });
    }
  };

  const moveToTimestamp = useCallback(
    (t) => {
      // console.log("MOVING BY ", t - currentTime);
      addToSeekQueue({ t, type: SEEK_TYPE_MOVE });
    },
    [addToSeekQueue]
  );

  // set bar bounds on mount
  useEffect(() => {
    handleSetBarBounds();
  }, [barRef]);

  // set the current position of the boop
  useEffect(() => {
    setCurrentBoopPosition(barBound.width * (currentTime / duration));
  }, [currentTime, barBound, duration]);

  // set bar bounds on fullscreen change
  useEffect(() => {
    handleSetBarBounds();
  }, [handleFullScreen?.active]);

  const seekOnClick = useCallback(
    (e, location) => {
      e.preventDefault();
      //   console.log(
      //     "Calling move to	timestamp from seekOnClick",
      //     e.type,
      //     location
      //   );
      moveToTimestamp(
        (duration * (e.clientX - barBound.left)) / barBound.width
      );
    },
    [duration, barBound, moveToTimestamp]
  );

  const handleDragOnStart = useCallback(
    (e, data) => {
      setMouseDown(true);
      handleSetPause();
    },
    [handleSetPause]
  );

  const handleDragOnStop = useCallback(
    (e, data) => {
      seekOnClick(e, "boopdrag");
      setMouseDown(false);
    },
    [seekOnClick]
  );

  const handleOnDrag = useCallback(
    (e, data) => {
      const cbp = e.clientX - barBound.left;
      const calcpos = cbp < 0 ? 0 : cbp > barBound.width ? barBound.width : cbp;
      setCurrentBoopPosition((p) => calcpos);
    },
    [barBound]
  );

  const draggedDuration = useMemo(() => {
    const d = (duration * currentBoopPosition) / barBound.width;
    // console.log(
    // 	duration,
    // 	currentBoopPosition,
    // 	barBound.width,
    // 	"------->",
    // 	d
    // );
    return d;
  }, [barBound, currentBoopPosition, duration]);

  return (
    <>
      <div
        className={`w-[calc(100%-0.35rem)] h-[1.5rem] bg-transparent relative mx-auto group flex items-start mt-2`}
        onClick={(e) => seekOnClick(e, "barclick")}
        ref={barRef}
      >
        <div
          className={`mt-3 w-full bg-white ${
            mouseDown ? "h-[50%]" : "h-[30%]"
          } absolute z-20`}
        ></div>
        <div
          className={`mt-4 w-[calc(100%+0.5rem)] -left-1 mx-auto h-[32%] absolute z-10`}
        ></div>
        {/* orange bar */}
        <div className="absolute z-[100] w-full h-full">
          <div
            className={`mt-3 bg-red-600 ${
              mouseDown ? "h-[50%]" : "h-[30%]"
            } relative transition-all duration-300 ease-linear ${
              videoState === STATE_VIDEO_ERROR ||
              videoState === STATE_VIDEO_LOADING
                ? "opacity-0"
                : "opacity-100"
            }`}
            style={{
              width: `${(currentTime / duration) * 100}%`,
            }}
          ></div>
        </div>

        {/* boop */}
        <DraggableCore
          axis="x"
          bounds="parent"
          handle=".timeboop"
          defaultClassName="timeboop"
          onStart={handleDragOnStart}
          onStop={handleDragOnStop}
          onDrag={handleOnDrag}
          scale={1}
          nodeRef={draggableHandle}
        >
          <div
            className={`timeboop ${
              videoState === STATE_VIDEO_ERROR ? "opacity-0" : "opacity-100"
            } mt-4 w-3 h-3 hover:w-5 hover:h-5  ${
              mouseDown ? "w-5 h-5" : "duration-300 transition-all ease-linear"
            } ${
              handleFullScreen.active
                ? mouseDown
                  ? "-top-[calc(50%-0.3rem)]"
                  : "-top-[calc(50%-0.3rem)] hover:-top-[calc(50%-0.1rem)]"
                : mouseDown
                  ? "-top-[calc(50%-0.2rem)]"
                  : "-top-[calc(50%-0.225rem)] hover:-top-[calc(50%+0.1rem)]"
            } bg-red-600 border border-white rounded-full absolute z-[100]`}
            ref={draggableHandle}
            style={{
              left: `${((currentBoopPosition - 2) / barBound.width) * 100}%`,
            }}
          >
            {mouseDown ? (
              <div
                className={`text-white absolute rounded-lg px-4 text-xs transition-all ${
                  duration - draggedDuration < 5
                    ? "-left-[calc(50%+3.5rem)]"
                    : "-left-[calc(50%+1rem)]"
                } -top-[calc(50%+1.5rem)] border border-white`}
              >
                {videoState === STATE_VIDEO_LOADING
                  ? "--:--"
                  : toTimeString(draggedDuration)}
              </div>
            ) : (
              <></>
            )}
          </div>
        </DraggableCore>

        {/* time */}
        <p
          className={`bg-black bg-opacity-40 text-white text-xs absolute right-0 -top-6 border rounded-full px-1`}
        >
          {videoState === STATE_VIDEO_LOADING
            ? "--:--"
            : toTimeString(currentTime.toFixed(0))}
          /
          {videoState === STATE_VIDEO_LOADING
            ? "--:--"
            : toTimeString(duration.toFixed(0))}
        </p>
      </div>
      <VideoControls handleFullScreen={handleFullScreen} />
    </>
  );
}
