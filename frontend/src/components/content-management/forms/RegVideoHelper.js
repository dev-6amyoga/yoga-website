import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  ButtonGroup,
  Divider,
  Typography,
} from "@mui/material";

const RegVideoHelper = ({ categories, tableLanguages, handleSubmit }) => {
  const [formValues, setFormValues] = useState({
    asana_name: "",
    asana_desc: "",
    asana_category: "",
    asana_type: "",
    asana_difficulty: [],
    asana_videoID: "",
    asana_hls_url: "",
    asana_dash_url: "",
    asana_language: "",
    ai: [],
    audio_settings: [],
    drmVideo: false,
    teacherMode: false,
    nobreak_asana: [],
    asana_stithi_start: "",
    asana_stithi_end: "",
    person_start: "",
    person_end: "",
    mat_start: "",
    mat_end: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleMultiSelectChange = (e, name) => {
    setFormValues({ ...formValues, [name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <TextField
        fullWidth
        label="Asana Name"
        name="asana_name"
        value={formValues.asana_name}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        label="Description"
        name="asana_desc"
        value={formValues.asana_desc}
        onChange={handleChange}
      />
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          name="asana_category"
          value={formValues.asana_category}
          onChange={handleChange}
        >
          {categories.map((x) => (
            <MenuItem key={x.asana_category_id} value={x.asana_category}>
              {x.asana_category}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Type</InputLabel>
        <Select
          name="asana_type"
          value={formValues.asana_type}
          onChange={handleChange}
        >
          <MenuItem value="Single">Single</MenuItem>
          <MenuItem value="Combination">Combination</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Difficulty</InputLabel>
        <Select
          multiple
          name="asana_difficulty"
          value={formValues.asana_difficulty}
          onChange={(e) => handleMultiSelectChange(e, "asana_difficulty")}
        >
          <MenuItem value="Beginner">Beginner</MenuItem>
          <MenuItem value="Intermediate">Intermediate</MenuItem>
          <MenuItem value="Advanced">Advanced</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="DASH URL"
        name="asana_dash_url"
        value={formValues.asana_dash_url}
        onChange={handleChange}
      />

      <FormControl fullWidth>
        <InputLabel>Language</InputLabel>
        <Select
          name="asana_language"
          value={formValues.asana_language}
          onChange={handleChange}
        >
          {tableLanguages.map((language) => (
            <MenuItem key={language.language_id} value={language.language}>
              {language.language}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h5">AI Asana</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox name="ai" value="ai_transition" />}
          label="AI"
        />
        <FormControlLabel
          control={<Checkbox name="ai" value="non_ai_transition" />}
          label="Non AI"
        />
        <FormControlLabel
          control={<Checkbox name="ai" value="both" />}
          label="Both"
        />
      </FormGroup>

      <Typography variant="h5">Audio Settings</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox name="audio_settings" value="with_audio" />}
          label="With Audio?"
        />
        <FormControlLabel
          control={<Checkbox name="audio_settings" value="muted" />}
          label="Muted?"
        />
        <FormControlLabel
          control={<Checkbox name="audio_settings" value="with_timer" />}
          label="With Timer?"
        />
      </FormGroup>

      <Typography variant="h5">DRM Video</Typography>
      <ButtonGroup>
        <Button
          onClick={() => setFormValues({ ...formValues, drmVideo: true })}
        >
          Yes
        </Button>
        <Button
          onClick={() => setFormValues({ ...formValues, drmVideo: false })}
        >
          No
        </Button>
      </ButtonGroup>

      <Typography variant="h5">Teacher Mode</Typography>
      <ButtonGroup>
        <Button
          onClick={() => setFormValues({ ...formValues, teacherMode: true })}
        >
          Yes
        </Button>
        <Button
          onClick={() => setFormValues({ ...formValues, teacherMode: false })}
        >
          No
        </Button>
      </ButtonGroup>

      <Divider />

      <Typography variant="h5">No Break Asana</Typography>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox name="nobreak_asana" value="true" />}
          label="No break asana?"
        />
      </FormGroup>

      <FormControl fullWidth>
        <InputLabel>Asana Stithi Start</InputLabel>
        <Select
          name="asana_stithi_start"
          value={formValues.asana_stithi_start}
          onChange={handleChange}
        >
          <MenuItem value="stithi">Stithi</MenuItem>
          <MenuItem value="relax">Relax</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Asana Stithi End</InputLabel>
        <Select
          name="asana_stithi_end"
          value={formValues.asana_stithi_end}
          onChange={handleChange}
        >
          <MenuItem value="stithi">Stithi</MenuItem>
          <MenuItem value="relax">Relax</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Person Starting Position</InputLabel>
        <Select
          name="person_start"
          value={formValues.person_start}
          onChange={handleChange}
        >
          <MenuItem value="Front">Front</MenuItem>
          <MenuItem value="Left">Left</MenuItem>
          <MenuItem value="Right">Right</MenuItem>
          <MenuItem value="Back">Back</MenuItem>
          <MenuItem value="Diagonal">Diagonal</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Person Ending Position</InputLabel>
        <Select
          name="person_end"
          value={formValues.person_end}
          onChange={handleChange}
        >
          <MenuItem value="Front">Front</MenuItem>
          <MenuItem value="Left">Left</MenuItem>
          <MenuItem value="Right">Right</MenuItem>
          <MenuItem value="Back">Back</MenuItem>
          <MenuItem value="Diagonal">Diagonal</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Mat Starting Position</InputLabel>
        <Select
          name="mat_start"
          value={formValues.mat_start}
          onChange={handleChange}
        >
          <MenuItem value="Front">Front</MenuItem>
          <MenuItem value="Side">Side</MenuItem>
          <MenuItem value="Diagonal">Diagonal</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Mat Ending Position</InputLabel>
        <Select
          name="mat_end"
          value={formValues.mat_end}
          onChange={handleChange}
        >
          <MenuItem value="Front">Front</MenuItem>
          <MenuItem value="Side">Side</MenuItem>
          <MenuItem value="Diagonal">Diagonal</MenuItem>
        </Select>
      </FormControl>

      <Button type="submit" variant="contained" color="primary">
        Submit
      </Button>
    </form>
  );
};

export default RegVideoHelper;
