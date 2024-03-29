import { Input, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import jsonData from "../../content-management/forms/r2_uploads.json";

function RegisterForm({ vidName, dashUrl, onSubmit }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    toast("Adding new asana, kindly wait!");
    formData.asana_dash_url = dashUrl;
    try {
      const response = await Fetch({
        url: "/content/video/addAsana",
        method: "POST",
        data: formData,
      });
      if (response?.status === 200) {
        toast("New Asana added successfully");
      } else {
        console.log("Failed to add new Asana");
      }
    } catch (error) {
      toast("Error while making the request:", error);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const formData = getFormData(e);
  //   toast("Adding new transition, kindly wait!");
  //   formData.transition_dash_url = dashUrl;
  //   try {
  //     const response = await Fetch({
  //       url: "/content/video/addTransition",
  //       method: "POST",
  //       data: formData,
  //     });
  //     if (response?.status === 200) {
  //       toast("New Transition added successfully");
  //     } else {
  //       console.log("Failed to add new Transition");
  //     }
  //   } catch (error) {
  //     toast("Error while making the request:", error);
  //   }
  // };

  const handleDifficulty = (val) => {
    setAsanaDifficulty(val);
  };
  const [asana_difficulty, setAsanaDifficulty] = useState(null);

  return (
    <form
      className="flex flex-col gap-1 border-2 w-full p-4 rounded-md mx-auto bg-white"
      onSubmit={handleSubmit}
    >
      <Text h6>Register New Video</Text>
      <br />

      <Input width="100%" name="transition_video_name">
        Transition Name
      </Input>

      <Input
        width="100%"
        name="transition_dash_url"
        value={dashUrl}
        disabled={true}
      >
        DASH URL
      </Input>

      <Input width="100%" name="ai_transition">
        AI Transition (true/false)
      </Input>

      <Input width="100%" name="non_ai_transition">
        NON AI Transition (true/false)
      </Input>

      <Input width="100%" name="asana_category_start">
        Asana Category Start
      </Input>

      <Input width="100%" name="asana_category_end">
        Asana Category End
      </Input>

      <Input width="100%" name="language">
        Language
      </Input>

      <Input width="100%" name="person_starting_position">
        Person Front/Left
      </Input>

      <Input width="100%" name="person_ending_position">
        Person Front/Left
      </Input>

      <Input width="100%" name="mat_starting_position">
        Mat Front/Side
      </Input>

      <Input width="100%" name="mat_ending_position">
        Mat Front/Side
      </Input>

      <Input width="100%" name="going_to_relax">
        Going to Relax?
      </Input>

      <Input width="100%" name="coming_from_relax">
        Coming from Relax?
      </Input>

      <Input width="100%" name="teacher_mode">
        Teacher Mode (true/false)
      </Input>

      <button type="submit">Register</button>
    </form>
  );

  // return (
  //   <form
  //     className="flex flex-col gap-1 border-2 w-full p-4 rounded-md mx-auto bg-white"
  //     onSubmit={handleSubmit}
  //   >
  //     <Text h6>Register New Video</Text>
  //     <br />

  //     <Input width="100%" name="asana_name">
  //       Asana Name
  //     </Input>

  //     <Input width="100%" name="asana_category">
  //       Category
  //     </Input>

  //     <Input width="100%" name="asana_dash_url" value={dashUrl} disabled={true}>
  //       DASH URL
  //     </Input>

  //     <Input width="100%" name="ai_asana">
  //       AI Asana (true/false)
  //     </Input>

  //     <Input width="100%" name="non_ai_asana">
  //       NON AI Asana (true/false)
  //     </Input>

  //     <Input width="100%" name="teacher_mode">
  //       Teacher Mode (true/false)
  //     </Input>

  //     <Input width="100%" name="asana_withAudio">
  //       Asana With Audio (true/false)
  //     </Input>

  //     <Input width="100%" name="muted">
  //       Muted (true/false)
  //     </Input>

  //     <Input width="100%" name="counter">
  //       Counter (true/false)
  //     </Input>

  //     <Input width="100%" name="nobreak_asana">
  //       No Break Asana true/false
  //     </Input>

  //     <Text h6>Type</Text>
  //     <Input width="100%" name="asana_type">
  //       Single/Combination
  //     </Input>

  //     <Text h6>Asana Difficulty</Text>
  //     <Select
  //       multiple
  //       placeholder="Choose Difficulty"
  //       onChange={handleDifficulty}
  //       name="asana_difficulty"
  //     >
  //       <Select.Option key="Beginner" value="Beginner">
  //         Beginner
  //       </Select.Option>
  //       <Select.Option key="Intermediate" value="Intermediate">
  //         Intermediate
  //       </Select.Option>
  //       <Select.Option key="Advanced" value="Advanced">
  //         Advanced
  //       </Select.Option>
  //     </Select>

  //     <Input width="100%" name="language">
  //       Language
  //     </Input>

  //     <Input width="100%" name="person_ending_position">
  //       Person Front/Left
  //     </Input>

  //     <Input width="100%" name="person_starting_position">
  //       Person Front/Left
  //     </Input>

  //     <Input width="100%" name="mat_ending_position">
  //       Mat Front/Side
  //     </Input>

  //     <Input width="100%" name="mat_starting_position">
  //       Mat Front/Side
  //     </Input>

  //     <Input width="100%" name="asana_stithi_end">
  //       Stithi/Relax END
  //     </Input>

  //     <Input width="100%" name="asana_stithi_start">
  //       Stithi/Relax START
  //     </Input>

  //     <button type="submit">Register</button>
  //   </form>
  // );
}

function AutomaticRegister() {
  const [asanas, setAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [notInMongoVideos, setNotInMongoVideos] = useState([]);

  useEffect(() => {
    Fetch({
      url: "/content/video/getAllAsanas",
      method: "GET",
    })
      .then((res) => {
        setAsanas(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    Fetch({
      url: "/content/video/getAllTransitions",
      method: "GET",
    })
      .then((res) => {
        setTransitions(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const notInMongo = [];
    for (const entry in jsonData) {
      const vidName = jsonData[entry]["Name"];
      let dashUrl = "";
      if (vidName !== "") {
        dashUrl = `https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev/${vidName}/stream.mpd`;
      }
      let asana_found = false;
      let transition_found = false;

      if (asanas.length > 0) {
        for (const asana of asanas) {
          if (
            asana.asana_dash_url &&
            dashUrl !== "" &&
            dashUrl === asana.asana_dash_url
          ) {
            asana_found = true;
            break;
          }
        }
      }
      if (!asana_found && transitions.length > 0) {
        for (const transition of transitions) {
          if (
            transition.transition_dash_url &&
            dashUrl !== "" &&
            dashUrl === transition.transition_dash_url
          ) {
            transition_found = true;
            break;
          }
        }
      }

      if (!asana_found && !transition_found) {
        notInMongo.push({ vidName, dashUrl });
      }
    }
    setNotInMongoVideos(notInMongo);
  }, [asanas, transitions]);

  const handleRegister = (vidName) => {
    console.log("Registering:", vidName);
    // Add your registration logic here
  };

  return (
    <div>
      {notInMongoVideos.map(({ vidName, dashUrl }) => (
        <div key={vidName}>
          <Text h3>{vidName}</Text>
          <Text>{dashUrl}</Text>
          <RegisterForm
            vidName={vidName}
            dashUrl={dashUrl}
            onSubmit={() => handleRegister(vidName)}
          />
        </div>
      ))}
      {notInMongoVideos.length === 0 && <Text h3>Automatic Register!!</Text>}
    </div>
  );
}

export default AutomaticRegister;
