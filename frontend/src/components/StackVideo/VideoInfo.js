// import { Code } from "@geist-ui/core";
import { useEffect } from 'react'
import { SEEK_TYPE_MARKER } from '../../enums/seek_types'
import { VIDEO_EVENT_MOVING_MARKER } from '../../enums/video_event'
import useVideoStore from '../../store/VideoStore'

export default function VideoInfo() {
    let currentVideo = useVideoStore((state) => state.currentVideo)

    const [
        markers,
        setMarkers,
        currentMarkerIdx,
        setCurrentMarkerIdx,
        addToSeekQueue,
        videoEvent,
        setVideoEvent,
    ] = useVideoStore((state) => [
        state.markers,
        state.setMarkers,
        state.currentMarkerIdx,
        state.setCurrentMarkerIdx,
        state.addToSeekQueue,
        state.videoEvent,
        state.setVideoEvent,
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
            {currentVideo ? (
                <div className="flex flex-col gap-4 py-4">
                    {/* <Code block>{JSON.stringify(currentVideo, null, 4)}</Code> */}
                    <h3>
                        <span className="text-zinc-500 text-sm">
                            {currentVideo?.video?.transition_id
                                ? 'TRANSITION'
                                : 'ASANA'}
                        </span>
                        <br />
                        {currentVideo?.video?.asana_name ||
                            currentVideo?.video?.transition_video_name}
                    </h3>
                    <div
                        className={`border p-4 rounded-2xl ${
                            currentVideo?.video?.transition_id
                                ? 'opacity-0'
                                : 'opacity-100'
                        }`}
                    >
                        <h5 className="">Markers</h5>
                        <div className="flex gap-1 flex-wrap mt-4">
                            {markers ? (
                                markers.map((k, idx) => {
                                    return (
                                        <p
                                            key={
                                                k.timestamp +
                                                String(currentMarkerIdx)
                                            }
                                            className={`px-2 py-1 border rounded-full m-0 text-sm hover:cursor-pointer ${
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

                    <span className="text-zinc-500 text-sm">
                        {currentVideo?.video?.transition_id
                            ? ''
                            : 'ASANA DESCRIPTION'}
                    </span>
                    <p>{currentVideo?.video?.asana_desc}</p>
                </div>
            ) : (
                <></>
            )}
        </div>
    )
}
