import {
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";

function RegisterNewPlaylistStudent() {
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const [playlistName, setPlaylistName] = useState(null);
  const [language, setLanguage] = useState("");
  const [allLanguages, setAllLanguages] = useState([]);
  const [asanas, setAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [names, setNames] = useState([]);
  const [playlistCurrent, setPlaylistCurrent] = useState([]);

  const handleDragEnd = (result) => {
    if (!result.destination) return; // If dropped outside, do nothing

    const newPlaylist = [...playlistCurrent];
    const [movedItem] = newPlaylist.splice(result.source.index, 1); // Remove item
    newPlaylist.splice(result.destination.index, 0, movedItem); // Insert at new position

    setPlaylistCurrent(newPlaylist);
  };

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
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/language/getAllLanguages",
        });
        const data = response.data;
        console.log(data);
        setAllLanguages(data);
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
    const s1 = asanas.sort((a, b) => {
      return (
        predefinedOrder.indexOf(a.asana_category) -
        predefinedOrder.indexOf(b.asana_category)
      );
    });
    setSortedAsanas(s1);
  }, [asanas]);

  const filteredAsanasByCategory = predefinedOrder.map((category) => {
    return {
      category: category,
      asanas: sortedAsanas.filter((asana) => asana.asana_category === category),
    };
  });

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

  const addToPlaylist = async (rowData) => {
    setPlaylistCurrent([...playlistCurrent, rowData.id]);
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
            if (curAsana.asana_category === "Starting Prayer Standing") {
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
    console.log(recalculatedPlaylist);
    setPlaylistCurrent(recalculatedPlaylist);
    let saveObject = {
      user_id: user.user_id,
      playlist_name: playlistName,
      asana_ids: recalculatedPlaylist,
      playlist_language: language,
      playlist_mode: "Student",
    };
    const response = await Fetch({
      url: "/user-playlists/create",
      method: "POST",
      data: saveObject,
    });
    if (response.status === 200) {
      toast("Playlist updated successfully!");
    }

    // formValues.asana_ids = recalculatedPlaylist;
    // const response = await Fetch({
    //   url: `/content/playlists/updatePlaylist/${playlist_id}`,
    //   method: "PUT",
    //   data: formValues,
    // });
    // if (response.status === 200) {
    //   toast("Playlist updated successfully!");

    //   try {
    //     const manifestResponse = await Fetch({
    //       url: `/content/playlists/createManifest/${playlist_id}`,
    //       method: "POST",
    //     });

    //     if (manifestResponse?.status === 200) {
    //       toast("Manifest Generated!");
    //     }
    //   } catch (manifestError) {
    //     console.error("Error generating manifest:", manifestError);
    //   }

    //   navigate("/admin/playlist/view-all");
    // } else {
    //   toast("Error updating playlist:", response.status);
    // }
  };

  const handleAddPlaylist = async () => {
    try {
      await recalculateTransitions(playlistCurrent);
    } catch (error) {
      console.error("Error updating playlist:", error);
    }
  };

  useEffect(() => {
    const newNames = playlistCurrent.map((id) => {
      const asana = asanas.find((a) => a.id === id);
      if (!asana) {
        const transition = transitions.find((a) => a.transition_id === id);
        return transition
          ? transition.transition_video_name
          : "Unknown Transition";
      }
      return asana ? asana.asana_name : "Unknown Asana";
    });
    setNames(newNames);
  }, [playlistCurrent, asanas, transitions]);

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
    <StudentPageWrapper heading="Create Playlist">
      <div className="flex flex-col gap-4 mb-4">
        <TextField
          label="Playlist Name"
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {allLanguages.map((x) => (
              <MenuItem key={x.language} value={x.language}>
                {x.language}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

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
                        {x.asanas
                          .slice()
                          .sort((a, b) =>
                            a.asana_name.localeCompare(b.asana_name)
                          )
                          .map((asana, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{asana.asana_name}</TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  onClick={() => addToPlaylist(asana)}
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

          {/* Drag-and-Drop Playlist */}
          <div>
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
          </div>
        </div>

        <Button variant="contained" color="primary" onClick={handleAddPlaylist}>
          Add Playlist
        </Button>
      </div>
    </StudentPageWrapper>
  );

  // return (
  //   <StudentPageWrapper heading="Create Playlist">
  //     <div className="flex flex-col gap-4 mb-4">
  //       <TextField
  //         label="Playlist Name"
  //         value={playlistName}
  //         onChange={(e) => setPlaylistName(e.target.value)}
  //         fullWidth
  //       />
  //       <FormControl fullWidth>
  //         <InputLabel>Language</InputLabel>
  //         <Select
  //           value={language}
  //           onChange={(e) => setLanguage(e.target.value)}
  //         >
  //           {allLanguages.map((x) => {
  //             return <MenuItem value={x.language}>{x.language}</MenuItem>;
  //           })}
  //         </Select>
  //       </FormControl>
  //     </div>

  //     <div className="flex flex-col gap-4">
  //       <div className="flex flex-row gap-3">
  //         <div>
  //           {filteredCategories.map((x, index) => (
  //             <Accordion key={index} className="flex flex-col gap-2">
  //               <AccordionSummary
  //                 expandIcon={<ExpandMore />}
  //                 aria-controls="panel1-content"
  //                 id="panel1-header"
  //               >
  //                 {x.category}
  //               </AccordionSummary>
  //               <AccordionDetails>
  //                 <TableContainer component={Paper}>
  //                   <Table>
  //                     <TableHead>
  //                       <TableRow>
  //                         <TableCell>Asana Name</TableCell>
  //                       </TableRow>
  //                     </TableHead>
  //                     <TableBody>
  //                       {x.asanas
  //                         .slice()
  //                         .sort((a, b) =>
  //                           a.asana_name.localeCompare(b.asana_name)
  //                         )
  //                         .map((asana, idx) => (
  //                           <TableRow key={idx}>
  //                             <TableCell>{asana.asana_name}</TableCell>
  //                             <TableCell>
  //                               <Button
  //                                 variant="contained"
  //                                 onClick={() => {
  //                                   addToPlaylist(asana);
  //                                 }}
  //                               >
  //                                 Add
  //                               </Button>
  //                             </TableCell>
  //                           </TableRow>
  //                         ))}
  //                     </TableBody>
  //                   </Table>
  //                 </TableContainer>
  //               </AccordionDetails>
  //             </Accordion>
  //           ))}
  //         </div>
  //         <div>
  //           <List>
  //             {names.map((name, index) => (
  //               <ListItem
  //                 key={index}
  //                 style={{
  //                   border: "1px solid #ccc",
  //                   borderRadius: "8px",
  //                   marginBottom: "8px",
  //                   padding: "8px",
  //                 }}
  //               >
  //                 <Grid container alignItems="center" spacing={2}>
  //                   <Grid item xs>
  //                     <ListItemText primary={name} />
  //                   </Grid>
  //                   {typeof playlistCurrent[index] === "number" && (
  //                     <Grid item>
  //                       <Button
  //                         variant="contained"
  //                         color="primary"
  //                         onClick={() => handleUp(index)}
  //                         style={{ marginRight: 8 }}
  //                       >
  //                         Up
  //                       </Button>
  //                       <Button
  //                         variant="contained"
  //                         color="primary"
  //                         onClick={() => handleDown(index)}
  //                         style={{ marginRight: 8 }}
  //                       >
  //                         Down
  //                       </Button>
  //                       <Button
  //                         variant="contained"
  //                         color="secondary"
  //                         onClick={() => handleDelete(index)}
  //                       >
  //                         Delete
  //                       </Button>
  //                     </Grid>
  //                   )}
  //                 </Grid>
  //               </ListItem>
  //             ))}
  //           </List>
  //         </div>
  //       </div>
  //       <Button variant="contained" color="primary" onClick={handleAddPlaylist}>
  //         Add Playlist
  //       </Button>
  //     </div>
  //   </StudentPageWrapper>
  // );
}

export default withAuth(RegisterNewPlaylistStudent, "STUDENT");
