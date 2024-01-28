import { Card, Text, Link, Input, Textarea, Button } from "@geist-ui/core";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import getFormData from "../../utils/getFormData";
import { validateEmail, validatePhone } from "../../utils/formValidation";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import React, { useEffect, useState } from "react";

export default function AboutUs() {
  const videoOptions = {
    playerVars: {
      autoplay: 1,
      controls: 1,
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
    console.log("the end");
  };
  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      <div className="flex flex-row justify-center">
        <div
          className="flex flex-col items-start gap-2 p-6 bg-gray-500 text-white mt-10 mx-10 rounded-md"
          style={{ width: "500px" }}
        >
          <img
            src={`${process.env.PUBLIC_URL}/yoga.png`}
            alt="Example Image"
            width="500"
            height="400"
          />
          <Card width="100%">
            We focus on propagating hathayoga in its original form with proper
            breath focus & vinyasa processes. With our affiliation to VYASA and
            through our Quality Council of India (QCI) certified teachers, our
            excellence is unmatched! Take our trial class and you will surely
            join our online & studio classes.
          </Card>
        </div>
        <div className="flex flex-col items-center p-6 rounded-md bg-gray-200 shadow-md mt-10 mx-10">
          <h1 className="text-4xl font-bold mb-4">
            <YouTube
              className="w-[600px] h-[400px]"
              iframeClassName="w-full h-full"
              videoId="JMdWiSQ4cXE"
              opts={videoOptions}
              onEnd={handleEnd}
              onReady={saveTarget}
              onStateChange={iChanged}
              onPlay={() => {}}
              onPause={() => {}}
            />
          </h1>
          {/* <div className="mt-5 overflow-hidden rounded-md">
            <Card width="100%" type="dark">
              <Card.Footer>About Us</Card.Footer>
            </Card>
          </div> */}
        </div>
        {/* <div className="flex flex-col items-right p-6 rounded-md bg-gray-200 shadow-md mt-10 mx-10">
          <h1 className="text-3xl font-bold mb-4">Submit your queries here!</h1>
          <div className="mt-5 overflow-hidden rounded-md">
            <Card width="100%"></Card>
          </div>
        </div> */}
      </div>
    </div>
  );
}
