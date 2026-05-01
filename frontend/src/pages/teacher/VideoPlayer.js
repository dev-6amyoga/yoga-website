// import PageWrapper from "../../components/Common/PageWrapper";
import { useEffect, useState } from "react";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
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
    <TeacherPageWrapper heading="Video Player">
      <br />
      <br />
      <div className="mx-auto max-w-7xl">
        <ShakaVideo />
      </div>
    </TeacherPageWrapper>
  );
}

export default PlayerPage;
