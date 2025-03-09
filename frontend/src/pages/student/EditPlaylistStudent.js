import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import {
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { TransitionEndStanding } from "../../components/transition-generator/transition-generator-helpers/TransitionEndStanding";
import { TransitionEndSitting } from "../../components/transition-generator/transition-generator-helpers/TransitionEndSitting";
import { TransitionEndSupine } from "../../components/transition-generator/transition-generator-helpers/TransitionEndSupine";
import { TransitionEndProne } from "../../components/transition-generator/transition-generator-helpers/TransitionEndProne";
import { TransitionEndPranayama } from "../../components/transition-generator/transition-generator-helpers/TransitionEndPranayama";
import { TransitionEndClosingPrayerSitting } from "../../components/transition-generator/transition-generator-helpers/TransitionEndClosingPrayerSitting";
import { TransitionEndClosingPrayerStanding } from "../../components/transition-generator/transition-generator-helpers/TransitionEndClosingPrayerStanding";
import { TransitionEndStartingPrayerStanding } from "../../components/transition-generator/transition-generator-helpers/TransitionEndStartingPrayerStanding";
import { TransitionEndStartingPrayerSitting } from "../../components/transition-generator/transition-generator-helpers/TransitionEndStartingPrayerSitting";
import { TransitionEndPranayamaPrayer } from "../../components/transition-generator/transition-generator-helpers/TransitionEndPranayamaPrayer";
import { TransitionEndSpecial } from "../../components/transition-generator/transition-generator-helpers/TransitionEndSpecial";
import { TransitionEndSuryanamaskaraStithi } from "../../components/transition-generator/transition-generator-helpers/TransitionEndSuryanamaskaraStithi";
import { TransitionEndSuryanamaskaraNonStithi } from "../../components/transition-generator/transition-generator-helpers/TransitionEndSuryanamaskaraNonStithi";
import { TransitionEndVajrasana } from "../../components/transition-generator/transition-generator-helpers/TransitionEndVajrasana";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function EditPlaylistStudent() {
  let user = useUserStore((state) => state.user);
  const { playlist_id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [asanas, setAsanas] = useState([]);
  const [names, setNames] = useState([]);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [open, setOpen] = useState(false);
  const [pendingSaveObject, setPendingSaveObject] = useState(null); // Store pending data
  const [playlistId, setPlaylistId] = useState(null);

  const predefinedOrder = [
    "Starting Prayer Standing",
    "Starting Prayer Sitting",
    "Warmup",
    "Suryanamaskara Non Stithi",
    "Suryanamaskara Stithi",
    "Standing",
    "Sitting",
    "Supine",
    "Prone",
    "Vajrasana",
    "Pranayama Prayer",
    "Pranayama",
    "Special",
    "Closing Prayer Sitting",
  ];

  useEffect(() => {
    const s1 = asanas.sort((a, b) => {
      return (
        predefinedOrder.indexOf(a.asana_category) -
        predefinedOrder.indexOf(b.asana_category)
      );
    });
    setSortedAsanas(s1);
  }, [asanas]);
  const [playlistCurrent, setPlaylistCurrent] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  const filteredAsanasByCategory = predefinedOrder.map((category) => {
    return {
      category: category,
      asanas: sortedAsanas.filter((asana) => {
        // If the asana has is_warmup = true, categorize it under "Warmup"
        if (asana.is_warmup) return category === "Warmup";
        return asana.asana_category === category;
      }),
    };
  });

  const filteredCategories = filteredAsanasByCategory
    .map((category) => ({
      ...category,
      asanas: category.asanas.filter((asana) => {
        return (
          asana.teacher_mode === false &&
          asana.drm_video === true &&
          asana.nobreak_asana === true
        );
      }),
    }))
    .filter((category) => category.asanas.length > 0);

  const fetchAsanaById = async (id) => {
    try {
      const response = await Fetch({
        url: "/content/get-asana-by-id",
        method: "POST",
        data: {
          asana_id: id,
        },
      });
      if (response.status === 200) {
        return response.data;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        setAsanas(response.data);
      } catch (error) {
        console.log("error");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllTransitions",
        });
        setTransitions(response.data);
      } catch (error) {
        console.log("error");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        const response = await Fetch({
          url: `/content/playlists/getPlaylistById/${playlist_id}`,
          method: "GET",
        });
        setPlaylist(response.data);
        setFormValues(response.data);
        const asanasOnlyPlaylist = filterAsanas(response.data.asana_ids);
        setPlaylistCurrent(asanasOnlyPlaylist);
      } catch (error) {
        console.log("error");
      }
    };

    fetchPlaylist();
  }, [playlist_id]);

  const addToPlaylist = async (rowData) => {
    setPlaylistCurrent([...playlistCurrent, rowData.id]);
  };

  useEffect(() => {
    const newNames = playlistCurrent.map((id) => {
      const asana = asanas.find((a) => a.id === id);
      if (!asana) {
        const transition = transitions.find((a) => a.transition_id === id);
        return transition
          ? transition.transition_video_name
          : "Unknown Transition.";
      }
      return asana ? asana.asana_name : "Unknown Asana";
    });
    setNames(newNames);
  }, [playlistCurrent, asanas, transitions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const recalculateTransitions = async (asanasOnlyPlaylist) => {
    let recalculatedPlaylist = [];
    for (let i = 0; i < asanasOnlyPlaylist.length; i++) {
      const currentId = asanasOnlyPlaylist[i];
      if (typeof currentId === "number") {
        if (i === 0) {
          const curAsana = await fetchAsanaById(currentId);
          let transitionData = {
            start_category: null,
            end_category: null,
            break_status_start: null,
            break_status_end: curAsana.nobreak_asana ? "No Break" : "Break",
            start_video: null,
            end_video: curAsana,
            drm_status: curAsana.drm_video,
            transitions: transitions,
          };
          if (curAsana.asana_category === "Sitting") {
            let t1 = await TransitionEndSitting(
              transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Pranayama") {
            let t1 = await TransitionEndPranayama(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Closing Prayer Sitting") {
            let t1 = await TransitionEndClosingPrayerSitting(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Closing Prayer Standing") {
            let t1 = await TransitionEndClosingPrayerStanding(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Starting Prayer Sitting") {
            let t1 = await TransitionEndStartingPrayerSitting(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Starting Prayer Standing") {
            let t1 = await TransitionEndStartingPrayerStanding(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Pranayama Prayer") {
            let t1 = await TransitionEndPranayamaPrayer(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Standing") {
            let t1 = await TransitionEndStanding(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Supine") {
            let t1 = await TransitionEndSupine(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Prone") {
            let t1 = await TransitionEndProne(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Special") {
            let t1 = await TransitionEndSpecial(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Suryanamaskara Stithi") {
            let t1 = await TransitionEndSuryanamaskaraStithi(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Vajrasana") {
            let t1 = await TransitionEndVajrasana(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
          if (curAsana.asana_category === "Suryanamaskara Non Stithi") {
            let t1 = await TransitionEndSuryanamaskaraNonStithi(
              transitionData.end_category
                ? transitionData.end_category
                : transitionData.start_category,
              transitionData.break_status_start,
              transitionData.break_status_end,
              transitionData.start_video,
              transitionData.end_video,
              transitionData.drm_status,
              transitionData.transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            recalculatedPlaylist = [
              ...recalculatedPlaylist,
              ...t1,
              curAsana.id,
            ];
          }
        } else {
          const previousId = asanasOnlyPlaylist[i - 1];
          if (typeof previousId === "number") {
            const curAsana = await fetchAsanaById(currentId);
            const prevAsana = await fetchAsanaById(previousId);
            let transitionData = {
              start_category:
                "end_category" in prevAsana
                  ? prevAsana.end_category
                  : prevAsana.asana_category,
              break_status_start: prevAsana.nobreak_asana
                ? "No Break"
                : "Break",
              break_status_end: curAsana.nobreak_asana ? "No Break" : "Break",
              start_video: prevAsana,
              end_video: curAsana,
              drm_status: curAsana.drm_video,
              transitions: transitions,
            };
            if (curAsana.asana_category === "Sitting") {
              let t1 = await TransitionEndSitting(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Pranayama") {
              let t1 = await TransitionEndPranayama(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Closing Prayer Sitting") {
              let t1 = await TransitionEndClosingPrayerSitting(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Closing Prayer Standing") {
              let t1 = await TransitionEndClosingPrayerStanding(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Starting Prayer Sitting") {
              let t1 = await TransitionEndStartingPrayerSitting(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Starting Prayer Standing") {
              let t1 = await TransitionEndStartingPrayerStanding(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Pranayama Prayer") {
              let t1 = await TransitionEndPranayamaPrayer(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Standing") {
              let t1 = await TransitionEndStanding(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Supine") {
              let t1 = await TransitionEndSupine(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Prone") {
              let t1 = await TransitionEndProne(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Special") {
              let t1 = await TransitionEndSpecial(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Suryanamaskara Stithi") {
              let t1 = await TransitionEndSuryanamaskaraStithi(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Vajrasana") {
              let t1 = await TransitionEndVajrasana(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
            if (curAsana.asana_category === "Suryanamaskara Non Stithi") {
              let t1 = await TransitionEndSuryanamaskaraNonStithi(
                transitionData.end_category
                  ? transitionData.end_category
                  : transitionData.start_category,
                transitionData.break_status_start,
                transitionData.break_status_end,
                transitionData.start_video,
                transitionData.end_video,
                transitionData.drm_status,
                transitionData.transitions
              );
              t1 = t1.filter((element) => element !== undefined);
              recalculatedPlaylist = [
                ...recalculatedPlaylist,
                ...t1,
                curAsana.id,
              ];
            }
          }
        }
      }
    }
    setPlaylistCurrent(recalculatedPlaylist);
    console.log(recalculatedPlaylist);
    formValues.asana_ids = recalculatedPlaylist;
    setPendingSaveObject(formValues);
    setPlaylistId(playlist_id);
    setOpen(true);
  };

  const handleCreatePlaylist = async () => {
    setOpen(false); // Close modal before API call
    if (!pendingSaveObject) return; // Ensure there's data
    if (!playlistId) return; // Ensure there's data

    const response = await Fetch({
      url: `/user-playlists/edit/${playlistId}`,
      method: "PUT",
      data: { user_id: user.user_id, updates: pendingSaveObject },
    });
    if (response.status === 200) {
      toast("Playlist updated successfully!");
      try {
        const manifestResponse = await Fetch({
          url: `/content/playlists/createManifest/${playlistId}`,
          method: "POST",
        });

        if (manifestResponse?.status === 200) {
          toast("Manifest Generated!");
        }
      } catch (manifestError) {
        console.error("Error generating manifest:", manifestError);
      }
      navigate("/student/view-all-playlists");
    } else {
      toast("Error updating playlist:", response.status);
    }
  };
  const filterAsanas = (playlist) => {
    return playlist.filter((id) => typeof id === "number");
  };

  const handleSave = async () => {
    try {
      await recalculateTransitions(playlistCurrent);
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return; // If dropped outside, do nothing

    const newPlaylist = [...playlistCurrent];
    const [movedItem] = newPlaylist.splice(result.source.index, 1); // Remove item
    newPlaylist.splice(result.destination.index, 0, movedItem); // Insert at new position

    setPlaylistCurrent(newPlaylist);
  };

  const handleDelete = async (index) => {
    if (typeof playlistCurrent[index] === "number") {
      toast("Deleting!!");
      const newPlaylist = playlistCurrent.filter((_, i) => i !== index);
      setPlaylistCurrent(newPlaylist);
    }
  };
  return (
    <StudentPageWrapper heading="View Your Playlists">
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save Changes
      </Button>
      <div className="flex flex-row gap-2">
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
                value={formValues.duration / 60 || ""}
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
                label="Language"
                name="playlist_language"
                value={formValues.playlist_language || ""}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              {/* asana picker */}

              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-3">
                  <div>
                    {filteredCategories.map((x, index) => (
                      <Accordion key={index} className="flex flex-col gap-2">
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          {x.category}
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Asana Name</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {x.asanas.map((asana, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell>{asana.asana_name}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="contained"
                                        onClick={() => {
                                          addToPlaylist(asana);
                                        }}
                                      >
                                        Add
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </Container>
        <Container component={Paper} maxWidth="md" sx={{ padding: 3 }}>
          {/* <div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="playlist">
                {(provided) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ minHeight: "50px" }}
                  >
                    {names.map((name, index) => (
                      <Draggable
                        key={index}
                        draggableId={String(index)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              border: "1px solid #ccc",
                              borderRadius: "8px",
                              marginBottom: "8px",
                              padding: "8px",
                              background: snapshot.isDragging
                                ? "#f0f0f0"
                                : "#fff",
                            }}
                          >
                            <Grid container alignItems="center" spacing={2}>
                              <Grid item xs>
                                <ListItemText primary={name} />
                              </Grid>
                              <Grid item>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  onClick={() => handleDelete(index)}
                                >
                                  Delete
                                </Button>
                              </Grid>
                            </Grid>
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </div> */}

          <div>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="playlist">
                {(provided) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ minHeight: "50px" }}
                  >
                    {names.map((name, index) => {
                      const id = playlistCurrent[index];
                      const isAsana = asanas.some((a) => a.id === id);
                      const isTransition = transitions.some(
                        (t) => t.transition_id === id
                      );

                      return isAsana ? (
                        // Draggable Asanas
                        <Draggable
                          key={index}
                          draggableId={String(index)}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                marginBottom: "8px",
                                padding: "8px",
                                background: snapshot.isDragging
                                  ? "#f0f0f0"
                                  : "#fff",
                              }}
                            >
                              <Grid container alignItems="center" spacing={2}>
                                <Grid item xs>
                                  <ListItemText primary={name} />
                                </Grid>
                                <Grid item>
                                  <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => handleDelete(index)}
                                  >
                                    Delete
                                  </Button>
                                </Grid>
                              </Grid>
                            </ListItem>
                          )}
                        </Draggable>
                      ) : (
                        // Non-Draggable Transitions
                        <ListItem
                          key={index}
                          style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            marginBottom: "8px",
                            padding: "8px",
                            background: "#e0e0e0", // Different background for clarity
                            opacity: 0.6, // Slightly faded to indicate it's not draggable
                          }}
                        >
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs>
                              <ListItemText primary={name} />
                            </Grid>
                            <Grid item>
                              <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => handleDelete(index)}
                              >
                                Delete
                              </Button>
                            </Grid>
                          </Grid>
                        </ListItem>
                      );
                    })}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </Container>
      </div>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Confirm Playlist Creation</DialogTitle>
        <DialogContent>
          <Typography>
            Once you create this playlist, you can only edit it **once**. Do you
            want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => navigate("/student/view-all-playlists")}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreatePlaylist}
            color="primary"
            variant="contained"
          >
            Yes, Create Playlist
          </Button>
        </DialogActions>
      </Dialog>
    </StudentPageWrapper>
  );
}

export default withAuth(EditPlaylistStudent, ROLE_STUDENT);
