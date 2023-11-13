import usePlaylistStore from '../../store/PlaylistStore';
import useVideoStore from '../../store/VideoStore';
import asanas from '../../data/asanas.json'
import { STATE_VIDEO_PLAY, STATE_VIDEO_PAUSED } from '../../store/VideoStore';
import { useEffect } from 'react';

export default function VideoControls() {
    const queue = usePlaylistStore((state) => state.queue);
    let popFromQueue = usePlaylistStore((state) => state.popFromQueue);
    let popFromArchive = usePlaylistStore((state) => state.popFromArchive);

    let playlistState = useVideoStore(state => state.playlistState)
    let setPlaylistState = useVideoStore(state => state.setPlaylistState)
    let currentVideoID = useVideoStore(state => state.currentVideoID)
    let setCurrentVideoID = useVideoStore(state => state.setCurrentVideoID)
    let videoState = useVideoStore(state => state.videoState)
    let setVideoState = useVideoStore(state => state.setVideoState)

    useEffect(() => {
        // console.log("QUEU changed", queue)
        if (queue && queue.length > 0 && playlistState) {
            setCurrentVideoID(asanas[queue[0]].asana.videoID)
        } else {
            setCurrentVideoID(null)
        }
    }, [queue])

    const handlePlay = () => {
        /*
        -- if currentVideo is null then play (video starts)
        -- else if video is running, pause. if video not running(paused), play
        */

        if (currentVideoID === null && queue.length > 0) {
            // console.log("Starting to play the playlist")
            // console.log("Starting with video ID", asanas[queue[0]].asana.videoID)
            setPlaylistState(true)
            setCurrentVideoID(asanas[queue[0]].asana.videoID)
        }
        else if (currentVideoID === null && queue.length === 0){
            setPlaylistState(false)
            //console.log("empty queue??")
        }
        else{
            //console.log("in queue somewhere")
        }
        setVideoState(STATE_VIDEO_PLAY)
        // console.log("Handle Play")
    }

    const handlePause = () => {
        /*
        -- if playing pause it
        */
       
        setVideoState(STATE_VIDEO_PAUSED)
         //console.log("Handle Pause")
    }

    const handleNextVideo = () => {
        // remove from queue add to archive
        // console.log("first was : ", queue)
        popFromQueue(0);
    }


    return (
        <div className="border border-b-500 flex gap-2 items-center justify-center">
            <button
                className="border-2 border-black"
                onClick={() => {
                    popFromArchive(-1);
                }}>
                Previous
            </button>

            <button
                className="border-2 border-black"
                onClick={() => {
                    if (videoState === STATE_VIDEO_PLAY) {
                        handlePause()
                    } else {
                        handlePlay()
                    }
                }}>
                {videoState === STATE_VIDEO_PLAY ? "PAUSE" : "PLAY"}
            </button>

            <button
                className="border-2 border-black"
                onClick={handleNextVideo}>
                Next
            </button>
        </div>
    );
}
