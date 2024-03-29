// import PageWrapper from "../../components/Common/PageWrapper";
import { useEffect, useState } from "react";
import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";

function PlayerPage() {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prevPosition) => (prevPosition + 1) % 100);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <AdminPageWrapper heading="Video Player">
      <br />
      <br />
      <div className="mx-auto max-w-7xl">
        <div className="my-10">
          <VideoPlayerWrapper />
          <hr />
          <Playlist />
        </div>
      </div>
    </AdminPageWrapper>
  );
}

export default PlayerPage;
