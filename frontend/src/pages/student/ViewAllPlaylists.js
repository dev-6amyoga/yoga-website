import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Modal, Box, List, ListItem } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

function ViewAllPlaylists() {
  let user = useUserStore((state) => state.user);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [allAsanas, setAllAsanas] = useState([]);
  const [allTransitions, setAllTransitions] = useState([]);
  const [delOpen, setDelOpen] = useState(false);
  const [delPlaylistId, setDelPlaylistId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [asanaNames, setAsanaNames] = useState({});
  const [transitionNames, setTransitionNames] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editsRemaining, setEditsRemaining] = useState(0);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playlistsResponse, asanasResponse, transitionsResponse] =
          await Promise.all([
            Fetch({ url: "/user-playlists/user/" + user.user_id }),
            Fetch({ url: "/content/video/getAllAsanas" }),
            Fetch({ url: "/content/video/getAllTransitions" }),
          ]);
        setUserPlaylists(playlistsResponse.data.userPlaylists);
        setAllPlaylists(playlistsResponse.data.playlists);
        setFilteredPlaylists(playlistsResponse.data.playlists);
        setAllAsanas(asanasResponse.data);
        setAllTransitions(transitionsResponse.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (allAsanas.length === 0 || allTransitions.length === 0) return;
    const fetchNames = () => {
      const asanaNameMap = allAsanas.reduce((acc, asana) => {
        acc[asana.id] = asana.asana_name;
        return acc;
      }, {});
      const transitionNameMap = allTransitions.reduce((acc, transition) => {
        acc[transition.transition_id] = transition.transition_video_name;
        return acc;
      }, {});
      const playlistAsanaNames = allPlaylists.reduce((acc, playlist) => {
        acc[playlist.playlist_id] = playlist.asana_ids
          .map((id) => {
            if (typeof id === "number") {
              return asanaNameMap[id] || "Unknown";
            }
            return null; // Return null for non-number values (you can also filter them out later)
          })
          .filter(Boolean); // Remove null values from the list
        return acc;
      }, {});
      const playlistTransitionNames = allPlaylists.reduce((acc, playlist) => {
        acc[playlist.playlist_id] = playlist.sections.map((section) => {
          return section.transition_ids
            ? section.transition_ids.map(
                (id) => transitionNameMap[id] || "Unknown"
              )
            : [];
        });
        return acc;
      }, {});
      setAsanaNames(playlistAsanaNames);
      setTransitionNames(playlistTransitionNames);
    };

    fetchNames();
  }, [allPlaylists, allAsanas, allTransitions]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = allPlaylists.filter((playlist) =>
      playlist.playlist_name.toLowerCase().includes(query)
    );
    setFilteredPlaylists(filtered);
  };

  const updateData = async (playlistId) => {
    const editablePlaylist = filteredPlaylists.find(
      (x) => x.playlist_id === playlistId
    );
    let userPlaylistEditable = userPlaylists.filter((x) =>
      x.playlists.includes(editablePlaylist._id)
    );
    if (userPlaylistEditable[0].edits_left === 0) {
      toast(
        "You have " + userPlaylistEditable[0].edits_left + " edits remaining! "
      );
    } else {
      setEditsRemaining(userPlaylistEditable[0].edits_left);
      setSelectedPlaylistId(playlistId);
      setShowModal(true);
    }
  };

  const deletePlaylist = async () => {
    try {
      const playlistId = delPlaylistId;
      const response = await Fetch({
        url: "/user-playlists/delete",
        method: "POST",
        data: { user_id: user.user_id, playlistId: playlistId },
      });
      if (response?.status === 200) {
        toast("Deleted Successfully!");
        window.location.reload();
        setDelOpen(false);
      } else {
        toast(response.data.message);
        setDelOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const proceedToEdit = () => {
    setShowModal(false);
    navigate(`/student/playlist/edit/${selectedPlaylistId}`);
  };

  const cancelEdit = () => {
    setShowModal(false);
  };
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const viewPlaylist = (playlistId) => {
    const playlist = allPlaylists.find((p) => p.playlist_id === playlistId);
    setSelectedPlaylist(playlist);
    setModalOpen(true);
  };

  const ViewPlaylistModal = ({ open, onClose, playlist, asanaNames }) => {
    if (!playlist) return null;
    const asanaList = asanaNames[playlist.playlist_id];
    return (
      <Modal open={open} onClose={onClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh", // Limit height
            overflowY: "auto", // Enable scrolling
          }}
        >
          <Typography variant="h6" gutterBottom>
            {playlist.playlist_name}
          </Typography>
          <List>
            {asanaList.length > 0 ? (
              asanaList.map((asana, index) => (
                <ListItem key={index}>{asana}</ListItem>
              ))
            ) : (
              <Typography>No Asanas Found</Typography>
            )}
          </List>
          <Button
            onClick={onClose}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    );
  };

  return (
    <StudentPageWrapper heading="View Your Playlists">
      <div className="flex justify-between items-center mb-4">
        <br />
        <TextField
          label="Search Playlists"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Playlist Name</TableCell>
              <TableCell>Duration (mins)</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlaylists.map((playlist) => (
              <TableRow key={playlist.playlist_id}>
                <TableCell>{playlist.playlist_name}</TableCell>
                <TableCell>{(playlist.duration / 60).toFixed(1)}</TableCell>
                <TableCell>
                  {new Date(playlist.playlist_start_date).toDateString()}
                </TableCell>
                <TableCell>{playlist.playlist_language}</TableCell>
                <TableCell>
                  <div className="flex flex-row gap-2">
                    <Tooltip title={"Edit"}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          updateData(playlist.playlist_id);
                        }}
                      >
                        <EditIcon />
                      </Button>
                    </Tooltip>
                    <Tooltip title={"View"}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          viewPlaylist(playlist.playlist_id);
                        }}
                      >
                        <VisibilityIcon />
                      </Button>
                    </Tooltip>
                    {/* <Tooltip title={"Delete"}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setDelPlaylistId(playlist.playlist_id);
                          setDelOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </Tooltip> */}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={delOpen}
        onClose={() => {
          setDelOpen(false);
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete this playlist?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDelOpen(false);
            }}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => {
              deletePlaylist(delPlaylistId);
            }}
            color="secondary"
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showModal} onClose={cancelEdit}>
        <DialogTitle>Edit Playlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have <strong>{editsRemaining}</strong> edits left. Would you
            like to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit} color="secondary">
            Cancel
          </Button>
          <Button onClick={proceedToEdit} color="primary" variant="contained">
            Proceed
          </Button>
        </DialogActions>
      </Dialog>

      <ViewPlaylistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        playlist={selectedPlaylist}
        asanaNames={asanaNames}
      />
    </StudentPageWrapper>
  );
}

export default withAuth(ViewAllPlaylists, ROLE_STUDENT);
