import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DraggableCore } from "react-draggable";
import useVideoStore, {
  STATE_VIDEO_ERROR,
  STATE_VIDEO_LOADING,
} from "../../store/VideoStore";
import VideoControls from "./VideoControls";

export default function VideoPlaybar({
  playbarVisible,
  currentTime,
  duration,
  draggableHandle,
  toTimeString,
  moveToTimestamp,
  handleSetPlay,
  handleSetPause,
  handleFullScreen,
}) {
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

  useEffect(() => {
    handleSetBarBounds();
  }, [barRef]);

  useEffect(() => {
    setCurrentBoopPosition(barBound.width * (currentTime / duration));
  }, [currentTime, barBound, duration]);

  useEffect(() => {
    handleSetBarBounds();
  }, [handleFullScreen?.active]);

  const seekOnClick = useCallback(
    (e) => {
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
      seekOnClick(e);
      setMouseDown(false);
    },
    [seekOnClick]
  );

  const handleOnDrag = useCallback(
    (e, data) => {
      setCurrentBoopPosition((p) => e.clientX - barBound.left);
    },
    [duration, barBound]
  );

  const draggedDuration = useMemo(() => {
    return (duration * currentBoopPosition) / barBound.width;
  }, [barBound, currentBoopPosition, duration]);

  return (
    <>
      <div
        className={`w-full h-[0.5rem] bg-white relative`}
        onClick={seekOnClick}
        ref={barRef}
      >
        <div
          className={`bg-amber-600 h-full relative transition-all ease-linear ${
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
            } w-3 h-3  ${mouseDown ? "" : "delay-75 transition-all"} ${
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
                {toTimeString(draggedDuration)}
              </div>
            ) : (
              <></>
            )}
          </div>
        </DraggableCore>

        <p
          className={`text-white text-xs absolute right-0 -top-5 border rounded-full px-1`}
        >
          {toTimeString(currentTime.toFixed(0))}/
          {toTimeString(duration.toFixed(0))}
        </p>
      </div>
      <VideoControls handleFullScreen={handleFullScreen} />
    </>
  );
}
