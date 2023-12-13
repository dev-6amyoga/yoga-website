import React from "react";
import { Note } from "@geist-ui/core";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import PageWrapper from "../../components/Common/PageWrapper";
import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/Video/VideoPlayerWrapper";
import VideoQueue from "../../components/Video/VideoQueue";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";

function StudentHome() {
  let user = useUserStore((state) => state.user);
  const [userPlan, setUserPlan] = useState({});
  const [planId, setPlanId] = useState(0);
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
            body: JSON.stringify({ user_id: user.user_id }),
          }
        );
        const data = await response.json();
        setUserPlan(data["userPlan"]);
        setPlanId(data["userPlan"]["plan_id"]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-col justify-center">
      <StudentNavbar />
      {/* <div>Welcome {user.name}!</div> */}
      <br />
      <br />
      {/* Add a check here to display the note only if the user is not a paid member */}
      <div className="px-20">
        {planId === 0 && (
          <Note type="error" label="Note" filled width={100}>
            Please purchase a subscription to unlock all features!.
          </Note>
        )}
      </div>
      <br />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-7 gap-4 my-10">
          <VideoPlayerWrapper />
          <VideoQueue />
        </div>
        <hr />
        <div className="my-10">
          <Playlist />
        </div>
      </div>
    </div>
  );
}

export default StudentHome;
