import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DraggableCore } from "react-draggable";
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
  const [currentTime, addToSeekQueue, setCurrentTime, currentVideo] =
    useVideoStore((state) => [
      state.currentTime,
      state.addToSeekQueue,
      state.setCurrentTime,
      state.currentVideo,
    ]);

  const popFromQueue = usePlaylistStore((state) => state.popFromQueue);

  const popTimeout = useRef(null);

  useEffect(() => {
    setCurrentTime(0);
  }, [currentVideo, setCurrentTime]);

  // jugaad : if the video is less than 10 seconds, pop it from queue after 7.5 seconds
  // FIX :
  useEffect(() => {
    if (currentVideo && duration > 0 && duration < 10 && currentTime >= 7.5) {
      popTimeout.current = setTimeout(() => {
        console.log("Popping from queue");
        popFromQueue(0);
      }, 60);
    }

    return () => {
      if (popTimeout.current) {
        clearTimeout(popTimeout.current);
      }
    };
  }, [currentVideo, duration, popFromQueue, currentTime]);

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
      addToSeekQueue({ t, type: "move" });
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
        className={`w-[calc(100%-0.35rem)] h-[0.5rem] bg-white relative mx-auto`}
        onClick={(e) => seekOnClick(e, "barclick")}
        ref={barRef}
      >
        <div
          className={`bg-amber-600 h-full relative transition-all duration-300 ease-in-out ${
            videoState === STATE_VIDEO_ERROR ||
            videoState === STATE_VIDEO_LOADING
              ? "opacity-0"
              : "opacity-100"
          }`}
          style={{
            width: `${(currentTime / duration) * 100}%`,
          }}
        ></div>

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
              videoState === STATE_VIDEO_ERROR ||
              videoState === STATE_VIDEO_LOADING
                ? "opacity-0"
                : "opacity-100"
            } w-3 h-3  ${
              mouseDown ? "" : "duration-300 transition-all ease-in-out"
            } ${
              handleFullScreen.active
                ? "-top-[calc(50%-0.1rem)]"
                : "-top-[calc(50%)]"
            } bg-amber-600 border border-white rounded-full absolute`}
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
