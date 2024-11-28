import {
  Button,
  Checkbox,
  Divider,
  Input,
  Select,
  Text,
  ButtonGroup,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import "./RegisterVideoForm.css";
import RegVideoHelper from "./RegVideoHelper";
function RegisterVideoForm() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [asana_category, setAsanaCategory] = useState("");
  const [noBreakAsana, setNoBreakAsana] = useState(false);
  const [asana_type, setAsanaType] = useState("");
  const [asana_difficulty, setAsanaDifficulty] = useState(null);
  const [counter, setCounter] = useState(false);
  const [muted, setMuted] = useState(false);
  const [withAudio, setWithAudio] = useState(false);
  const [tableLanguages, setTableLanguages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [aiTransition, setAiTransition] = useState(false);
  const [nonAiTransition, setNonAiTransition] = useState(false);
  const [drmVideo, setDrmVideo] = useState(null);
  const [personStart, setPersonStart] = useState(null);
  const [personEnd, setPersonEnd] = useState(null);
  const [matStart, setMatStart] = useState(null);
  const [matEnd, setMatEnd] = useState(null);
  const [asanaStithiStart, setAsanaStithiStart] = useState("");
  const [asanaStithiEnd, setAsanaStithiEnd] = useState("");
  const [teacherMode, setTeacherMode] = useState(null);

  const [asanaData, setAsanaData] = useState({
    vibhagiya: false,
    omkara: false,
    catch_waist_start: false,
    catch_waist_end: false,
    nose_lock_start: false,
    nose_lock_end: false,
    chin_lock_start: false,
    chin_lock_end: false,
    eye_close_start: false,
    eye_close_end: false,
    shanmuga_start: false,
    shanmuga_end: false,
    vajra_side: false,
    vajra_start: false,
    vajra_end: false,
    namaskara_start: false,
    namaskara_end: false,
  });

  const hello1 = (value) => {
    console.log(value);
    if (value.includes("true")) {
      setNoBreakAsana(true);
    }
  };

  const hello = (value) => {
    if (value.length === 0) {
      setWithAudio(false);
      setMuted(false);
      setCounter(false);
    }
    if (value.length !== 0) {
      if (value.includes("with_audio")) {
        setWithAudio(true);
      }
      if (value.includes("muted")) {
        setMuted(true);
      }
      if (value.includes("with_timer")) {
        setCounter(true);
      }
    }
  };
  const handleDifficulty = (val) => {
    setAsanaDifficulty(val);
  };

  const handleAsanaStithiStart = (val) => {
    setAsanaStithiStart(val);
  };
  const handleAsanaStithiEnd = (val) => {
    setAsanaStithiEnd(val);
  };
  const handlePersonStart = (val) => {
    setPersonStart(val);
  };
  const handlePersonEnd = (val) => {
    setPersonEnd(val);
  };
  const handleMatStart = (val) => {
    setMatStart(val);
  };
  const handleMatEnd = (val) => {
    setMatEnd(val);
  };
  const handleLanguageChange = (val) => {
    setSelectedLanguage(val);
  };
  const handler4 = (val) => {
    setAsanaCategory(val);
  };
  const handler_type = (val) => {
    setAsanaType(val);
  };

  useEffect(() => {
    Fetch("/content/video/getAllAsanas")
      .then((response) => response.data)
      .then((asanas) => {
        setData(asanas);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/language/getAllLanguages",
        });
        const data = response.data;
        setTableLanguages(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/asana/getAllAsanaCategories",
        });
        const data = response.data;
        setCategories(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const aiSetter = (value) => {
    if (value.length === 0) {
      setAiTransition(false);
      setNonAiTransition(false);
    }
    if (value.length !== 0) {
      if (value.includes("ai_transition")) {
        if (value.length > 1) {
          toast("You cannot select more than 1 checkbox!");
        } else {
          setAiTransition(true);
          setNonAiTransition(false);
        }
      }
      if (value.includes("non_ai_transition")) {
        if (value.length > 1) {
          toast("You cannot select more than 1 checkbox!");
        } else {
          setNonAiTransition(true);
          setAiTransition(false);
        }
      }
      if (value.includes("both")) {
        if (
          value.includes("ai_transition") ||
          value.includes("non_ai_transition")
        ) {
          toast("You cannot select more than 1 checkbox!");
        } else {
          setAiTransition(true);
          setNonAiTransition(true);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const asana_category1 = asana_category;
    const language = selectedLanguage;
    const formData = getFormData(e);
    const additionalData = {
      asana_category: asana_category1,
      language: language,
      asana_type: asana_type,
      asana_difficulty: asana_difficulty,
      nobreak_asana: noBreakAsana,
      asana_withAudio: withAudio,
      person_starting_position: personStart,
      person_ending_position: personEnd,
      mat_starting_position: matStart,
      mat_ending_position: matEnd,
      asana_stithi_start: asanaStithiStart,
      asana_stithi_end: asanaStithiEnd,
      ai_asana: aiTransition,
      non_ai_asana: nonAiTransition,
      drm_video: drmVideo,
      teacher_mode: teacherMode,
    };
    const combinedData = {
      ...formData,
      ...additionalData,
      ...asanaData,
    };
    console.log(combinedData);
    if (
      combinedData.asana_name === "" ||
      combinedData.asana_type === "" ||
      combinedData.asana_category === "" ||
      combinedData.asana_difficulty === "" ||
      combinedData.person_starting_position === null ||
      combinedData.person_ending_position === null ||
      combinedData.mat_starting_position === null ||
      combinedData.mat_ending_position === null
    ) {
      toast("Missing required fields!");
    } else if (withAudio === false && muted === false && counter === false) {
      toast("One or more of the audio options must be selected!");
    } else {
      let toastShown = false;
      for (var i = 0; i !== data.length; i++) {
        if (data[i].asana_name === combinedData.asana_name) {
          if (data[i].language === combinedData.language) {
            if (
              data[i].counter === combinedData.counter &&
              data[i].muted === combinedData.muted &&
              data[i].asana_withAudio === combinedData.asana_withAudio
            ) {
              toast("Asana already exists with the same language!");
              toastShown = true;
            }
          }
        }
      }
      if (toastShown) {
      } else {
        toast("Adding new asana, kindly wait!");
        try {
          const response = await Fetch({
            url: "/content/video/addAsana",
            method: "POST",
            data: combinedData,
          });
          if (response?.status === 200) {
            toast("New Asana added successfully");
            navigate("/admin/video/view-all");
          } else {
            console.log("Failed to add new Asana");
          }
        } catch (error) {
          toast("Error while making the request:", error);
        }
      }
    }
  };

  return (
    <form
      className="flex flex-col gap-1 border-2 p-4 rounded-md mx-auto bg-white"
      onSubmit={handleSubmit}
    >
      <Text h3>Register New Video</Text>
      <Input width="100%" name="asana_name">
        Asana Name
      </Input>
      <Text h6>Category</Text>
      <Select
        placeholder="Choose Category"
        onChange={handler4}
        name="asana_category"
      >
        {categories &&
          categories.map((x) => (
            <Select.Option key={x.asana_category_id} value={x.asana_category}>
              {x.asana_category}
            </Select.Option>
          ))}
      </Select>
      <Text h6>Type</Text>
      <Select
        value={asana_type}
        placeholder="Choose Asana Type"
        onChange={handler_type}
        name="asana_type"
      >
        <Select.Option value="Single">Single</Select.Option>
        <Select.Option value="Combination">Combination</Select.Option>
      </Select>
      <Text h6>Asana Difficulty</Text>
      <Select
        multiple
        placeholder="Choose Difficulty"
        onChange={handleDifficulty}
        name="asana_difficulty"
      >
        <Select.Option key="Beginner" value="Beginner">
          Beginner
        </Select.Option>
        <Select.Option key="Intermediate" value="Intermediate">
          Intermediate
        </Select.Option>
        <Select.Option key="Advanced" value="Advanced">
          Advanced
        </Select.Option>
      </Select>

      <Input width="100%" id="asana_dash_url" name="asana_dash_url">
        DASH URL
      </Input>
      <Text>Language</Text>
      <Select
        placeholder="Choose Language"
        value={selectedLanguage}
        onChange={handleLanguageChange}
        id="asana_language"
        name="asana_language"
      >
        {tableLanguages &&
          tableLanguages.map((language) => (
            <Select.Option key={language.language_id} value={language.language}>
              {language.language}
            </Select.Option>
          ))}
      </Select>
      <br />
      <Text h5>AI Asana </Text>
      <Checkbox.Group value={[]} onChange={aiSetter} name="ai">
        <Checkbox value="ai_transition">AI</Checkbox>
        <Checkbox value="non_ai_transition">Non AI</Checkbox>
        <Checkbox value="both">Both</Checkbox>
      </Checkbox.Group>
      <Text h5>Audio Settings </Text>
      <Checkbox.Group value={[]} onChange={hello} name="audio_settings">
        <Checkbox value="with_audio">With Audio?</Checkbox>
        <Checkbox value="muted">Muted?</Checkbox>
        <Checkbox value="with_timer">With Timer?</Checkbox>
      </Checkbox.Group>
      <Text h5>DRM Video</Text>
      <ButtonGroup type="warning" ghost>
        <Button
          onClick={() => {
            setDrmVideo(true);
          }}
        >
          Yes
        </Button>
        <Button
          onClick={() => {
            setDrmVideo(false);
          }}
        >
          No
        </Button>
      </ButtonGroup>

      <Text h5>Teacher Mode</Text>
      <ButtonGroup type="warning" ghost>
        <Button
          onClick={() => {
            setTeacherMode(true);
          }}
        >
          Yes
        </Button>
        <Button
          onClick={() => {
            setTeacherMode(false);
          }}
        >
          No
        </Button>
      </ButtonGroup>

      <Divider />
      <Text h5>No Break Asana</Text>
      <Checkbox.Group value={[]} onChange={hello1} name="nobreak_asana">
        <Checkbox value="true">No break asana?</Checkbox>
      </Checkbox.Group>
      <Text h5>Asana Stithi Start</Text>
      <Select
        placeholder="Choose Asana Starting Stithi"
        onChange={handleAsanaStithiStart}
      >
        <Select.Option key="stithi" value="stithi">
          Stithi
        </Select.Option>
        <Select.Option key="relax" value="relax">
          Relax
        </Select.Option>
      </Select>
      <br />
      <Text h5>Asana Stithi End</Text>
      <Select
        placeholder="Choose Asana Starting Stithi"
        onChange={handleAsanaStithiEnd}
      >
        <Select.Option key="stithi" value="stithi">
          Stithi
        </Select.Option>
        <Select.Option key="relax" value="relax">
          Relax
        </Select.Option>
      </Select>
      <br />
      <Text h5>Person Starting Position</Text>
      <Select
        placeholder="Choose Person Starting Position"
        onChange={handlePersonStart}
      >
        <Select.Option key="Front" value="Front">
          Front
        </Select.Option>
        <Select.Option key="Left" value="Left">
          Left
        </Select.Option>
        <Select.Option key="Right" value="Right">
          Right
        </Select.Option>
        <Select.Option key="Back" value="Back">
          Back
        </Select.Option>
        <Select.Option key="Diagonal" value="Diagonal">
          Diagonal
        </Select.Option>
      </Select>
      <br />
      <Text h5>Person Ending Position</Text>
      <Select
        placeholder="Choose Person Starting Position"
        onChange={handlePersonEnd}
      >
        <Select.Option key="Front" value="Front">
          Front
        </Select.Option>
        <Select.Option key="Left" value="Left">
          Left
        </Select.Option>
        <Select.Option key="Right" value="Right">
          Right
        </Select.Option>
        <Select.Option key="Back" value="Back">
          Back
        </Select.Option>
        <Select.Option key="Diagonal" value="Diagonal">
          Diagonal
        </Select.Option>
      </Select>
      <br />
      <Text h5>Mat Starting Position</Text>
      <Select
        placeholder="Choose Mat Starting Position"
        onChange={handleMatStart}
      >
        <Select.Option key="Front" value="Front">
          Front
        </Select.Option>
        <Select.Option key="Side" value="Side">
          Side
        </Select.Option>
        <Select.Option key="Diagonal" value="Diagonal">
          Diagonal
        </Select.Option>
      </Select>
      <br />
      <Text h5>Mat Ending Position</Text>
      <Select
        placeholder="Choose Mat Starting Position"
        onChange={handleMatEnd}
      >
        <Select.Option key="Front" value="Front">
          Front
        </Select.Option>
        <Select.Option key="Side" value="Side">
          Side
        </Select.Option>
        <Select.Option key="Diagonal" value="Diagonal">
          Diagonal
        </Select.Option>
      </Select>

      <br />

      <Text h5>Asana States</Text>
      {Object.keys(asanaData).map((key) => (
        <div key={key} className="flex items-center gap-2">
          <Checkbox
            checked={asanaData[key]}
            onChange={(e) => {
              setAsanaData({ ...asanaData, [key]: e.target.checked });
            }}
          >
            {key.replace(/_/g, " ")}
          </Checkbox>
        </div>
      ))}

      {/* <Button onClick={markerNavigate}>Add Markers</Button> */}
      <Button htmlType="submit">Submit</Button>
    </form>
  );
}

export default RegisterVideoForm;
