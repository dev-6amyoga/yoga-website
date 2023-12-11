import React from "react";
import { Note, Grid, Card, Button, Spacer } from "@geist-ui/core";
import { User } from "@geist-ui/icons";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import PageWrapper from "../../components/Common/PageWrapper";
import Playlist from "../../components/Sidebar/Playlist";
import VideoPlayerWrapper from "../../components/Video/VideoPlayerWrapper";
import VideoQueue from "../../components/Video/VideoQueue";
import useUserStore from "../../store/UserStore";

function StudentHome() {
  let user = useUserStore((state) => state.user);
  return (
    <div className="flex-col justify-center">
      <StudentNavbar />
      {/* <div>Welcome {user.name}!</div> */}
      <br />
      <br />
      {/* Add a check here to display the note only if the user is not a paid member */}
      <div className="px-20">
        <Note type="error" label="Note" filled width={100}>
          Please purchase a subscription to unlock all features!.
        </Note>
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
