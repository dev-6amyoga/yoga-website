import { Avatar, Tooltip } from "@mui/material";
import { blue } from "@mui/material/colors";
import { useEffect, useMemo, useRef } from "react";
import { SEEK_TYPE_MARKER } from "../../enums/seek_types";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";
import { toTimeString } from "../../utils/toTimeString";

export default function PlaylistSections() {
  // const [sections] = usePlaylistStore((state) => [state.sections]);
  const sectionsRef = useRef(null);

  const [
    fullScreen,
    currentVideo,
    addToSeekQueue,
    currentMarkerIdx,
    setCurrentMarkerIdx,
    setMarkers,
  ] = useVideoStore((state) => [
    state.fullScreen,
    state.currentVideo,
    state.addToSeekQueue,
    state.currentMarkerIdx,
    state.setCurrentMarkerIdx,
    state.setMarkers,
  ]);

  const [queue] = usePlaylistStore((state) => [state.queue]);

  const handleSeek = (s, idx) => {
    // TODO : fix this, bug when you go to previous marker
    console.log("CLICKED SECTION : ", idx);
    // setVideoEvent({
    // 	type: VIDEO_EVENT_MOVING_MARKER,
    // 	markerIdx: idx,
    // });
    addToSeekQueue({
      type: SEEK_TYPE_MARKER,
      t: s.time,
    });
  };

  const currVideo = useMemo(() => {
    if (queue && queue.length > 0) {
      return queue[0];
    }
    return null;
  }, [queue]);

  useEffect(() => {
    if (currVideo) {
      setMarkers(currVideo?.video?.markers ?? currVideo?.video?.sections);
      setCurrentMarkerIdx(0);
    }
  }, [currVideo, setCurrentMarkerIdx, setMarkers]);

  const currMarker = useMemo(() => {
    if (
      currVideo &&
      currentMarkerIdx !== null &&
      currentMarkerIdx !== undefined &&
      currentMarkerIdx >= 0
    ) {
      return currVideo?.video?.sections[currentMarkerIdx];
    }
    return null;
  }, [currVideo, currentMarkerIdx]);

  return (
    <div
      className={`relative max-w-4xl mx-auto overflow-y-auto overflow-x-hidden rounded-xl bg-blue-50 ${fullScreen ? "" : "xl:h-full"}`}
    >
      <div className="p-4 sticky top-0 bg-blue-50 z-[1000] rounded-xl">
        <h5 className="uppercase">Currently Playing</h5>
        {currVideo ? (
          <div className="flex flex-col gap-2 py-2">
            <div>
              <p className="text-sm text-zinc-500">
                {currVideo?.video?.transition_id
                  ? "TRANSITION"
                  : currVideo?.video?.playlist_id
                    ? "PLAYLIST"
                    : "ASANA"}
              </p>
              <p>
                {currVideo?.video?.asana_name ||
                  currVideo?.video?.transition_video_name ||
                  currVideo?.video?.playlist_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">CURRENT SECTION</p>
              <p className="h-8">
                {currMarker ? (
                  <Tooltip title={currMarker.name}>
                    {currMarker.name.substring(0, 45)}...
                  </Tooltip>
                ) : (
                  "---"
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center">---</p>
        )}
      </div>

      {/* <div className="flex flex-col gap-4 pb-4 max-h-72" ref={sectionsRef}> */}
      <div
        className="flex flex-col gap-4 pb-4 max-h-72 max-w-xl"
        ref={sectionsRef}
      >
        <h5 className="uppercase p-4">Sections</h5>
        {currVideo?.video?.sections?.map((s, idx) => {
          return (
            <div
              key={s.time}
              id={`section-${idx}`}
              className={`flex flex-row items-center gap-2 p-2 hover:cursor-pointer hover:bg-blue-100 transition-colors ${currentMarkerIdx === idx ? "bg-blue-100" : ""}`}
              onClick={() => handleSeek(s, idx)}
            >
              <Avatar sx={{ bgcolor: blue[700] }}>{idx + 1}</Avatar>
              <div className="flex flex-col gap-1">
                <Tooltip title={s.name}>
                  <p className="font-medium text-sm">
                    {s.name.substring(0, 45)}..
                  </p>
                </Tooltip>
                <p className="text-sm">{toTimeString(s.time)}</p>
              </div>
            </div>
          );
        }) ?? <p className="text-center">---</p>}
      </div>
    </div>
  );
}
