import React, { useState } from "react";
import {
  Card,
  Divider,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Typography,
  Collapse,
  Modal,
  IconButton,
} from "@mui/material";

import ExpandMore from "@mui/icons-material/ExpandMore";
import makeStyles from "@mui/material";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: theme.spacing(2),
  },
  flexRow: {
    display: "flex",
    alignItems: "center",
  },
  card: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  table: {
    minWidth: 650,
  },
  tableCell: {
    width: "20%",
  },
}));

const MyComponent = () => {
  const classes = useStyles();
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  const [showDrm, setShowDrm] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({});
  const [playlistName, setPlaylistName] = useState("");
  const [totalDuration, setTotalDuration] = useState(0);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
  };

  const handleInputChange = (event) => {
    setModalData({
      ...modalData,
      [event.target.id]: event.target.value,
    });
  };

  const updateData = () => {
    // Handle data update
  };

  const renderAction = (value, rowData) => {
    // Define renderAction function
  };

  const renderAction2 = (value, rowData) => {
    // Define renderAction2 function
  };

  const asanaIcons = (value, rowData, index) => {
    // Define asanaIcons function
  };

  return (
    <div className={classes.root}>
      <div className={classes.gridContainer}>
        <div className={classes.flexRow}>
          <Switch
            checked={showTeacherMode}
            onChange={() => setShowTeacherMode((prevMode) => !prevMode)}
          />
          <Typography variant="subtitle1">
            {showTeacherMode ? "Teacher Mode" : "Normal Mode"}
          </Typography>
        </div>
        <div className={classes.flexRow}>
          <Switch
            checked={showDrm}
            onChange={() => setShowDrm((prevMode) => !prevMode)}
          />
          <Typography variant="subtitle1">
            {showDrm ? "DRM Videos" : "Non DRM Videos"}
          </Typography>
        </div>
      </div>

      {filteredAsanasByCategory.map((categoryData, index) => (
        <Collapse key={index} className={classes.card}>
          <IconButton expand>
            <ExpandMoreIcon />
          </IconButton>
          <Typography variant="h6">{categoryData.category}</Typography>
          <TableContainer>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableCell}>
                    Asana Name
                  </TableCell>
                  <TableCell className={classes.tableCell}>No Break?</TableCell>
                  <TableCell className={classes.tableCell}>Category</TableCell>
                  <TableCell className={classes.tableCell}>
                    Add To Playlist
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoryData.asanas.map((asana, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{asana.asana_name}</TableCell>
                    <TableCell>{asana.nobreak_asana ? "Yes" : "No"}</TableCell>
                    <TableCell>{asana.asana_category}</TableCell>
                    <TableCell>{renderAction2(asana)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      ))}

      <Card className={classes.card}>
        <TableContainer>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>Asana Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Count</TableCell>
                <TableCell>Reorder</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {playlist_temp.map((rowData, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {rowData.rowData.asana_name ||
                      rowData.rowData.transition_video_name ||
                      ""}
                  </TableCell>
                  <TableCell>{rowData.rowData.asana_category}</TableCell>
                  <TableCell>
                    {rowData.rowData.teacher_mode ? "Teacher" : "Normal"}
                  </TableCell>
                  <TableCell>{rowData.count}</TableCell>
                  <TableCell>{asanaIcons(null, rowData, idx)}</TableCell>
                  <TableCell>{renderAction(null, rowData)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <form className={classes.form} onSubmit={handleSubmit}>
          <TextField
            fullWidth
            id="playlist_name"
            label="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
          <Typography>
            Playlist Duration : {(totalDuration / 60).toFixed(2)} minutes
          </Typography>
          <Button type="submit" variant="contained" color="primary">
            Submit
          </Button>
        </form>
      </Card>

      <Modal open={modalState} onClose={() => setModalState(false)}>
        <div className={classes.modalContent}>
          <Typography variant="h6">Update</Typography>
          <Typography variant="subtitle1">
            {modalData.rowData?.asana_name}
          </Typography>
          <form>
            <TextField
              fullWidth
              id="asana_count_playlist"
              label="Count"
              placeholder={modalData.count}
              onChange={handleInputChange}
            />
          </form>
          <Button onClick={() => setModalState(false)}>Cancel</Button>
          <Button onClick={updateData}>Update</Button>
        </div>
      </Modal>
    </div>
  );
};

export default MyComponent;
