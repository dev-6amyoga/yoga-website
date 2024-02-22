import { useEffect, useMemo, useRef, useState } from 'react'
import useVideoStore, { STATE_VIDEO_PLAY } from '../../store/VideoStore'
// import asanas from "../../data/asanas.json";

import { Stream } from '@cloudflare/stream-react'
// import { toast } from "react-toastify";
import {
    SEEK_TYPE_MARKER,
    SEEK_TYPE_MOVE,
    SEEK_TYPE_SEEK,
} from '../../enums/seek_types'
import { VIDEO_EVENT_MOVING_MARKER } from '../../enums/video_event'
import useUserStore from '../../store/UserStore'
import { STATE_VIDEO_PAUSED } from '../../store/VideoStore'
import useWatchHistoryStore from '../../store/WatchHistoryStore'
import { Fetch } from '../../utils/Fetch'

function StreamStackItem({
    video,
    isActive,
    handleEnd,
    handleLoading,
    handlePlaybackError,
    setDuration,
    setVideoStateVisible,
}) {
    const playerRef = useRef(null)
    const user = useUserStore((state) => state.user)
    const commitTimeInterval = useRef(null)
    const flushTimeInterval = useRef(null)
    const [metadataLoaded, setMetadataLoaded] = useState(false)

    const [
        seekQueue,
        popFromSeekQueue,
        currentVideo,
        videoState,
        setCurrentTime,
        volume,
        setVolume,
        autoplayInitialized,
        setAutoplayInitialized,
        videoEvent,
        setVideoEvent,
        setCurrentMarkerIdx,
    ] = useVideoStore((state) => [
        state.seekQueue,
        state.popFromSeekQueue,
        state.currentVideo,
        state.videoState,
        state.setCurrentTime,
        state.volume,
        state.setVolume,
        state.autoplayInitialized,
        state.setAutoplayInitialized,
        state.videoEvent,
        state.setVideoEvent,
        state.setCurrentMarkerIdx,
    ])

    let [
        enableWatchHistory,
        setCommittedTs,
        addToCommittedTs,
        updateWatchTimeBuffer,
        flushWatchTimeBuffer,
    ] = useWatchHistoryStore((state) => [
        state.enableWatchHistory,
        state.setCommittedTs,
        state.addToCommittedTs,
        state.updateWatchTimeBuffer,
        state.flushWatchTimeBuffer,
    ])

    // if its active, set the duration
    useEffect(() => {
        if (isActive && metadataLoaded) {
            console.log(
                'PLAYING ----------------------------->',
                video.queue_id,
                playerRef?.current
            )
            setDuration(playerRef?.current?.duration || 0)
        }
    }, [isActive, setDuration, metadataLoaded, video.queue_id])

    // pause and reset the video when its not active
    useEffect(() => {
        const pr = playerRef.current
        if (!isActive && pr && pr.currentTime > 0) {
            // console.log(
            // 	"PAUSE AND RESET ----------------------------->",
            // 	video.queue_id
            // );
            pr.muted = true
            setVolume(0)
            pr?.pause()
            pr.currentTime = 0
        }

        return () => {
            if (pr) {
                pr?.pause()
                pr.currentTime = 0
            }
        }
    }, [isActive, video.queue_id, setVolume])

    // set the volume
    useEffect(() => {
        if (playerRef.current) {
            if (volume > 0) {
                playerRef.current.muted = false
            }
            playerRef.current.volume = volume
        }
    }, [volume])

    // pop from seek queue and update the time
    useEffect(() => {
        if (isActive && seekQueue.length > 0) {
            const seekEvent = seekQueue[0]
            console.log('SEEKING --->', seekEvent)
            if (seekEvent && playerRef.current) {
                switch (seekEvent.type) {
                    case SEEK_TYPE_SEEK:
                        playerRef.current.currentTime += seekEvent.t
                        break
                    case SEEK_TYPE_MOVE:
                        playerRef.current.currentTime = seekEvent.t
                        break
                    case SEEK_TYPE_MARKER:
                        playerRef.current.currentTime = seekEvent.t
                        break
                    default:
                        break
                }
                addToCommittedTs(playerRef.current?.currentTime)
            }
            popFromSeekQueue(0)
        }
    }, [
        isActive,
        seekQueue,
        popFromSeekQueue,
        addToCommittedTs,
        setVideoEvent,
        setCurrentMarkerIdx,
    ])

    // change play/pause based on video state
    useEffect(() => {
        if (
            isActive &&
            playerRef.current !== null &&
            playerRef.current !== undefined
        ) {
            if (videoState === STATE_VIDEO_PAUSED) {
                playerRef.current?.pause()
            } else {
                playerRef.current
                    .play()
                    .then((res) => {
                        playerRef.current.muted = true
                        playerRef.current
                            .play()
                            .then((res) => {
                                playerRef.current.muted = false
                                if (volume === 0 && !autoplayInitialized) {
                                    setVolume(0.5)
                                    setAutoplayInitialized(true)
                                }
                            })
                            .catch((err) => {
                                console.error(err)
                            })
                    })
                    .catch((err) => {
                        console.error(err)
                        // toast("Error playing video", { type: "error" });
                    })
            }
        }
    }, [videoState, isActive, autoplayInitialized, setAutoplayInitialized])

    // poll to update the current time, every 20ms, clear the timeout on unmount
    useEffect(() => {
        const int = setInterval(() => {
            if (playerRef.current?.currentTime && isActive) {
                setCurrentTime(playerRef.current?.currentTime)
            }
        }, 20)

        return () => {
            clearInterval(int)
        }
    }, [currentVideo, isActive, setCurrentTime])

    // clear timeouts before unmount
    useEffect(() => {
        return () => {
            // clearing previous interval to flush
            if (flushTimeInterval.current) {
                clearInterval(flushTimeInterval.current)
            }

            // clearing previous commitTimeInterval
            if (commitTimeInterval.current) {
                clearInterval(commitTimeInterval.current)
            }
        }
    }, [commitTimeInterval, flushTimeInterval])

    /* when video changes
					- flush 
					- reset committedTs
					- clear previous interval to flush 
					- start interval timer to flush	watch duration buffer  [10s]
					- clear previous interval to commit time
					- start interval timer to commit time [5s]
	*/
    useEffect(() => {
        if (isActive && enableWatchHistory) {
            console.log('CURRENT VIDEO', video)
            // flushing
            flushWatchTimeBuffer(user?.user_id)

            // resetting committedTs
            setCommittedTs(0)

            // clearing previous interval to flush
            if (flushTimeInterval.current) {
                clearInterval(flushTimeInterval.current)
            }

            // clearing previous commitTimeInterval
            if (commitTimeInterval.current) {
                clearInterval(commitTimeInterval.current)
            }

            // TODO : send to watch history
            Fetch({
                url: 'http://localhost:4000/watch-history/create',
                method: 'POST',
                // TODO : fix thiss
                data: {
                    user_id: user?.user_id,
                    asana_id: video?.video?.id,
                    playlist_id: null,
                },
            })
                .then((res) => {})
                .catch((err) => {})

            // starting interval timer to flush watch duration buffer
            flushTimeInterval.current = setInterval(() => {
                flushWatchTimeBuffer(user?.user_id)
            }, 10000)

            // starting interval timer to commit time
            commitTimeInterval.current = setInterval(() => {
                // TODO : fix this
                updateWatchTimeBuffer({
                    user_id: user?.user_id,
                    asana_id: video?.video?.id,
                    playlist_id: null,
                    currentTime: playerRef.current.currentTime,
                })
                addToCommittedTs(playerRef.current?.currentTime)
            }, 5000)
        } else {
            if (flushTimeInterval.current) {
                clearInterval(flushTimeInterval.current)
            }

            if (commitTimeInterval.current) {
                clearInterval(commitTimeInterval.current)
            }
        }
    }, [isActive, enableWatchHistory])

    // when theres a pause or play, the state is shown for 300ms
    useEffect(() => {
        let t

        if (
            (videoState === STATE_VIDEO_PLAY ||
                videoState === STATE_VIDEO_PAUSED) &&
            playerRef?.current?.currentTime > 1
        ) {
            setVideoStateVisible(true)

            t = setTimeout(() => {
                setVideoStateVisible(false)
            }, 300)
        }

        return () => {
            if (t) {
                clearTimeout(t)
            }
        }
    }, [videoState, setVideoStateVisible])

    const videoId = useMemo(() => {
        const v =
            video?.video?.asana_videoID || video?.video?.transition_video_ID
        // console.log("Recomputing video id cuz video changed?!?!?!", v);
        return v
    }, [video])

    return (
        <div
            className={`w-full h-full ${isActive ? 'block' : 'hidden'}`}
            // initial={{
            // 	opacity: 0,
            // 	transition: { duration: isActive ? 0.2 : 0.5, ease: "linear" },
            // }}
            // animate={{
            // 	opacity: isActive ? 1 : 0,
            // 	transition: { duration: 0.2, ease: "easeInOut" },
            // }}
            // exit={{
            // 	opacity: 0,
            // 	transition: {
            // 		duration: 0.2,
            // 		ease: "easeInOut",
            // 	},
            // }}
        >
            <Stream
                streamRef={playerRef}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                src={videoId}
                startTime={0}
                preload="auto"
                onEnded={handleEnd}
                onLoadStart={() => {
                    console.log(
                        'Loading start ----------------------------->',
                        video?.queue_id
                    )
                }}
                onLoadedData={() => {
                    console.log(
                        'First frame ready ---------------------->',
                        video?.queue_id
                    )
                }}
                onStalled={() => {
                    console.log(
                        'Stalled ----------------------------->',
                        video?.queue_id
                    )
                    if (isActive) handleLoading(true)
                }}
                onCanPlay={() => {
                    console.log(
                        'Can play ----------------------------->',
                        video?.queue_id
                    )
                    if (isActive) handleLoading(false)
                }}
                onSeeking={() => {
                    if (isActive) handleLoading(true)
                }}
                onSeeked={() => {
                    if (isActive) handleLoading(false)
                }}
                onError={() => {
                    if (isActive) handlePlaybackError()
                }}
                onLoadedMetaData={() => {
                    setMetadataLoaded(true)
                }}
            />
        </div>
    )
}

export default StreamStackItem
