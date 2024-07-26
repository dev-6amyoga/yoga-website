import React, { useState } from "react";
import { ReactMediaRecorder } from "react-media-recorder";

const VideoRecorder = () => {
  const [videoBlob, setVideoBlob] = useState(null);

  const handleStopRecording = (blobUrl, blob) => {
    setVideoBlob(blob);
  };

  const handleUpload = async () => {
    if (!videoBlob) return;

    const formData = new FormData();
    formData.append("file", videoBlob, "recording.mp4");
    console.log(formData);
    // try {
    //   const response = await axios.put(
    //     "https://<your-cloudflare-account-id>.r2.cloudflarestorage.com/<your-bucket-name>/recording.mp4", // Update with your Cloudflare R2 URL
    //     formData,
    //     {
    //       headers: {
    //         "Content-Type": "video/mp4",
    //         Authorization: "Bearer <your-access-token>", // Update with your R2 access token
    //       },
    //     }
    //   );

    //   console.log("Upload successful:", response);
    // } catch (error) {
    //   console.error("Upload failed:", error);
    // }
  };

  return (
    <div>
      <ReactMediaRecorder
        video
        audio
        render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
          <div>
            <p>{status}</p>
            <button onClick={startRecording}>Start Recording</button>
            <button onClick={stopRecording}>Stop Recording</button>
            {mediaBlobUrl && (
              <>
                <video src={mediaBlobUrl} controls />
                <button onClick={handleUpload}>Upload Video</button>
              </>
            )}
          </div>
        )}
        onStop={handleStopRecording}
      />
    </div>
  );
};

export default VideoRecorder;
