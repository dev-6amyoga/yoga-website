import './Video.css'

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
        <div className="mx-auto my-20 max-w-7xl p-4 xl:p-0">
            <div className="video-grid mb-12 w-full gap-2">
                <div className="video-area">
                    <VideoPlayer />
                </div>
                <div className="queue-area">
                    <VideoQueue />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <VideoInfo />
                <Playlist />
            </div>
        </div>
    )
}
