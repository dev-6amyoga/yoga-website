import { Button, Note } from "@geist-ui/core";
import React, { useEffect, useState } from "react";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
import VideoPlayerWrapper from "../../components/Video/VideoPlayerWrapper";
import YouTube from "react-youtube";
export default function FreeVideos() {
  const [planId, setPlanId] = useState(0);
  const [currentVideoId, setCurrentVideoId] = useState("");
  let user = useUserStore((state) => state.user);
  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
    },
  };
  const [player, setPlayer] = useState(null);

  const saveTarget = (e) => {
    // setting event target to gain control on player
    setPlayer(e.target);

    // get markers for current video
    // setMarker(asanas[queue[0]].asana.markers);

    // set duration

    // start timer for duration

    // check marker every second
  };

  const iChanged = (s) => {
    console.log(s);
  };
  const handleEnd = () => {
    console.log("the end");
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-plan/get-user-plan-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user?.user_id }),
          }
        );
        const data = await response.json();
        if (data["userPlan"]) {
          setPlanId(data["userPlan"]["plan_id"]);
        } else {
          console.log(data["error"]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      <div className="flex">
        <div className="flex flex-col items-start gap-2 p-6 bg-gray-500 text-white mt-10 mx-5 rounded-md">
          <Button
            onClick={() => setCurrentVideoId("jYIE9dtfmr8")}
            className="mb-2"
            width="100%"
          >
            Yoga to improve bowel movements
          </Button>
          <Button
            onClick={() => setCurrentVideoId("iRFQyZa-L6A")}
            className="mb-2"
            width="100%"
          >
            Try this to know your BMI!
          </Button>
          <Button
            onClick={() => setCurrentVideoId("MLXrRYpbskg")}
            className="mb-2"
            width="100%"
          >
            Improve Lung Capacity through yoga
          </Button>
          <Button
            onClick={() => setCurrentVideoId("sIT1RyjWgJM")}
            className="mb-2"
            width="100%"
          >
            Slow down and reduce stress
          </Button>
          <Button
            onClick={() => setCurrentVideoId("20fvnDTOkRg")}
            className="mb-2"
            width="100%"
          >
            Yoga for eyes
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("hRD0coM5esM")}
            className="mb-2"
            width="100%"
          >
            Benefits of sweating
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("EYe_w4HlRoo")}
            className="mb-2"
            width="100%"
          >
            Easy Headstand
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("CojVgFpvFlw")}
            className="mb-2"
            width="100%"
          >
            Dont cut nails at night
          </Button>
          <Button
            onClick={() => setCurrentVideoId("CP8HZllEO_s")}
            className="mb-2"
            width="100%"
          >
            Ujjayi Pranayama
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("JMdWiSQ4cXE")}
            className="mb-2"
            width="100%"
          >
            Weight Loss Yoga
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("odFz9kG3BaM")}
            className="mb-2"
            width="100%"
          >
            Why chant Om
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("GsBv5kuTAug")}
            className="mb-2"
            width="100%"
          >
            Improve back posture
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("vKn5-2vusMc")}
            className="mb-2"
            width="100%"
          >
            OM or AUM
          </Button>{" "}
          <Button
            onClick={() => setCurrentVideoId("sFmxJtjb43Y")}
            className="mb-2"
            width="100%"
          >
            Master Class 16Dec23
          </Button>
        </div>
        <div className="flex flex-col items-center p-6 rounded-md bg-gray-200 shadow-md max-w-[1000px] mx-auto mt-10">
          <h1 className="text-4xl font-bold mb-4">Free Videos</h1>
          <div className="max-w-[1200px] mx-auto mt-5 overflow-hidden rounded-md">
            {/* YouTube player */}
            <YouTube
              className="w-[1000px] h-[600px]"
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
        </div>
      </div>
    </div>
  );
}
