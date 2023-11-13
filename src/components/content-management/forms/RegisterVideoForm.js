import { Input, Text, Button, Radio, ButtonDropdown } from "@geist-ui/core";
import { useState, useEffect } from "react";
import PopUpDialog from "../../Common/PopUp/PopUp";

export default function RegisterVideoForm() {
  const [message1] = useState(
    "Do you want to proceed with the following updates?"
  );
  const [message2, setMessage2] = useState("");
  const handleMessage2Change = (x) => {
    setMessage2(x);
  };
  const [message3, setMessage3] = useState("");
  const handleMessage3Change = (x) => {
    setMessage3(x);
  };
  const [message4, setMessage4] = useState("");
  const handleMessage4Change = (x) => {
    setMessage4(x);
  };
  const [message5, setMessage5] = useState("");
  const handleMessage5Change = (x) => {
    setMessage5(x);
  };
  const [message6, setMessage6] = useState("");
  const handleMessage6Change = (x) => {
    setMessage6(x);
  };
  const [message7, setMessage7] = useState("");
  const handleMessage7Change = (x) => {
    setMessage7(x);
  };
  let updateNeeded = false;
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleOpenPopUp = () => {
    setIsPopUpOpen(true);
  };
  const handleClosePopUp = () => {
    setIsPopUpOpen(false);
  };
  const handleYes = () => {
    updateNeeded = true;
    console.log("FROM POP UP ", updateNeeded);
    handleClosePopUp();
  };
  const handleNo = () => {
    updateNeeded = false;
    console.log("FROM POP UP ", updateNeeded);
    handleClosePopUp();
  };
  const [withAudio, setWithAudio] = useState(true);
  const withAudioHandler = (val) => {
    setWithAudio(val);
    console.log(val);
  };
  const [admin, setAdmin] = useState(true);
  const adminHandler = (val) => {
    setAdmin(val);
    console.log(val);
  };

  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/content/video/getAllAsanas")
      .then((response) => response.json())
      .then((asanas) => {
        setData(asanas);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const presentAlready = () => {
    console.log(data);
    if (admin) {
      const asanaName = document.querySelector("#asana_name").value;
      const description = document.querySelector("#asana_description").value;
      const category = document.querySelector("#asana_category").value;
      const videoURL = document.querySelector("#asana_url").value;
      const language = document.querySelector("#asana_language").value;
      let uniqueCount = 0;
      let totalCount = 0;
      let updateDesc = false;
      let updateCat = false;
      let updateLink = false;
      let updateAudio = false;
      let updateLanguage = false;
      for (var sub_asana in data) {
        console.log(sub_asana);
        totalCount = totalCount + 1;
        if (data[sub_asana]["asana_name"] === asanaName) {
          console.log("found");
          if (
            data[sub_asana]["asana_desc"] === description &&
            data[sub_asana]["asana_category"] === category &&
            data[sub_asana]["language"] === language &&
            data[sub_asana]["asana_videoID"] === videoURL &&
            data[sub_asana]["asana_withAudio"] === withAudio
          ) {
            console.log("all details are the same! no changes to be made.");
          } else {
            if (data[sub_asana]["asana_desc"] !== description) {
              updateDesc = true;
            }
            if (data[sub_asana]["asana_category"] !== category) {
              updateCat = true;
            }
            if (data[sub_asana]["asana_videoID"] !== videoURL) {
              updateLink = true;
            }
            if (data[sub_asana]["asana_withAudio"] !== withAudio) {
              updateAudio = true;
            }
            if (data[sub_asana]["language"] !== language) {
              updateLanguage = true;
            }
          }
        } else {
          uniqueCount = uniqueCount + 1;
        }
      }
      if (uniqueCount === totalCount) {
        console.log("totally new asana to be inserted into db");
      } else {
        handleMessage2Change(asanaName);
        if (updateDesc === true) {
          handleMessage3Change(
            "Description from :" +
              data[sub_asana]["asana_desc"] +
              " to : " +
              description
          );
        }
        if (updateCat === true) {
          handleMessage4Change(
            "Asana Category from : " +
              data[sub_asana]["asana_category"] +
              " to : " +
              category
          );
        }
        if (updateLink === true) {
          handleMessage5Change(
            "Asana URL from : " +
              data[sub_asana]["asana_videoID"] +
              " to : " +
              videoURL
          );
        }
        if (updateAudio === true) {
          handleMessage6Change(
            "Change Audio Presence from : " +
              data[sub_asana]["asana_withAudio"] +
              " to : " +
              withAudio
          );
        }
        if (updateLanguage === true) {
          handleMessage7Change(
            "Change Language from : " +
              data[sub_asana]["language"] +
              " to : " +
              language
          );
        }
        handleOpenPopUp();
      }
    } else {
      console.log("not admin!");
    }
  };

  const markerNavigate = () => {
    const asanaName = document.query4Selector("#asana_name").value;
    const description = document.querySelector("#asana_description").value;
    const category = document.querySelector("#asana_category").value;
    const language = document.querySelector("#asana_language").value;
    const videoURL = document.querySelector("#asana_url").value;
    if (
      asanaName === "" ||
      description === "" ||
      category === "" ||
      videoURL === "" ||
      withAudio === "" ||
      language === ""
    ) {
      alert("something is empty");
    } else {
      console.log("marker");
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    presentAlready();
    const asanaName = document.querySelector("#asana_name").value;
    const description = document.querySelector("#asana_description").value;
    const category = document.querySelector("#asana_category").value;
    const language = document.querySelector("#asana_language").value;
    const videoURL = document.querySelector("#asana_url").value;
    console.log("withAudio?", withAudio);
    console.log("Admin?", admin);
    console.log("Asana Name:", asanaName);
    console.log("Description:", description);
    console.log("Category:", category);
    console.log("Video URL:", videoURL);
    console.log("Language : ", language);
  };

  return (
    <div>
      <Text h1>Register Video</Text>
      <form
        className="flex flex-col gap-1 border-2 max-w-3xl p-4 rounded-md mx-auto"
        onSubmit={handleSubmit}
      >
        <Text h3>Register Video Form</Text>
        <Input width="100%" id="asana_name">
          Asana Name
        </Input>
        <Input width="100%" id="asana_description">
          Description
        </Input>
        {/* <Textarea placeholder={""}></Textarea> */}
        <Input width="100%" id="asana_category">
          Category
        </Input>
        <Input width="100%" id="asana_url">
          Video URL
        </Input>

        <Text h6>Language</Text>

        <ButtonDropdown>
          <ButtonDropdown.Item main>English</ButtonDropdown.Item>
          <ButtonDropdown.Item>Hindi</ButtonDropdown.Item>
          <ButtonDropdown.Item>Malayalam</ButtonDropdown.Item>
        </ButtonDropdown>

        <Text>With Audio?</Text>
        <Radio.Group
          id="withAudio"
          value={withAudio}
          onChange={withAudioHandler}
        >
          <Radio value="true">Yes</Radio>
          <Radio value="false">No</Radio>
        </Radio.Group>
        <Text>Admin?</Text>
        <Radio.Group id="isAdmin" value={admin} onChange={adminHandler}>
          <Radio value="true">Yes</Radio>
          <Radio value="false">No</Radio>
        </Radio.Group>
        <Button onClick={markerNavigate}>Add Markers</Button>
        {/* <Input width="100%">Image URL</Input> */}
        <Button htmlType="submit">Submit</Button>
        <PopUpDialog
          isOpen={isPopUpOpen}
          onClose={handleClosePopUp}
          onYes={handleYes}
          onNo={handleNo}
          message1={message1}
          message2={message2}
          message3={message3}
          message4={message4}
          message5={message5}
          message6={message6}
          message7={message7}
        />
      </form>
    </div>
  );
}
