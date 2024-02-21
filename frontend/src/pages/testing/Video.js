import { useEffect } from 'react'
import Playlist from '../../components/Sidebar/Playlist'
import VideoInfo from '../../components/StackVideo/VideoInfo'
import VideoPlayer from '../../components/StackVideo/VideoPlayer'
import VideoQueue from '../../components/StackVideo/VideoQueue'
import useWatchHistoryStore from '../../store/WatchHistoryStore'

export default function TestingVideo() {
    const setEnableWatchHistory = useWatchHistoryStore(
        (state) => state.setEnableWatchHistory
    )

    useEffect(() => {
        setEnableWatchHistory(false)
    }, [setEnableWatchHistory])

    return (
        <div className="max-w-7xl mx-auto my-20">
            <div className="flex flex-col md:grid md:grid-cols-6 gap-2 grid-rows-2">
                <div className="col-span-5 row-span-1">
                    <VideoPlayer />
                </div>
                <div className="col-span-1 row-span-1">
                    <VideoQueue />
                </div>
                <div className="col-span-6 row-span-1 h-auto">
                    <VideoInfo />
                </div>
            </div>
            <Playlist />
        </div>
    )
}
