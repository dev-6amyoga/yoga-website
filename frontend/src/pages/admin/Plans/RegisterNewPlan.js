import { useState } from "react";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { Button, Input, Card, Text, Select, Checkbox } from "@geist-ui/core";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function RegisterNewPlan() {
  const navigate = useNavigate();
  const [isChecked, setChecked] = useState(true);
  const notify = (x) => toast(x);

  const handleCheckboxChange = () => {
    setChecked(!isChecked);
    console.log(!isChecked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const plan_name = document.querySelector("#plan_name").value;
    const playlist_6am = 1;
    const instituteplaylist_count = document.querySelector(
      "#institute_playlist_count"
    ).value;
    const institute_playlist_creation = isChecked ? 1 : 0;
    const teacher_count = document.querySelector("#teacher_count").value;
    const new_plan = {
      name: plan_name,
      has_basic_playlist: playlist_6am,
      playlist_creation_limit: instituteplaylist_count,
      number_of_teachers: teacher_count,
      has_self_audio_upload: selfVoiceStatus,
      has_playlist_creation: institute_playlist_creation,
      plan_user_type: userType,
      plan_validity: 0,
    };

    try {
      const response = await fetch("http://localhost:4000/plan/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(new_plan),
      });
      if (response.ok) {
        notify("New Plan added successfully");
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      } else {
        const errorData = await response.json();
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const [selfVoiceStatus, setSelfVoiceStatus] = useState(true);
  const handler = (value) => {
    setSelfVoiceStatus(value);
  };
  const [userType, setUserType] = useState("");
  const handler1 = (value) => {
    setUserType(value);
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
          <Checkbox
            id="institute_playlist_creation"
            checked={isChecked}
            onChange={handleCheckboxChange}
          >
            Allow Playlist Creation
          </Checkbox>

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
          <Text h5>User Type</Text>
          <Select placeholder="institute" onChange={handler1} id="user_type">
            <Select.Option value="student"> Student </Select.Option>
            <Select.Option value="institute"> Institute </Select.Option>
          </Select>
          <Button htmlType="submit">Submit</Button>
        </form>
      </div>
      <div>
        <ToastContainer />
      </div>
    </div>
  );
}
