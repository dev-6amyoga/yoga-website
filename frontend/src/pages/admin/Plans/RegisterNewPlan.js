import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";

function RegisterNewPlan() {
  const navigate = useNavigate();
  const notify = (x) => toast(x);

  const [planData, setPlanData] = useState({
    name: "",
    description: "",
    has_basic_playlist: true,
    has_zoom_classes: true,
    number_of_zoom_classes: 0,
    has_playlist_creation: false,
    playlist_creation_limit: 0,
    has_self_audio_upload: false,
    number_of_teachers: 0,
    plan_validity_days: 0,
    watch_time_limit: 0,
    plan_user_type: "",
  });

  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setPlanData({ ...planData, [field]: value });
  };

  const handleCheckboxChange = (field) => (e) => {
    setPlanData({ ...planData, [field]: e.target.checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("Submitting plan data:", planData);
    try {
      Fetch({
        url: "/plan/register",
        method: "POST",
        data: { planData },
      })
        .then((res) => {
          notify("New plan added successfully!");
          navigate("/admin/plan/view-all");
        })
        .catch((err) => {
          //console.log("Something went wrong", { type: "error" });
        });
    } catch (error) {
      console.error(error);
      notify("An error occurred while registering the plan");
    }
  };

  return (
    <AdminPageWrapper heading={"Register New Plan"}>
      <Paper sx={{ padding: 4, maxWidth: 600, margin: "auto", mt: 4 }}>
        <Divider sx={{ mb: 2 }} />
        <Box
          component="form"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          onSubmit={handleSubmit}
        >
          {/* Plan Name */}
          <TextField
            label="Plan Name"
            value={planData.name}
            onChange={handleChange("name")}
            required
          />

          {/* Description */}
          <TextField
            label="Description"
            value={planData.description}
            onChange={handleChange("description")}
            multiline
            rows={2}
          />

          {/* Playlist Creation */}
          <FormControlLabel
            control={
              <Checkbox
                checked={planData.has_playlist_creation}
                onChange={handleCheckboxChange("has_playlist_creation")}
              />
            }
            label="Allow Playlist Creation"
          />

          {/* Playlist Creation Limit */}
          <TextField
            label="Playlist Creation Limit"
            type="number"
            value={planData.playlist_creation_limit}
            onChange={handleChange("playlist_creation_limit")}
          />

          {/* Zoom Classes */}
          <FormControlLabel
            control={
              <Checkbox
                checked={planData.has_zoom_classes}
                onChange={handleCheckboxChange("has_zoom_classes")}
              />
            }
            label="Allow Zoom Classes"
          />
          {planData.has_zoom_classes && (
            <TextField
              label="Number of Zoom Classes"
              type="number"
              value={planData.number_of_zoom_classes}
              onChange={handleChange("number_of_zoom_classes")}
            />
          )}

          {/* Self Audio Upload */}
          <FormControlLabel
            control={
              <Checkbox
                checked={planData.has_self_audio_upload}
                onChange={handleCheckboxChange("has_self_audio_upload")}
              />
            }
            label="Allow Self Audio Upload"
          />

          {/* Number of Teachers */}
          <TextField
            label="Number of Teachers"
            type="number"
            value={planData.number_of_teachers}
            onChange={handleChange("number_of_teachers")}
          />

          {/* Plan Validity */}
          <TextField
            label="Plan Validity (days)"
            type="number"
            value={planData.plan_validity_days}
            onChange={handleChange("plan_validity_days")}
          />

          {/* Watch Time Limit */}
          <TextField
            label="Watch Time Limit (minutes)"
            type="number"
            value={planData.watch_time_limit}
            onChange={handleChange("watch_time_limit")}
          />

          {/* User Type */}
          <FormControl fullWidth>
            <InputLabel>User Type</InputLabel>
            <Select
              value={planData.plan_user_type}
              onChange={handleChange("plan_user_type")}
              required
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="institute">Institute</MenuItem>
            </Select>
          </FormControl>

          <Button variant="contained" color="primary" type="submit">
            Submit
          </Button>
        </Box>
      </Paper>
    </AdminPageWrapper>
  );
}

export default withAuth(RegisterNewPlan, ROLE_ROOT);
