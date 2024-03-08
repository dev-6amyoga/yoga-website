import './StackVideo.css'
import VideoInfo from './VideoInfo'
import VideoPlayer from './VideoPlayer'
import VideoQueue from './VideoQueue'

export default function VideoPlayerWrapper() {
    return (
        <>
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
            </div>
        </>
    )
}
