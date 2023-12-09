import { useState } from "react";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { Button, Input, Card, Text, Select } from "@geist-ui/core";
export default function RegisterNewPlan() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const plan_name = document.querySelector("#plan_name").value;
    const playlist_6am = true;
    const instituteplaylist_count = document.querySelector(
      "#institute_playlist_count"
    ).value;
    const teacher_count = document.querySelector("#teacher_count").value;
    console.log(
      plan_name,
      playlist_6am,
      instituteplaylist_count,
      teacher_count,
      selfVoiceStatus
    );
  };
  const [selfVoiceStatus, setSelfVoiceStatus] = useState(true);
  const handler = (value) => {
    setSelfVoiceStatus(value);
  };

  return (
    <div className="video_form min-h-screen">
      <AdminNavbar />

      <div className="flex items-center justify-center min-h-screen max-w-4xl mx-auto">
        <form
          className="flex flex-col gap-1 border-2 w-full p-4 rounded-md mx-auto bg-white"
          onSubmit={handleSubmit}
        >
          <Text h3>Register New Plan</Text>
          <br />

          <br />
          <Text h5>Plan Name:</Text>
          <Input width="100%" id="plan_name"></Input>
          <br />
          <Text h5>Institute Playlist Count:</Text>
          <Input width="100%" id="institute_playlist_count"></Input>
          <br />
          <Text h5>Self Voice Enabled?</Text>
          <Select placeholder="Yes" onChange={handler} id="self_voice">
            <Select.Option value="Yes"> Yes </Select.Option>
            <Select.Option value="No"> No </Select.Option>
          </Select>

          <Text h5>Teacher Count:</Text>
          <Input width="100%" id="teacher_count"></Input>
          <br />

          <Button htmlType="submit">Submit</Button>
        </form>
      </div>
    </div>
  );
}
