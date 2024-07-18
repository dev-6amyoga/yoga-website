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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionActions,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { transitionGenerator } from "../../transition-generator/TransitionGenerator";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import { ArrowDown, ArrowUp } from "@geist-ui/icons";
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

function RegisterPlaylistForm() {
  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const predefinedOrder = [
    "Starting Prayer Standing",
    "Surynamaskara Non Stithi",
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
  const [sortedAsanas, setSortedAsanas] = useState([]);
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

  const [playlistCurrent, setPlaylistCurrent] = useState([]);

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
    console.log(playlistCurrent, "is p");
  }, [playlistCurrent]);

  const addToPlaylist = async (rowData) => {
    console.log(playlistCurrent.length);
    if (playlistCurrent.length === 0) {
      if (rowData.asana_category === "Sitting") {
        let t1 = await TransitionEndSitting(
          null,
          null,
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
          rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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
              prevAsana.asana_category,
              prevAsana.nobreak_asana,
              rowData.nobreak_asana,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const playlist_name = document.querySelector("#playlist_name").value;
    const playlist_sequence = {};
    playlist_sequence["playlist_name"] = playlist_name;
    playlist_sequence["asana_ids"] = [];
    //insert modal here
    try {
      const response = await Fetch({
        url: "/content/playlists/addPlaylist",
        method: "POST",
        data: playlist_sequence,
      });
      if (response?.status === 200) {
        toast("Playlist added successfully");
        navigate("/admin/playlist/view-all");
      } else {
        console.error("Failed to add playlist");
      }
    } catch (error) {
      console.error("Error during playlist addition:", error);
    }
  };

  const filteredAsanasByCategory = predefinedOrder.map((category) => {
    return {
      category: category,
      asanas: sortedAsanas.filter((asana) => asana.asana_category === category),
    };
  });

  const [teacherModeFilter, setTeacherModeFilter] = useState(false);
  const [drmVideoFilter, setDrmVideoFilter] = useState(false);
  const handleTeacherModeFilterChange = (event) => {
    setTeacherModeFilter(event.target.checked);
  };

  const handleDrmVideoFilterChange = (event) => {
    setDrmVideoFilter(event.target.checked);
  };

  const filteredCategories = filteredAsanasByCategory
    .map((category) => ({
      ...category,
      asanas: category.asanas.filter((asana) => {
        return (
          (!teacherModeFilter || asana.teacher_mode === teacherModeFilter) &&
          (!drmVideoFilter || asana.drm_video === drmVideoFilter)
        );
      }),
    }))
    .filter((category) => category.asanas.length > 0);

  return (
    <div>
      <div>
        {/* Filter Options */}
        <div className="filter-options flex flex-col gap-4 mb-4">
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
        </div>

        <div>
          {filteredCategories.map((x, index) => {
            return (
              <Accordion className="flex flex-col gap-2">
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="panel1-content"
                  id="panel1-header"
                >
                  {x.category}
                </AccordionSummary>
                <AccordionDetails>
                  {/* {x.asanas.map((x) => {
                    return <div>{x.asana_name}</div>;
                  })} */}
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
                            <Button
                              variant="contained"
                              onClick={() => {
                                addToPlaylist(asana);
                              }}
                            >
                              Add
                            </Button>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      </div>
    </div>
    // <div className="">
    //   <div className="grid grid-cols-3 gap-4">
    //     <div className="flex flex-row">
    //       <Toggle
    //         initialChecked={showTeacherMode}
    //         onChange={() => setShowTeacherMode((prevMode) => !prevMode)}
    //       />
    //       <Text h6>{showTeacherMode ? "Teacher Mode" : "Normal Mode"}</Text>
    //     </div>
    //     <div className="flex flex-row">
    //       <Toggle
    //         initialChecked={showDrm}
    //         onChange={() => setShowDrm((prevMode) => !prevMode)}
    //       />
    //       <Text h6>{showDrm ? "DRM Videos" : "Non DRM Videos"}</Text>
    //     </div>
    //     <Spacer />
    //     <Collapse.Group className="col-span-2 col-start-1">
    //       {filteredAsanasByCategory.map((categoryData, index) => (
    //         <Collapse title={categoryData.category} key={index}>
    //           <Table data={categoryData.asanas} className="bg-white">
    //             <Table.Column prop="asana_name" label="Asana Name" />
    //             {/* <Table.Column
    //               prop="language"
    //               label="Language"
    //               render={(data) => {
    //                 if (data === "") {
    //                   return "No Audio";
    //                 }
    //                 return data.language;
    //               }}
    //             /> */}
    //             <Table.Column
    //               prop="nobreak_asana"
    //               label="No Break?"
    //               render={(data) => {
    //                 if (data) {
    //                   return "Yes";
    //                 } else {
    //                   return "No";
    //                 }
    //               }}
    //             />
    //             <Table.Column prop="asana_category" label="Category" />
    //             <Table.Column
    //               prop="in_playlist"
    //               label="Add To Playlist"
    //               width={150}
    //               render={renderAction2}
    //             />
    //           </Table>
    //         </Collapse>
    //       ))}
    //     </Collapse.Group>

    //     <Card width={40}>
    //       <Table data={playlist_temp}>
    //         <Table.Column
    //           prop="rowData.asana_name"
    //           label="Asana Name"
    //           render={(_, rowData) => {
    //             return (
    //               <p>
    //                 {rowData.rowData.asana_name
    //                   ? rowData.rowData.asana_name
    //                   : rowData.rowData.transition_video_name || ""}
    //               </p>
    //             );
    //           }}
    //         />
    //         <Table.Column
    //           prop="rowData.asana_category"
    //           label="Category"
    //           render={(_, rowData) => {
    //             return <p>{rowData.rowData.asana_category}</p>;
    //           }}
    //         />
    //         <Table.Column
    //           prop="rowData.teacher_mode"
    //           label="Mode"
    //           render={(_, rowData) => {
    //             return (
    //               <p>{rowData.rowData.teacher_mode ? "Teacher" : "Normal"}</p>
    //             );
    //           }}
    //         />
    //         <Table.Column prop="count" label="Count" />
    //         <Table.Column
    //           prop="reorder"
    //           label="Reorder"
    //           width={150}
    //           render={(value, rowData, index) => {
    //             if (rowData.rowData?.asana_name) {
    //               return asanaIcons(value, rowData, index);
    //             } else {
    //               return null;
    //             }
    //           }}
    //         />

    //         <Table.Column
    //           prop="operations"
    //           label="ACTIONS"
    //           width={150}
    //           render={(value, rowData) => {
    //             if (rowData.rowData?.asana_name) {
    //               return renderAction(value, rowData);
    //             } else {
    //               return null;
    //             }
    //           }}
    //         />
    //       </Table>
    //       <Divider />
    //       <form
    //         className="my-10 flex-col items-center justify-center space-y-10"
    //         onSubmit={handleSubmit}
    //       >
    //         <Input width="100%" id="playlist_name">
    //           Playlist Name
    //         </Input>
    //         <br />
    //         <br />
    //         <Text>
    //           Playlist Duration : {(totalDuration / 60).toFixed(2)} minutes
    //         </Text>

    //         <Button htmlType="submit">Submit</Button>
    //       </form>
    //     </Card>
    //   </div>

    //   <Modal visible={modalState} onClose={() => setModalState(false)}>
    //     <Modal.Title>Update</Modal.Title>
    //     <Modal.Subtitle>{modalData.rowData.asana_name}</Modal.Subtitle>
    //     <Modal.Content>
    //       <form>
    //         <Input
    //           width="100%"
    //           id="asana_count_playlist"
    //           placeholder={modalData.count}
    //           onChange={handleInputChange}
    //         >
    //           Count
    //         </Input>
    //       </form>
    //     </Modal.Content>
    //     <Modal.Action passive onClick={() => setModalState(false)}>
    //       Cancel
    //     </Modal.Action>
    //     <Modal.Action onClick={updateData}>Update</Modal.Action>
    //   </Modal>
    // </div>
  );
}

export default RegisterPlaylistForm;
