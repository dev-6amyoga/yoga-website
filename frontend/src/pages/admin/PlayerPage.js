// import PageWrapper from "../../components/Common/PageWrapper";
import { useEffect, useState } from "react";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import ShakaVideo from "../testing/ShakaVideo";
function PlayerPage() {
  const [position, setPosition] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setPosition((prevPosition) => (prevPosition + 1) % 100);
  //   }, 100);

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <AdminPageWrapper heading="Video Player">
      <br />
      <br />
      <div className="mx-auto max-w-7xl">
        {/* <WebcamComponent
          width={640}
          height={480}
          drawKeypoints={drawKeypoints}
          drawSkeleton={drawSkeleton}
        />

        {/* <div className="my-10">
          <VideoPlayerWrapper />
          <hr />
          <Playlist />
        </div> */}
        <ShakaVideo />
      </div>
    </AdminPageWrapper>
  );
}

export default PlayerPage;
