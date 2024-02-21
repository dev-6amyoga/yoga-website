import { Button } from '@geist-ui/core'
import { useEffect, useState } from 'react'
import usePlaylistStore from '../../store/PlaylistStore'
import QueueItem from './QueueItem'

function VideoQueue() {
    const queue = usePlaylistStore((state) => state.queue)
    const popFromQueue = usePlaylistStore((state) => state.popFromQueue)
    const moveUpQueue = usePlaylistStore((state) => state.moveUpQueue)
    const moveDownQueue = usePlaylistStore((state) => state.moveDownQueue)
    const clearQueue = usePlaylistStore((state) => state.clearQueue)

    const [customerCode, setCustomerCode] = useState('')

    useEffect(() => {
        setCustomerCode(process.env.REACT_APP_CLOUDFLARE_CUSTOMER_CODE)
    }, [])

    return (
        <div className="col-start-7 col-span-2 bg-blue-50 rounded-xl h-full max-h-[50vh] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-2 items-center overflow-hidden">
                <h3 className="text-center pt-2">Queue</h3>
                <Button auto type="secondary" onClick={clearQueue}>
                    Clear Queue
                </Button>
                {queue.length === 0 ? (
                    <p className="text-center">No videos in queue</p>
                ) : (
                    <div className="p-2 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-hidden">
                        {queue.map((queue_item, idx) => {
                            return (
                                <QueueItem
                                    key={queue_item.queue_id}
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

export default VideoQueue
