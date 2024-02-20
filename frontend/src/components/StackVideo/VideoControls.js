import usePlaylistStore from '../../store/PlaylistStore'
import useVideoStore, { STATE_VIDEO_LOADING } from '../../store/VideoStore'
// import asanas from "../../data/asanas.json";
import { Loading, Popover, Toggle } from '@geist-ui/core'
import { memo, useEffect } from 'react'
import {
    FaBackward,
    FaExpand,
    FaForward,
    FaPause,
    FaPlay,
    FaStepBackward,
    FaStepForward,
} from 'react-icons/fa'

import { TbArrowBadgeLeft, TbArrowBadgeRight } from 'react-icons/tb'

import { IoMdVolumeHigh, IoMdVolumeLow, IoMdVolumeOff } from 'react-icons/io'

import { BsArrowsAngleContract } from 'react-icons/bs'

// import { toast } from "react-toastify";
import { useRef } from 'react'
import { LuSettings } from 'react-icons/lu'
import { toast } from 'react-toastify'
import {
    VIDEO_VIEW_STUDENT_MODE,
    VIDEO_VIEW_TEACHING_MODE,
} from '../../enums/video_view_modes'
import { STATE_VIDEO_PAUSED, STATE_VIDEO_PLAY } from '../../store/VideoStore'

function VideoControls({ handleFullScreen }) {
    let popFromQueue = usePlaylistStore((state) => state.popFromQueue)
    let popFromArchive = usePlaylistStore((state) => state.popFromArchive)
    let volumeSliderRef = useRef(null)

    let [
        videoState,
        setVideoState,
        addToSeekQueue,
        volume,
        setVolume,
        viewMode,
        setViewMode,
        markers,
        currentMarkerIdx,
        setCurrentMarkerIdx,
    ] = useVideoStore((state) => [
        state.videoState,
        state.setVideoState,
        state.addToSeekQueue,
        state.volume,
        state.setVolume,
        state.viewMode,
        state.setViewMode,
        state.markers,
        state.currentMarkerIdx,
        state.setCurrentMarkerIdx,
    ])

    const handlePlay = () => {
        /*
			-- if currentVideo is null then play (video starts)
			-- else if video is running, pause. if video not running(paused), play
		*/
        // if (currentVideo === null && queue.length > 0) {
        // 	setPlaylistState(true);
        // 	setCurrentVideo(queue[0]);
        // } else if (currentVideo === null && queue.length === 0) {
        // 	setPlaylistState(false);
        // 	toast("Please add videos to queue!", { type: "warning" });
        // 	return;
        // } else {
        // }
        setVideoState(STATE_VIDEO_PLAY)
    }

    useEffect(() => {
        if (volumeSliderRef.current) {
            volumeSliderRef.current.value = volume * 100
        }
    }, [volume])

    const handlePause = () => {
        /*
        -- if playing pause it
      */
        setVideoState(STATE_VIDEO_PAUSED)
    }

    const handleNextVideo = () => {
        // remove from queue add to archive
        popFromQueue(0)
    }

    const handleSeekFoward = () => {
        addToSeekQueue({ t: 10, type: 'seek' })
    }

    const handleSeekBackward = () => {
        addToSeekQueue({ t: -10, type: 'seek' })
    }

    const handlePrevMarker = () => {
        console.log('Prev Marker')
        if (markers.length > 0) {
            if (currentMarkerIdx === 0) {
                addToSeekQueue({ t: 0, type: 'move' })
                return
            }
            const idx =
                ((currentMarkerIdx || 0) - 1 + markers.length) % markers.length
            setCurrentMarkerIdx(idx)
            // seek to prev marker
            addToSeekQueue({ t: markers[idx].timestamp, type: 'move' })
        }
    }

    const handleNextMarker = () => {
        console.log('Next Marker')
        if (markers.length > 0) {
            const idx = ((currentMarkerIdx || 0) + 1) % markers.length
            setCurrentMarkerIdx(idx)
            // seek to next marker
            addToSeekQueue({ t: markers[idx].timestamp, type: 'move' })
        }
    }

    const handleViewModeToggle = (e) => {
        if (e.target.checked) {
            toast('View Mode: teacher', { type: 'success' })
            setViewMode(VIDEO_VIEW_TEACHING_MODE)
        } else {
            toast('View Mode: student', { type: 'success' })
            setViewMode(VIDEO_VIEW_STUDENT_MODE)
        }
    }

    return (
        <div className="flex justify-between items-center px-4 py-1">
            <div className="col-start-4 col-span-3 flex gap-5 items-center justify-start text-white rounded-xl p-2">
                {/* previous video */}
                <button
                    className="w-5 h-5"
                    onClick={() => {
                        popFromArchive(-1)
                    }}
                    title="Previous video"
                >
                    <FaStepBackward className="w-full h-full" />
                </button>

                {/* seek back */}
                <button onClick={handleSeekBackward} title="Rewind 10s">
                    <FaBackward />
                </button>

                {/* previous marker */}
                {viewMode === VIDEO_VIEW_TEACHING_MODE && (
                    <button onClick={handlePrevMarker} title="Prev Marker">
                        <TbArrowBadgeLeft />
                    </button>
                )}

                {/* play/pause video */}
                <button
                    className={`w-5 h-5 ${
                        videoState === STATE_VIDEO_LOADING ? 'opacity-30' : ''
                    }`}
                    onClick={() => {
                        if (videoState === STATE_VIDEO_PLAY) {
                            handlePause()
                        } else if (videoState === STATE_VIDEO_PAUSED) {
                            handlePlay()
                        }
                    }}
                    disabled={videoState === STATE_VIDEO_LOADING}
                    title="Play/Pause"
                >
                    {videoState === STATE_VIDEO_PLAY ? (
                        <FaPause className="w-full h-full" />
                    ) : videoState === STATE_VIDEO_PAUSED ? (
                        <FaPlay className="w-full h-full" />
                    ) : (
                        <Loading color="#fff" />
                    )}
                </button>

                {/* next marker */}
                {viewMode === VIDEO_VIEW_TEACHING_MODE && (
                    <button onClick={handleNextMarker} title="Next Marker">
                        <TbArrowBadgeRight />
                    </button>
                )}

                {/* seek forward */}
                <button onClick={handleSeekFoward} title="Fast Forward 10s">
                    <FaForward />
                </button>

                {/* next video */}
                <button
                    className="w-5 h-5"
                    onClick={handleNextVideo}
                    title="Next Video"
                >
                    <FaStepForward className="w-full h-full" />
                </button>
            </div>

            {/* volume control */}
            <div className="flex items-center justify-center gap-4 text-white">
                <div className="col-start-9 flex items-center gap-1 mb-1">
                    <div className="mt-2">
                        {volume === 0 ? (
                            <IoMdVolumeOff onClick={() => setVolume(0.3)} />
                        ) : volume > 0.5 ? (
                            <IoMdVolumeHigh onClick={() => setVolume(0)} />
                        ) : (
                            <IoMdVolumeLow onClick={() => setVolume(0.0)} />
                        )}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        className="accent-orange-500 mt-2"
                        ref={volumeSliderRef}
                        onChange={(e) =>
                            setVolume(parseFloat(e.target.value) / 100)
                        }
                    />
                </div>

                {/* settings */}
                <Popover
                    disableItemsAutoClose
                    content={
                        <>
                            <Popover.Item title>
                                <span>Settings</span>
                            </Popover.Item>
                            <Popover.Item>
                                <p>View Mode </p>
                            </Popover.Item>
                            <Popover.Item className="flex items-center gap-2">
                                <span className="mt-1">Student</span>
                                <Toggle
                                    checked={
                                        viewMode === VIDEO_VIEW_TEACHING_MODE
                                    }
                                    type="secondary"
                                    onChange={handleViewModeToggle}
                                />
                                <span className="mt-1">Teacher</span>
                            </Popover.Item>
                            <Popover.Item line />
                        </>
                    }
                >
                    <button className="w-5 h-5 mt-2">
                        <LuSettings className="w-full h-full" />
                    </button>
                </Popover>

                {/* full screen */}
                <button
                    className="w-5 h-5"
                    onClick={() => {
                        if (handleFullScreen.active) handleFullScreen.exit()
                        else handleFullScreen.enter()
                    }}
                    title="Full Screen"
                >
                    {handleFullScreen.active ? (
                        <BsArrowsAngleContract className="w-full h-full" />
                    ) : (
                        <FaExpand className="w-full h-full" />
                    )}
                </button>
            </div>
        </div>
    )
}

export default memo(VideoControls)
