import {
  Button,
  TextField,
  Grid,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Fetch } from "../../utils/Fetch";
import { toast } from "react-toastify";
import AdminPageWrapper from "../Common/AdminPageWrapper";

function EditPlaylist() {
  const { playlist_id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await Fetch({
          url: `/content/playlists/getPlaylistById/${playlist_id}`,
          method: "GET",
        });
        setPlaylist(response.data);
        setFormValues(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPlaylist();
  }, [playlist_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await Fetch({
        url: `/content/playlists/updatePlaylist/${playlist_id}`,
        method: "PUT",
        data: formValues,
      });
      if (response.status === 200) {
        toast("Playlist updated successfully!");
        navigate("/admin/playlist/view-all");
      } else {
        toast("Error updating playlist:", response.status);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminPageWrapper heading="Edit Playlist">
      <Container component={Paper} maxWidth="md" sx={{ padding: 3 }}>
        <Typography variant="h6">Edit Playlist</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Playlist Name"
              name="playlist_name"
              value={formValues.playlist_name || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Duration (mins)"
              name="duration"
              disabled
              value={formValues.duration || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Start Date"
              name="playlist_start_date"
              type="date"
              value={formValues.playlist_start_date?.slice(0, 10) || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="End Date"
              name="playlist_end_date"
              type="date"
              value={formValues.playlist_end_date?.slice(0, 10) || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Language"
              name="playlist_language"
              value={formValues.playlist_language || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Mode"
              name="playlist_mode"
              value={formValues.playlist_mode || ""}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="DRM Playlist"
              name="drm_playlist"
              select
              SelectProps={{ native: true }}
              value={formValues.drm_playlist ? "true" : "false"}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </TextField>
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Container>
    </AdminPageWrapper>
  );
}

export default EditPlaylist;
