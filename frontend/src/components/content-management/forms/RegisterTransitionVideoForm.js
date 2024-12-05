import React, { useEffect, useState } from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import AdminPageWrapper from "../../Common/AdminPageWrapper";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function RegisterTransitionVideoForm() {
  const [formState, setFormState] = useState({
    transition_video_name: "",
    teacher_mode: false,
    drm_transition: false,
    transition_dash_url: "",
    ai_transition: false,
    non_ai_transition: false,
    asana_category_start: "",
    asana_category_end: "",
    language: "",
    person_starting_position: "",
    person_ending_position: "",
    mat_starting_position: "",
    mat_ending_position: "",
    going_to_relax: false,
    coming_from_relax: false,
  });
  const [categories, setCategories] = useState([]);
  const [tableLanguages, setTableLanguages] = useState([]);

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

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormState((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = formState;
    toast("Adding new transition, kindly wait!");
    try {
      const response = await Fetch({
        url: "/content/video/addTransition",
        method: "POST",
        data: formData,
      });
      if (response?.status === 200) {
        toast("New Transition added successfully");
        navigate("/admin/video/transition/all");
      } else {
        console.log("Failed to add new transition");
      }
    } catch (error) {
      console.log("Error while making the request:", error);
    }
  };

  return (
    <AdminPageWrapper heading="Register Transition Video">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 500,
          margin: "auto",
          p: 2,
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <TextField
          label="Transition Video Name"
          variant="outlined"
          value={formState.transition_video_name}
          onChange={(e) =>
            handleInputChange("transition_video_name", e.target.value)
          }
          fullWidth
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formState.teacher_mode}
              onChange={() => handleCheckboxChange("teacher_mode")}
            />
          }
          label="Teacher Mode"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formState.drm_transition}
              onChange={() => handleCheckboxChange("drm_transition")}
            />
          }
          label="DRM Transition"
        />

        <TextField
          label="Transition DASH URL"
          variant="outlined"
          value={formState.transition_dash_url}
          onChange={(e) =>
            handleInputChange("transition_dash_url", e.target.value)
          }
          fullWidth
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formState.ai_transition}
              onChange={() => handleCheckboxChange("ai_transition")}
            />
          }
          label="AI Transition"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formState.non_ai_transition}
              onChange={() => handleCheckboxChange("non_ai_transition")}
            />
          }
          label="Non-AI Transition"
        />

        <FormControl fullWidth>
          <InputLabel>Asana Category Start</InputLabel>
          <Select
            value={formState.asana_category_start}
            onChange={(e) =>
              handleInputChange("asana_category_start", e.target.value)
            }
          >
            {categories &&
              categories.map((x) => (
                <MenuItem value={x.asana_category}>{x.asana_category}</MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Asana Category End</InputLabel>
          <Select
            value={formState.asana_category_end}
            onChange={(e) =>
              handleInputChange("asana_category_end", e.target.value)
            }
          >
            {categories &&
              categories.map((x) => (
                <MenuItem value={x.asana_category}>{x.asana_category}</MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={formState.language}
            onChange={(e) => handleInputChange("language", e.target.value)}
          >
            {tableLanguages &&
              tableLanguages.map((language) => (
                <MenuItem value={language.language}>
                  {language.language}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Person Starting Position</InputLabel>
          <Select
            value={formState.person_starting_position}
            onChange={(e) =>
              handleInputChange("person_starting_position", e.target.value)
            }
          >
            <MenuItem value="Front">Front</MenuItem>
            <MenuItem value="Back">Back</MenuItem>
            <MenuItem value="Left">Left</MenuItem>
            <MenuItem value="Right">Right</MenuItem>
            <MenuItem value="Diagonal">Diagonal</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Person Ending Position</InputLabel>
          <Select
            value={formState.person_ending_position}
            onChange={(e) =>
              handleInputChange("person_ending_position", e.target.value)
            }
          >
            <MenuItem value="Front">Front</MenuItem>
            <MenuItem value="Back">Back</MenuItem>
            <MenuItem value="Left">Left</MenuItem>
            <MenuItem value="Right">Right</MenuItem>
            <MenuItem value="Diagonal">Diagonal</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Mat Starting Position</InputLabel>
          <Select
            value={formState.mat_starting_position}
            onChange={(e) =>
              handleInputChange("mat_starting_position", e.target.value)
            }
          >
            <MenuItem value="Front">Front</MenuItem>
            <MenuItem value="Side">Side</MenuItem>
            <MenuItem value="Diagonal">Diagonal</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Mat Ending Position</InputLabel>
          <Select
            value={formState.mat_ending_position}
            onChange={(e) =>
              handleInputChange("mat_ending_position", e.target.value)
            }
          >
            <MenuItem value="Front">Front</MenuItem>
            <MenuItem value="Side">Side</MenuItem>
            <MenuItem value="Diagonal">Diagonal</MenuItem>
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={formState.going_to_relax}
              onChange={() => handleCheckboxChange("going_to_relax")}
            />
          }
          label="Going to Relax"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formState.coming_from_relax}
              onChange={() => handleCheckboxChange("coming_from_relax")}
            />
          }
          label="Coming from Relax"
        />

        <Button type="submit" variant="contained" color="primary">
          Save
        </Button>
      </Box>
    </AdminPageWrapper>
  );
}

export default withAuth(RegisterTransitionVideoForm, ROLE_ROOT);
