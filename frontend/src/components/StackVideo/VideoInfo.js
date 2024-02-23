// import { Code } from "@geist-ui/core";
import { Description } from '@geist-ui/core'
import { useEffect } from 'react'
import { SEEK_TYPE_MARKER } from '../../enums/seek_types'
import { VIDEO_EVENT_MOVING_MARKER } from '../../enums/video_event'
import useVideoStore from '../../store/VideoStore'

export default function VideoInfo() {
    const [
        markers,
        setMarkers,
        currentMarkerIdx,
        setCurrentMarkerIdx,
        addToSeekQueue,
        videoEvent,
        setVideoEvent,
        seekQueue,
        videoState,
        pauseReason,
        currentVideo,
    ] = useVideoStore((state) => [
        state.markers,
        state.setMarkers,
        state.currentMarkerIdx,
        state.setCurrentMarkerIdx,
        state.addToSeekQueue,
        state.videoEvent,
        state.setVideoEvent,
        state.seekQueue,
        state.videoState,
        state.pauseReason,
        state.currentVideo,
    ])

    useEffect(() => {
        if (currentVideo) {
            setCurrentMarkerIdx(0)
            setMarkers(currentVideo?.video?.markers || [])
        }
    }, [currentVideo, setCurrentMarkerIdx, setMarkers])

    // useEffect(() => {
    //     if (
    //         currentMarkerIdx !== null &&
    //         videoEvent === VIDEO_EVENT_MOVING_MARKER
    //     ) {
    //         addToSeekQueue({
    //             t: markers[currentMarkerIdx].timestamp,
    //             type: 'move',
    //         })
    //     }
    // }, [currentMarkerIdx, addToSeekQueue, markers, videoEvent])

    return (
        <div className="">
            <div className="flex w-full gap-4">
                <pre className="flex-1">
                    {JSON.stringify({ seekQueue }, null, 4)}
                </pre>
                <pre className="flex-1">
                    {JSON.stringify(
                        { currentMarkerIdx, videoState, pauseReason },
                        null,
                        4
                    )}
                </pre>
            </div>
            <div className="flex flex-col gap-4 rounded-lg border p-4">
                <Description title="Video Info"></Description>
                {currentVideo ? (
                    <>
                        {/* <Code block>{JSON.stringify(currentVideo, null, 4)}</Code> */}
                        <h3>
                            <span className="text-sm text-zinc-500">
                                {currentVideo?.video?.transition_id
                                    ? 'TRANSITION'
                                    : 'ASANA'}
                            </span>
                            <br />
                            {currentVideo?.video?.asana_name ||
                                currentVideo?.video?.transition_video_name}
                        </h3>
                        <div
                            className={`rounded-2xl border p-4 ${
                                currentVideo?.video?.transition_id
                                    ? 'opacity-0'
                                    : 'opacity-100'
                            }`}
                        >
                            <h5 className="">Markers</h5>
                            <div className="mt-4 flex flex-wrap gap-1">
                                {markers ? (
                                    markers.map((k, idx) => {
                                        return (
                                            <p
                                                key={
                                                    k.timestamp +
                                                    String(currentMarkerIdx)
                                                }
                                                className={`m-0 rounded-full border px-2 py-1 text-sm hover:cursor-pointer ${
                                                    currentMarkerIdx === idx
                                                        ? 'border-amber-500'
                                                        : ''
                                                }`}
                                                onClick={() => {
                                                    // TODO : fix this, bug when you go to previous marker
                                                    console.log(
                                                        'CLICKED MARKER : ',
                                                        idx
                                                    )
                                                    setVideoEvent({
                                                        type: VIDEO_EVENT_MOVING_MARKER,
                                                        markerIdx: idx,
                                                    })
                                                    addToSeekQueue({
                                                        type: SEEK_TYPE_MARKER,
                                                        t: k.timestamp,
                                                        idx: idx,
                                                    })
                                                }}
                                            >
                                                {k.timestamp} : {k.title}{' '}
                                                {k.loop ? '🔁' : ''}
                                            </p>
                                        )
                                    })
                                ) : (
                                    <></>
                                )}
                            </div>
                        </div>

                        <span className="text-sm text-zinc-500">
                            {currentVideo?.video?.transition_id
                                ? ''
                                : 'ASANA DESCRIPTION'}
                        </span>
                        <p>{currentVideo?.video?.asana_desc}</p>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </div>
    )
}
