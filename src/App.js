import "./App.css";
import React from "react";
import Playlist from "./components/Sidebar/Playlist";
import VideoPlayer from "./components/Video/VideoPlayer";
import VideoControls from "./components/Video/VideoControls";
import PageWrapper from "./components/Common/PageWrapper";

function App() {
  return (
    <PageWrapper>
      <VideoPlayer />
      <VideoControls />
      <Playlist />
    </PageWrapper>
  );
}

export default App;
