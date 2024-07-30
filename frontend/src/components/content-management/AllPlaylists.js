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
} from "@mui/material";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
// import { transitionGenerator } from "../transition-generator/TransitionFunction";

function AllPlaylists() {
  const [allPlaylists, setAllPlaylists] = useState([]);
  const [allAsanas, setAllAsanas] = useState([]);
  const [allTransitions, setAllTransitions] = useState([]);
  const [asanaNames, setAsanaNames] = useState({});
  const [transitionNames, setTransitionNames] = useState({});

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

  const updateData = async () => {
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

  const deletePlaylist = async () => {
    // try {
    //   const playlistId = delPlaylistId;
    //   const response = await Fetch({
    //     url: `/content/playlists/deletePlaylist/${playlistId}`,
    //     method: "DELETE",
    //   });
    //   if (response.status === 200) {
    //     setPlaylist1((prev) =>
    //       prev.filter((playlist) => playlist.playlist_id !== playlistId)
    //     );
    //   } else {
    //     toast("Error deleting playlist:", response.status);
    //   }
    //   setDelState(false);
    // } catch (error) {
    //   console.log(error);
    // }
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
                <TableCell>{playlist.duration / 60}</TableCell>
                <TableCell>
                  {new Date(playlist.playlist_start_date).toDateString()}
                </TableCell>
                <TableCell>
                  {new Date(playlist.playlist_end_date).toDateString()}
                </TableCell>
                <TableCell>{playlist.playlist_language}</TableCell>
                <TableCell>{playlist.playlist_mode}</TableCell>
                <TableCell>{playlist.drm_playlist ? "Yes" : "No"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminPageWrapper>
  );
}

export default withAuth(AllPlaylists, ROLE_ROOT);
