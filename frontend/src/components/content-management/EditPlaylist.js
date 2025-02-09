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
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Fetch } from "../../utils/Fetch";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { toast } from "react-toastify";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import { TransitionEndStanding } from "../transition-generator/transition-generator-helpers/TransitionEndStanding";
import { TransitionEndSitting } from "../transition-generator/transition-generator-helpers/TransitionEndSitting";
import { TransitionEndSupine } from "../transition-generator/transition-generator-helpers/TransitionEndSupine";
import { TransitionEndProne } from "../transition-generator/transition-generator-helpers/TransitionEndProne";
import { TransitionEndPranayama } from "../transition-generator/transition-generator-helpers/TransitionEndPranayama";
import { TransitionEndClosingPrayerSitting } from "../transition-generator/transition-generator-helpers/TransitionEndClosingPrayerSitting";
import { TransitionEndClosingPrayerStanding } from "../transition-generator/transition-generator-helpers/TransitionEndClosingPrayerStanding";
import { TransitionEndStartingPrayerStanding } from "../transition-generator/transition-generator-helpers/TransitionEndStartingPrayerStanding";
import { TransitionEndStartingPrayerSitting } from "../transition-generator/transition-generator-helpers/TransitionEndStartingPrayerSitting";
import { TransitionEndPranayamaPrayer } from "../transition-generator/transition-generator-helpers/TransitionEndPranayamaPrayer";
import { TransitionEndSpecial } from "../transition-generator/transition-generator-helpers/TransitionEndSpecial";
import { TransitionEndSuryanamaskaraStithi } from "../transition-generator/transition-generator-helpers/TransitionEndSuryanamaskaraStithi";
import { TransitionEndSuryanamaskaraNonStithi } from "../transition-generator/transition-generator-helpers/TransitionEndSuryanamaskaraNonStithi";
import { TransitionEndVajrasana } from "../transition-generator/transition-generator-helpers/TransitionEndVajrasana";

function EditPlaylist() {
  const { playlist_id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [asanas, setAsanas] = useState([]);
  const [names, setNames] = useState([]);
  const [teacherModeFilter, setTeacherModeFilter] = useState(false);
  const [sortedAsanas, setSortedAsanas] = useState([]);

  const predefinedOrder = [
    "Starting Prayer Standing",
    "Starting Prayer Sitting",
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

  const handleTeacherModeFilterChange = (event) => {
    setTeacherModeFilter(event.target.checked);
  };

  const [drmVideoFilter, setDrmVideoFilter] = useState(false);

  const handleDrmVideoFilterChange = (event) => {
    setDrmVideoFilter(event.target.checked);
  };

  const [noBreakFilter, setNoBreakFilter] = useState(false);

  const handleNoBreakFilterChange = (event) => {
    setNoBreakFilter(event.target.checked);
  };

  const [playlistCurrent, setPlaylistCurrent] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  const filteredAsanasByCategory = predefinedOrder.map((category) => {
    return {
      category: category,
      asanas: sortedAsanas.filter((asana) => asana.asana_category === category),
    };
  });

  const filteredCategories = filteredAsanasByCategory
    .map((category) => ({
      ...category,
      asanas: category.asanas.filter((asana) => {
        return (
          (!teacherModeFilter || asana.teacher_mode === teacherModeFilter) &&
          (!drmVideoFilter || asana.drm_video === drmVideoFilter) &&
          (!noBreakFilter || asana.nobreak_asana === noBreakFilter)
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
          console.log(currentId);
          const curAsana = await fetchAsanaById(currentId);
          console.log(curAsana);
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
          console.log(transitionData);
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
        // recalculatedPlaylist.push(currentId);
      }
    }
    setPlaylistCurrent(recalculatedPlaylist);
    formValues.asana_ids = recalculatedPlaylist;
    const response = await Fetch({
      url: `/content/playlists/updatePlaylist/${playlist_id}`,
      method: "PUT",
      data: formValues,
    });
    if (response.status === 200) {
      toast("Playlist updated successfully!");

      try {
        const manifestResponse = await Fetch({
          url: `/content/playlists/createManifest/${playlist_id}`,
          method: "POST",
        });

        if (manifestResponse?.status === 200) {
          toast("Manifest Generated!");
        }
      } catch (manifestError) {
        console.error("Error generating manifest:", manifestError);
      }

      navigate("/admin/playlist/view-all");
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

  const handleUp = async (index) => {
    toast("Moving up!!");
    if (index > 0 && typeof playlistCurrent[index] === "number") {
      const newPlaylist = [...playlistCurrent];
      [newPlaylist[index - 1], newPlaylist[index]] = [
        newPlaylist[index],
        newPlaylist[index - 1],
      ];
      setPlaylistCurrent(newPlaylist);
    }
  };

  const handleDown = async (index) => {
    toast("Moving down!!");
    if (
      index < playlistCurrent.length - 1 &&
      typeof playlistCurrent[index] === "number"
    ) {
      const newPlaylist = [...playlistCurrent];
      [newPlaylist[index + 1], newPlaylist[index]] = [
        newPlaylist[index],
        newPlaylist[index + 1],
      ];
      setPlaylistCurrent(newPlaylist);
    }
  };

  const handleDelete = async (index) => {
    if (typeof playlistCurrent[index] === "number") {
      toast("Deleting!!");
      const newPlaylist = playlistCurrent.filter((_, i) => i !== index);
      setPlaylistCurrent(newPlaylist);
    }
  };

  return (
    <AdminPageWrapper
      heading="Edit Playlist"
      className="flex flex-col items-center justify-items-center"
    >
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

            <Grid item xs={12}>
              {/* asana picker */}

              <div className="flex flex-col gap-4">
                <div className="filter-options flex flex-row items-center justify-center gap-4 p-4 mb-4 border rounded-lg">
                  <FilterAltIcon />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={teacherModeFilter}
                        onChange={handleTeacherModeFilterChange}
                        name="teacherMode"
                        color="primary"
                      />
                    }
                    label="Teacher Mode"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={drmVideoFilter}
                        onChange={handleDrmVideoFilterChange}
                        name="drmVideo"
                        color="primary"
                      />
                    }
                    label="DRM Video"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={noBreakFilter}
                        onChange={handleNoBreakFilterChange}
                        name="noBreak"
                        color="primary"
                      />
                    }
                    label="No Break"
                  />
                </div>
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
          <div>
            <List>
              {names.map((name, index) => (
                <ListItem
                  key={index}
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    padding: "8px",
                  }}
                >
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs>
                      <ListItemText primary={name} />
                    </Grid>
                    {typeof playlistCurrent[index] === "number" && (
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleUp(index)}
                          style={{ marginRight: 8 }}
                        >
                          Up
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleDown(index)}
                          style={{ marginRight: 8 }}
                        >
                          Down
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleDelete(index)}
                        >
                          Delete
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </ListItem>
              ))}
            </List>
          </div>
        </Container>
      </div>
    </AdminPageWrapper>
  );
}

export default EditPlaylist;
