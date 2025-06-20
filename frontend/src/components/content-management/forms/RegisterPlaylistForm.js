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
  Typography,
} from "@mui/material";

import FilterAltIcon from "@mui/icons-material/FilterAlt";

import ExpandMore from "@mui/icons-material/ExpandMore";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import { TransitionEndStanding } from "../../transition-generator/transition-generator-helpers/TransitionEndStanding";
import { TransitionEndSitting } from "../../transition-generator/transition-generator-helpers/TransitionEndSitting";
import { TransitionEndSupine } from "../../transition-generator/transition-generator-helpers/TransitionEndSupine";
import { TransitionEndProne } from "../../transition-generator/transition-generator-helpers/TransitionEndProne";
import { TransitionEndPranayama } from "../../transition-generator/transition-generator-helpers/TransitionEndPranayama";
import { TransitionEndClosingPrayerSitting } from "../../transition-generator/transition-generator-helpers/TransitionEndClosingPrayerSitting";
import { TransitionEndClosingPrayerStanding } from "../../transition-generator/transition-generator-helpers/TransitionEndClosingPrayerStanding";
import { TransitionEndStartingPrayerStanding } from "../../transition-generator/transition-generator-helpers/TransitionEndStartingPrayerStanding";
import { TransitionEndStartingPrayerSitting } from "../../transition-generator/transition-generator-helpers/TransitionEndStartingPrayerSitting";
import { TransitionEndPranayamaPrayer } from "../../transition-generator/transition-generator-helpers/TransitionEndPranayamaPrayer";
import { TransitionEndSpecial } from "../../transition-generator/transition-generator-helpers/TransitionEndSpecial";
import { TransitionEndSuryanamaskaraStithi } from "../../transition-generator/transition-generator-helpers/TransitionEndSuryanamaskaraStithi";
import { TransitionEndSuryanamaskaraNonStithi } from "../../transition-generator/transition-generator-helpers/TransitionEndSuryanamaskaraNonStithi";
import { TransitionEndVajrasana } from "../../transition-generator/transition-generator-helpers/TransitionEndVajrasana";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function RegisterPlaylistForm() {
  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [names, setNames] = useState([]);
  const [playlistCurrent, setPlaylistCurrent] = useState([]);
  const [teacherModeFilter, setTeacherModeFilter] = useState(false);
  const [drmVideoFilter, setDrmVideoFilter] = useState(false);
  const [noBreakFilter, setNoBreakFilter] = useState(false);
  const [playlistName, setPlaylistName] = useState("");
  const [language, setLanguage] = useState("");
  const [playlistStartDate, setPlaylistStartDate] = useState("");
  const [playlistEndDate, setPlaylistEndDate] = useState("");
  const [playlistType, setPlaylistType] = useState("");
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [allLanguages, setAllLanguages] = useState([]);

  const handleNoBreakFilterChange = (event) => {
    setNoBreakFilter(event.target.checked);
  };

  const handleTeacherModeFilterChange = (event) => {
    setTeacherModeFilter(event.target.checked);
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
    console.log(playlistType);
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        console.log(playlistType);
        if (playlistType === "teacher") {
          setAsanas(response.data.filter((x) => x.drm_video === false));
        }
        if (playlistType === "student") {
          setAsanas(response.data.filter((x) => x.drm_video === true));
        } else {
          setAsanas(response.data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [playlistType]);

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

  const [currentTotalDuration, setCurrentTotalDuration] = useState(0);
  useEffect(() => {
    console.log("New Duration:", currentTotalDuration);
  }, [currentTotalDuration]); // Re-run when newDuration changes

  useEffect(() => {
    const fetchData = async () => {
      if (!playlistCurrent || !playlistCurrent.length) return; // Prevent API call if data is missing

      try {
        const response = await Fetch({
          url: "/content/playlists/calculateDuration",
          method: "POST",
          data: { items: playlistCurrent }, // Wrap in an object to match expected API format
        });

        if (response.status === 200) {
          console.log(response.data);
          setCurrentTotalDuration(response.data.totalDuration / 60);
        }
      } catch (err) {
        console.error("Error fetching duration:", err);
      }
    };

    if (playlistCurrent && asanas.length && transitions.length) {
      const newNames = playlistCurrent.map((id) => {
        if (typeof id === "string") {
          const transition = transitions.find((t) => t.transition_id === id);
          return transition
            ? transition.transition_video_name
            : "Unknown Transition";
        } else {
          const asana = asanas.find((a) => a.id === id);
          return asana ? asana.asana_name : "Unknown Asana";
        }
      });
      fetchData(); // Call only if playlistCurrent is valid
      setNames(newNames);
    }
  }, [playlistCurrent, asanas, transitions]);

  useEffect(() => {
    const s1 = asanas.sort((a, b) => {
      return (
        predefinedOrder.indexOf(a.asana_category) -
        predefinedOrder.indexOf(b.asana_category)
      );
    });
    setSortedAsanas(s1);
  }, [asanas]);

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

  const addToPlaylist = async (rowData) => {
    if (playlistCurrent.length === 0) {
      toast(rowData.asana_category);
      if (rowData.asana_category === "Sitting") {
        let t1 = await TransitionEndSitting(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Pranayama") {
        let t1 = await TransitionEndPranayama(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Closing Prayer Sitting") {
        let t1 = await TransitionEndClosingPrayerSitting(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Closing Prayer Standing") {
        let t1 = await TransitionEndClosingPrayerStanding(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Starting Prayer Standing") {
        let t1 = await TransitionEndStartingPrayerStanding(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Starting Prayer Sitting") {
        let t1 = await TransitionEndStartingPrayerSitting(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Pranayama Prayer") {
        let t1 = await TransitionEndPranayamaPrayer(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Standing") {
        let t1 = await TransitionEndStanding(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Supine") {
        let t1 = await TransitionEndSupine(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Prone") {
        let t1 = await TransitionEndProne(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Special") {
        let t1 = await TransitionEndSpecial(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Suryanamaskara Stithi") {
        let t1 = await TransitionEndSuryanamaskaraStithi(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Suryanamaskara Non Stithi") {
        let t1 = await TransitionEndSuryanamaskaraNonStithi(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
      if (rowData.asana_category === "Vajrasana") {
        let t1 = await TransitionEndVajrasana(
          null,
          null,
          rowData.nobreak_asana ? "No Break" : "Break",
          null,
          rowData,
          rowData.drm_video,
          transitions
        );
        console.log(t1);
        t1 = t1.filter((element) => element !== undefined);
        setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
      }
    } else {
      const lastId = playlistCurrent[playlistCurrent.length - 1];
      if (Number.isInteger(lastId)) {
        let prevAsana = await fetchAsanaById(lastId);
        console.log(prevAsana);
        if (prevAsana) {
          if (rowData.asana_category === "Sitting") {
            let t1 = await TransitionEndSitting(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            console.log(t1);
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Pranayama") {
            let t1 = await TransitionEndPranayama(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Closing Prayer Sitting") {
            let t1 = await TransitionEndClosingPrayerSitting(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Closing Prayer Standing") {
            let t1 = await TransitionEndClosingPrayerStanding(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Starting Prayer Standing") {
            let t1 = await TransitionEndStartingPrayerStanding(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Starting Prayer Sitting") {
            let t1 = await TransitionEndStartingPrayerSitting(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Pranayama Prayer") {
            let t1 = await TransitionEndPranayamaPrayer(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            console.log(t1);
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Standing") {
            let t1 = await TransitionEndStanding(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Supine") {
            let t1 = await TransitionEndSupine(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Prone") {
            let t1 = await TransitionEndProne(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Special") {
            let t1 = await TransitionEndSpecial(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Suryanamaskara Stithi") {
            let t1 = await TransitionEndSuryanamaskaraStithi(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Suryanamaskara Non Stithi") {
            let t1 = await TransitionEndSuryanamaskaraNonStithi(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
          if (rowData.asana_category === "Vajrasana") {
            let t1 = await TransitionEndVajrasana(
              // prevAsana.asana_category,
              "end_category" in prevAsana
                ? prevAsana.end_category
                : prevAsana.asana_category,
              prevAsana.nobreak_asana ? "No Break" : "Break",
              rowData.nobreak_asana ? "No Break" : "Break",
              prevAsana,
              rowData,
              rowData.drm_video,
              transitions
            );
            t1 = t1.filter((element) => element !== undefined);
            setPlaylistCurrent([...playlistCurrent, ...t1, rowData.id]);
          }
        }
      } else {
        toast("Last ID is not an integer");
      }
    }
  };

  const filteredAsanasByCategory = predefinedOrder.map((category) => {
    return {
      category: category,
      asanas: sortedAsanas.filter((asana) => asana.asana_category === category),
    };
  });

  const handleDrmVideoFilterChange = (event) => {
    setDrmVideoFilter(event.target.checked);
  };

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

  const filterAsanas = (playlist) => {
    return playlist.filter((id) => typeof id === "number");
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
          if (curAsana.asana_category === "Closing Prayer Sitting") {
            let t1 = await TransitionEndClosingPrayerSitting(
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
          if (curAsana.asana_category === "Closing Prayer Standing") {
            let t1 = await TransitionEndClosingPrayerStanding(
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
          if (curAsana.asana_category === "Starting Prayer Sitting") {
            let t1 = await TransitionEndStartingPrayerSitting(
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
          if (curAsana.asana_category === "Starting Prayer Standing") {
            let t1 = await TransitionEndStartingPrayerStanding(
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
          if (curAsana.asana_category === "Pranayama Prayer") {
            let t1 = await TransitionEndPranayamaPrayer(
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
          if (curAsana.asana_category === "Standing") {
            let t1 = await TransitionEndStanding(
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
          if (curAsana.asana_category === "Supine") {
            let t1 = await TransitionEndSupine(
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
          if (curAsana.asana_category === "Prone") {
            let t1 = await TransitionEndProne(
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
          if (curAsana.asana_category === "Special") {
            let t1 = await TransitionEndSpecial(
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
          if (curAsana.asana_category === "Suryanamaskara Stithi") {
            let t1 = await TransitionEndSuryanamaskaraStithi(
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
          if (curAsana.asana_category === "Vajrasana") {
            let t1 = await TransitionEndVajrasana(
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
          if (curAsana.asana_category === "Suryanamaskara Non Stithi") {
            let t1 = await TransitionEndSuryanamaskaraNonStithi(
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
            if (curAsana.asana_category === "Closing Prayer Sitting") {
              let t1 = await TransitionEndClosingPrayerSitting(
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
            if (curAsana.asana_category === "Closing Prayer Standing") {
              let t1 = await TransitionEndClosingPrayerStanding(
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
            if (curAsana.asana_category === "Starting Prayer Sitting") {
              let t1 = await TransitionEndStartingPrayerSitting(
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
            if (curAsana.asana_category === "Starting Prayer Standing") {
              let t1 = await TransitionEndStartingPrayerStanding(
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
            if (curAsana.asana_category === "Pranayama Prayer") {
              let t1 = await TransitionEndPranayamaPrayer(
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
            if (curAsana.asana_category === "Standing") {
              let t1 = await TransitionEndStanding(
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
            if (curAsana.asana_category === "Supine") {
              let t1 = await TransitionEndSupine(
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
            if (curAsana.asana_category === "Prone") {
              let t1 = await TransitionEndProne(
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
            if (curAsana.asana_category === "Special") {
              let t1 = await TransitionEndSpecial(
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
            if (curAsana.asana_category === "Suryanamaskara Stithi") {
              let t1 = await TransitionEndSuryanamaskaraStithi(
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
            if (curAsana.asana_category === "Vajrasana") {
              let t1 = await TransitionEndVajrasana(
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
            if (curAsana.asana_category === "Suryanamaskara Non Stithi") {
              let t1 = await TransitionEndSuryanamaskaraNonStithi(
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
          }
        }
        // recalculatedPlaylist.push(currentId);
      }
    }
    setPlaylistCurrent(recalculatedPlaylist);
  };

  const handleUp = async (index) => {
    toast(index);
    if (index > 0 && typeof playlistCurrent[index] === "number") {
      const asanasOnlyPlaylist = filterAsanas(playlistCurrent);
      console.log(asanasOnlyPlaylist);
      const asanaIndex = asanasOnlyPlaylist.indexOf(playlistCurrent[index]);
      if (asanaIndex - 1 >= 0) {
        [asanasOnlyPlaylist[asanaIndex - 1], asanasOnlyPlaylist[asanaIndex]] = [
          asanasOnlyPlaylist[asanaIndex],
          asanasOnlyPlaylist[asanaIndex - 1],
        ];
      }
      console.log(asanasOnlyPlaylist);
      await recalculateTransitions(asanasOnlyPlaylist);
    }
  };

  const handleDown = async (index) => {
    toast(index);
    toast(index);
    if (index > 0 && typeof playlistCurrent[index] === "number") {
      const asanasOnlyPlaylist = filterAsanas(playlistCurrent);
      console.log(asanasOnlyPlaylist);
      const asanaIndex = asanasOnlyPlaylist.indexOf(playlistCurrent[index]);
      if (asanaIndex + 1 < asanasOnlyPlaylist.length) {
        [asanasOnlyPlaylist[asanaIndex + 1], asanasOnlyPlaylist[asanaIndex]] = [
          asanasOnlyPlaylist[asanaIndex],
          asanasOnlyPlaylist[asanaIndex + 1],
        ];
      }
      console.log(asanasOnlyPlaylist);
      await recalculateTransitions(asanasOnlyPlaylist);
    }
  };

  const handleDelete = async (index) => {
    toast(index);
    if (typeof playlistCurrent[index] === "number") {
      const asanasOnlyPlaylist = filterAsanas(playlistCurrent);
      const asanaIndex = asanasOnlyPlaylist.indexOf(playlistCurrent[index]);
      asanasOnlyPlaylist.splice(asanaIndex, 1);
      console.log(asanasOnlyPlaylist);
      await recalculateTransitions(asanasOnlyPlaylist);
    }
  };

  const handleAddPlaylist = async () => {
    let newPlaylist = {
      playlist_name: playlistName,
      playlist_start_date: playlistStartDate,
      playlist_end_date: playlistEndDate,
      playlist_mode: playlistType,
      asana_ids: playlistCurrent,
      playlist_language: language,
      drm_playlist: drmVideoFilter,
    };
    if (
      playlistName.length === 0 ||
      playlistStartDate.length === 0 ||
      playlistEndDate.length === 0 ||
      playlistType.length === 0 ||
      language.length === 0 ||
      playlistCurrent.length === 0
    ) {
      toast("Missing required fields!");
      return;
    }
    try {
      const response = await Fetch({
        url: "/content/playlists/addPlaylist",
        method: "POST",
        data: newPlaylist,
      });
      if (response?.status === 200) {
        toast("Playlist added successfully");
        let new_playlist_id = response.data.playlist_id;
        console.log(response.data);
        try {
          const response = await Fetch({
            url: `/content/playlists/createManifest/${new_playlist_id}`,
            method: "POST",
          });
          if (response?.status === 200) {
            toast("Manifest Generated");
            navigate("/admin/playlist/view-all");
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        console.error("Failed to add playlist");
      }
    } catch (error) {
      console.error("Error during playlist addition:", error);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 mb-4">
          <TextField
            label="Playlist Name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Validity Start Date"
            type="date"
            value={playlistStartDate}
            onChange={(e) => setPlaylistStartDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <TextField
            label="Validity End Date"
            type="date"
            value={playlistEndDate}
            onChange={(e) => setPlaylistEndDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {allLanguages.map((x) => {
                return <MenuItem value={x.language}>{x.language}</MenuItem>;
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Playlist Type</InputLabel>
            <Select
              value={playlistType}
              onChange={(e) => setPlaylistType(e.target.value)}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </Select>
          </FormControl>
        </div>

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
            <div>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: 2,
                  width: "fit-content",
                  mx: "auto",
                }}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Current Duration
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary">
                  {currentTotalDuration
                    ? currentTotalDuration.toFixed(1)
                    : "0.0"}{" "}
                  mins
                </Typography>
              </Paper>
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
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddPlaylist}
          >
            Add Playlist
          </Button>
        </div>
      </div>
    </div>
  );
}
export default RegisterPlaylistForm;
