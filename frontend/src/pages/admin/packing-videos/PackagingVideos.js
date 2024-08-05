// import { Add, Remove } from "@mui/icons-material";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Checkbox,
//   FormControl,
//   Grid,
//   IconButton,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
// } from "@mui/material";
import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import getFormData from "../../../utils/getFormData";
// import { useNavigate } from "react-router-dom";

import {
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Container,
  Paper,
} from "@mui/material";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { Fetch } from "../../../utils/Fetch";

function PackagingVideos() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      console.log("executing bat file!");
      Fetch({
        url: "/video-packaging/run-bat",
        method: "POST",
      })
        .then((res) => {
          console.log("success");
          console.log(res.data);
        })
        .catch((err) => {
          console.log("Error:", err);
        });
    };
    if (files.length > 0) {
      fetchData();
    }
  }, [files]);
  const handleFolderSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      const mp4Files = selectedFiles.filter(
        (file) => file.type === "video/mp4"
      );
      console.log(mp4Files, selectedFiles);
      if (mp4Files.length === selectedFiles.length) {
        setFiles(mp4Files);
        setError("");
      } else {
        setError("All selected files must be mp4 videos.");
        setFiles([]);
      }
    }
  };

  return (
    <AdminPageWrapper heading="Packaging Videos">
      <Container>
        <Paper style={{ padding: "20px", marginBottom: "20px" }}>
          <Typography variant="h6">
            Select a folder containing mp4 files:
          </Typography>
          <input
            type="file"
            id="fileInput"
            webkitdirectory="true"
            directory="true"
            multiple
            accept="video/mp4"
            style={{ display: "none" }}
            onChange={handleFolderSelect}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Choose Folder
          </Button>
          {error && <Typography color="error">{error}</Typography>}
        </Paper>
        {files.length > 0 && (
          <Paper style={{ padding: "20px" }}>
            <Typography variant="h6">Selected MP4 Files:</Typography>
            <List>
              {files.map((file, index) => (
                <ListItem key={index}>
                  <ListItemText primary={file.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Container>
    </AdminPageWrapper>
  );
}

export default withAuth(PackagingVideos, ROLE_ROOT);
