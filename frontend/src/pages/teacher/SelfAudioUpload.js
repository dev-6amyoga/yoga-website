import { Button } from "@geist-ui/core";
import React from "react";
import useUserStore from "../../store/UserStore";
import { useCallback, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";
import YouTube from "react-youtube";

import TeacherNavbar from "../../components/Common/TeacherNavbar/TeacherNavbar";
export default function SelfAudioUpload() {
  const notify = (x) => toast(x);
  const [currentVideoId, setCurrentVideoId] = useState("");
  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true,
    },
    (err) => console.table(err)
  );
  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
  };

  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
    },
  };
  const [player, setPlayer] = useState(null);

  const saveTarget = (e) => {
    setPlayer(e.target);
  };
  const iChanged = (s) => {
    console.log(s);
  };
  const handleEnd = () => {
    console.log(0);
  };

  let user = useUserStore((state) => state.user);
  return (
    <div>
      <ToastContainer />
      <div>
        <TeacherNavbar />
      </div>
      <h1>Self Audio Upload</h1>
      <div
        className="bg-yblue-100 grid place-items-center aspect-video rounded-xl overflow-hidden border px-50"
        style={{ width: "800px", height: "400px" }}
      >
        {currentVideoId ? (
          <div className="w-full h-full border">
            <YouTube
              className="w-full border h-full"
              iframeClassName="w-full h-full"
              videoId={currentVideoId}
              opts={videoOptions}
              onEnd={handleEnd}
              onReady={saveTarget}
              onStateChange={iChanged}
              onPlay={() => {}}
              onPause={() => {}}
            />
          </div>
        ) : (
          <p className="text-lg">NO VIDEO PLAYING</p>
        )}
      </div>
      <div>
        <AudioRecorder
          onRecordingComplete={(blob) => addAudioElement(blob)}
          recorderControls={recorderControls}
          // downloadOnSavePress={true}
          // downloadFileExtension="mp3"
          showVisualizer={true}
        />
        <button onClick={recorderControls.stopRecording}></button>
      </div>
    </div>
  );
}
