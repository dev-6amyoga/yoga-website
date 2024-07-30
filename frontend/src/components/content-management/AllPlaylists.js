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
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import { useNavigate } from "react-router-dom";
// import { transitionGenerator } from "../transition-generator/TransitionFunction";

function AllPlaylists() {
  const navigate = useNavigate();
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [allAsanas, setAllAsanas] = useState([]);
  const [allTransitions, setAllTransitions] = useState([]);
  const [asanaNames, setAsanaNames] = useState({});
  const [transitionNames, setTransitionNames] = useState({});
  const [delOpen, setDelOpen] = useState(false);
  const [delPlaylistId, setDelPlaylistId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playlistsResponse, asanasResponse, transitionsResponse] =
          await Promise.all([
            Fetch({ url: "/content/playlists/getAllPlaylists" }),
            Fetch({ url: "/content/video/getAllAsanas" }),
            Fetch({ url: "/content/video/getAllTransitions" }),
          ]);

        setAllPlaylists(playlistsResponse.data);
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
        acc[playlist.playlist_id] = playlist.asana_ids.map(
          (id) => asanaNameMap[id] || "Unknown"
        );
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

  const updateData = async (playlistId) => {
    toast(playlistId);
    navigate(`/admin/playlist/edit/${playlistId}`);

    // try {
    //   const playlistId = Number(modalData.playlist_id);
    //   const response = await Fetch({
    //     url: `/content/playlists/updatePlaylist/${playlistId}`,
    //     method: "PUT",
    //     data: modalData,
    //   });
    //   if (response.status === 200) {
    //     setPlaylist1((prev) =>
    //       prev.map((p1) => (p1.playlist_id === playlistId ? modalData : p1))
    //     );
    //     setFilteredTransitions((prev) =>
    //       prev.map((p1) => (p1.playlist_id === playlistId ? modalData : p1))
    //     );
    //     setModalState(false);
    //   } else {
    //     toast("Error updating playlist:", response.status);
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      const response = await Fetch({
        url: `/content/playlists/deletePlaylist/${playlistId}`,
        method: "DELETE",
      });
      if (response.status === 200) {
        toast("Playlist deleted successfully!");
        setDelOpen(false);
        setAllPlaylists((prev) =>
          prev.filter((playlist) => playlist.playlist_id !== playlistId)
        );
      } else {
        toast("Error deleting playlist:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AdminPageWrapper heading="Content Management - View All Playlists">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>Playlist ID</TableCell> */}
              <TableCell>Playlist Name</TableCell>
              {/* <TableCell>Asanas</TableCell> */}
              {/* <TableCell>Dash URL</TableCell> */}
              <TableCell>Duration (mins)</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>DRM Playlist</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allPlaylists.map((playlist) => (
              <TableRow key={playlist.playlist_id}>
                {/* <TableCell>{playlist.playlist_id}</TableCell> */}
                <TableCell>{playlist.playlist_name}</TableCell>
                {/* <TableCell>
                  <Card className="h-32 scrollable overflow-y-auto border border-gray-300">
                    <CardContent className="p-2">
                      {asanaNames[playlist.playlist_id]?.map((name, index) => (
                        <div key={index}>{name}</div>
                      ))}
                    </CardContent>
                  </Card>
                </TableCell> */}
                {/* <TableCell>
                  <a
                    href={playlist.playlist_dash_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {playlist.playlist_dash_url}
                  </a>
                </TableCell> */}
                <TableCell>{(playlist.duration / 60).toFixed(1)}</TableCell>
                <TableCell>
                  {new Date(playlist.playlist_start_date).toDateString()}
                </TableCell>
                <TableCell>
                  {new Date(playlist.playlist_end_date).toDateString()}
                </TableCell>
                <TableCell>{playlist.playlist_language}</TableCell>
                <TableCell>{playlist.playlist_mode}</TableCell>
                <TableCell>{playlist.drm_playlist ? "Yes" : "No"}</TableCell>
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
                    <Tooltip title={"Delete"}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setDelPlaylistId(playlist.playlist_id);
                          setDelOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </Button>
                    </Tooltip>
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
    </AdminPageWrapper>
  );
}

export default withAuth(AllPlaylists, ROLE_ROOT);
