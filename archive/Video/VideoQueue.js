import { useState } from 'react'
import { IoRemoveCircleOutline } from 'react-icons/io5'
import { LuMoveDown, LuMoveUp } from 'react-icons/lu'
import usePlaylistStore from '../../store/PlaylistStore'

function QueueItem({ item, idx, pop, moveUp, moveDown, customerCode }) {
    const [hovered, setHovered] = useState(false)
    const [hoverTimeout, setHoverTimeout] = useState(null)
    return (
        <div
            className="flex-shrink-0 flex flex-col gap-2 items-center px-1 py-2 bg-yblue-900 text-white rounded-xl"
            onMouseEnter={() => {
                setHoverTimeout(
                    setTimeout(() => {
                        setHovered(true)
                    }, 2000)
                )
            }}
            onMouseLeave={() => {
                if (hoverTimeout) clearTimeout(hoverTimeout)
                setHoverTimeout(null)
                setHovered(false)
            }}
        >
            {/* <img
        src={`https://customer-${customerCode}.cloudflarestream.com/${
          item?.video?.asana_videoID ?? item?.video?.transition_video_ID
        }/thumbnails/thumbnail.${hovered ? "gif" : "jpg"}?time=1s?height=150?${
          hovered ? "duration=2s" : ""
        }`}
        alt={item?.video?.asana_name ?? item?.video?.transition_name}
        className="h-24 rounded-xl"
      /> */}
            <div className="grid grid-cols-3 md:grid-cols-4">
                <p className="m-0 text-sm col-start-1 col-span-2 md:col-span-3">
                    {item?.video?.asana_name ??
                        item?.video?.transition_video_name}
                </p>
                <div className="flex gap-1 col-start-3 md:col-start-4 col-span-1">
                    <button
                        className="w-5 h-5 md:w-6 md:h-6"
                        onClick={() => moveUp(idx)}
                    >
                        <LuMoveUp className="w-full h-full" />
                    </button>
                    <button
                        className="w-5 h-5 md:w-6 md:h-6"
                        onClick={() => moveDown(idx)}
                    >
                        <LuMoveDown className="w-full h-full" />
                    </button>
                    <button
                        className="w-5 h-5 md:w-6 md:h-6"
                        onClick={() => pop(idx)}
                    >
                        <IoRemoveCircleOutline className="w-full h-full" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function VideoQueue() {
    const queue = usePlaylistStore((state) => state.queue)
    const popFromQueue = usePlaylistStore((state) => state.popFromQueue)
    const moveUpQueue = usePlaylistStore((state) => state.moveUpQueue)
    const moveDownQueue = usePlaylistStore((state) => state.moveDownQueue)

    const customerCode = 'eyxw0l155flsxhz3'
    return (
        <div className="col-start-7 col-span-2 bg-yblue-50 rounded-xl h-full">
            <h3 className="text-center pt-2">Queue</h3>
            <div className="flex flex-col gap-2">
                {queue.length === 0 ? (
                    <p className="text-center">No videos in queue</p>
                ) : (
                    <div className="p-2 flex flex-row md:flex-col gap-2 md:overflow-x-scroll">
                        {queue.map((queue_item, idx) => {
                            return (
                                <QueueItem
                                    key={queue_item + idx}
                                    item={queue_item}
                                    pop={popFromQueue}
                                    moveUp={moveUpQueue}
                                    moveDown={moveDownQueue}
                                    idx={idx}
                                    customerCode={customerCode}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
