import {
  Button,
  Card,
  Collapse,
  Divider,
  Input,
  Modal,
  Spacer,
  Table,
  Text,
  Toggle,
} from "@geist-ui/core";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import { transitionGenerator } from "../../transition-generator/TransitionGenerator";
import { ArrowDown, ArrowUp } from "@geist-ui/icons";
function RegisterPlaylistForm() {
  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [showTeacherMode, setShowTeacherMode] = useState(false);
  const [transitions, setTransitions] = useState([]);
  const [playlistMode, setPlaylistMode] = useState("");
  const predefinedOrder = [
    "Prayer Standing",
    "Prayer Sitting",
    "Surynamaskara With Prefix-Suffix",
    "Suryanamaskara Without Prefix-Suffix",
    "Standing",
    "Sitting",
    "Supine",
    "Prone",
    "Vajrasana",
    "Pranayama",
    "Special",
  ];
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [playlist_temp, setPlaylistTemp] = useState([]);
  const [modalState, setModalState] = useState(false);

  const [modalData, setModalData] = useState({
    rowData: {
      asana_name: "",
    },
    count: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (showTeacherMode == true) {
        try {
          const response = await Fetch({
            url: "/content/video/getTeacherAsanas",
          });
          setAsanas(response.data);
        } catch (error) {
          toast(error);
        }
      } else {
        try {
          const response = await Fetch({
            url: "/content/video/getNonTeacherAsanas",
          });
          setAsanas(response.data);
        } catch (error) {
          toast(error);
        }
      }
    };
    fetchData();
  }, [showTeacherMode]);

  useEffect(() => {
    const s1 = asanas.sort((a, b) => {
      return (
        predefinedOrder.indexOf(a.asana_category) -
        predefinedOrder.indexOf(b.asana_category)
      );
    });
    setSortedAsanas(s1);
  }, [asanas]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllTransitions",
        });
        const data = response.data;
        setTransitions(data);
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);

  async function getRowDataById(asana_id) {
    try {
      const response = await Fetch({
        url: "/content/get-asana-by-id",
        method: "POST",
        data: {
          asana_id: asana_id,
        },
      });

      if (response?.status === 200) {
        return response.data;
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  const addToPlaylist = (rowData) => {
    let manifestURL = rowData.asana_dash_url;
    let asana_mode = rowData.teacher_mode;
    console.log(asana_mode);
    if (playlist_temp.length > 0) {
      console.log(playlist_temp[playlist_temp.length - 1].rowData.teacher_mode);
      if (
        playlist_temp[playlist_temp.length - 1].rowData.teacher_mode === true
      ) {
        setPlaylistMode("Teacher");
        if (asana_mode === false) {
          toast(
            "You cannot insert Normal Mode Asanas in a Teacher Mode Playlist"
          );
          return;
        }
      }
      if (
        playlist_temp[playlist_temp.length - 1].rowData.teacher_mode === false
      ) {
        setPlaylistMode("Normal");
        if (asana_mode === true) {
          toast(
            "You cannot insert Teacher Mode Asanas in a Normal Mode Playlist"
          );
          return;
        }
      }
    }

    var count = document.getElementById(`asana_count_${rowData.id}`).value;
    if (count === "") {
      count = 1;
    } else if (
      isNaN(count) ||
      !Number.isInteger(Number(count)) ||
      Number(count) < 1
    ) {
      toast("Invalid count entered. Please try again.");
      return;
    } else {
      count = Number(count);
    }
    if (playlist_temp.length === 0) {
      const x = transitionGenerator(
        "start",
        rowData,
        transitions,
        showTeacherMode
      );
      if (x.length !== 0) {
        setPlaylistTemp((prev) => [
          ...prev,
          ...x.map((item) => ({ rowData: item, count: 1 })),
        ]);
      }
    } else {
      let startVideo = playlist_temp[playlist_temp.length - 1].rowData;
      let endVideo = rowData;
      const x = transitionGenerator(
        startVideo,
        endVideo,
        transitions,
        showTeacherMode
      );
      if (x.length !== 0) {
        setPlaylistTemp((prev) => [
          ...prev,
          ...x.map((item) => ({ rowData: item, count: 1 })),
        ]);
      }
    }
    setPlaylistTemp((prevPlaylist) => [
      ...prevPlaylist,
      {
        rowData: rowData,
        count: count,
      },
    ]);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };

  const updateData = () => {
    const x = document.getElementById("asana_count_playlist").value;
    for (var entry in playlist_temp) {
      if (
        playlist_temp[entry].rowData.asana_name === modalData.rowData.asana_name
      ) {
        playlist_temp[entry].count = x;
      }
    }
    setModalState(false);
  };

  const renderAction2 = (value, rowData, index) => {
    const inputId = `asana_count_${rowData.id}`;
    return (
      <div>
        <Input width="50%" id={inputId} placeholder="1" />
        <Button
          type="warning"
          auto
          scale={1 / 3}
          font="12px"
          onClick={() => addToPlaylist(rowData)}
        >
          Add
        </Button>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const playlist_name = document.querySelector("#playlist_name").value;
    const playlist_sequence = {};
    playlist_sequence["playlist_name"] = playlist_name;
    playlist_sequence["asana_ids"] = [];

    playlist_temp.map((item) => {
      const asana_id_playlist =
        item["rowData"]["id"] || item["rowData"]["transition_id"];
      const asana_count = Number(item["count"]);
      for (let i = 0; i < asana_count; i++) {
        playlist_sequence["asana_ids"].push(asana_id_playlist);
      }
    });
    playlist_sequence["duration"] = totalDuration;
    const response1 = await Fetch({
      url: "/content/get-asana-by-id",
      method: "POST",
      data: {
        asana_id:
          playlist_sequence["asana_ids"][
            playlist_sequence["asana_ids"].length - 1
          ],
      },
    });
    if (response1?.status === 200) {
      if (response1.data.asana_category === "Prayer Sitting") {
        const matchingTransition1 = transitions.find((transition) => {
          return (
            transition.transition_video_name === "Prayer Sitting Full Unlock"
          );
        });
        playlist_sequence["asana_ids"].push(matchingTransition1.transition_id);
      }
      if (response1.data.asana_category === "Prayer Standing") {
        const matchingTransition1 = transitions.find((transition) => {
          return transition.transition_video_name === "Prayer Standing End";
        });
        playlist_sequence["asana_ids"].push(matchingTransition1.transition_id);
      }
    }
    playlist_sequence["playlist_mode"] = playlistMode;
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

  const renderAction = (value, rowData, index) => {
    const handleDelete = () => {
      setPlaylistTemp((prevSchedule) => {
        const currentIndex = prevSchedule.findIndex(
          (entry) => entry === rowData
        );
        const prevAsanaIndex = prevSchedule
          .slice(0, currentIndex)
          .reverse()
          .findIndex((entry) => {
            return (
              entry.rowData?.asana_name && !entry.rowData?.transition_video_name
            );
          });
        const prevAsana =
          prevAsanaIndex !== -1
            ? prevSchedule[currentIndex - prevAsanaIndex - 1]
            : null;
        const nextAsanaIndex = prevSchedule
          .slice(currentIndex + 1)
          .findIndex((entry) => entry.rowData?.asana_name);
        const startIndex =
          prevAsanaIndex !== -1 ? currentIndex - prevAsanaIndex : 0;
        const endIndex =
          nextAsanaIndex !== -1 ? currentIndex + 1 + nextAsanaIndex : undefined;
        const nextAsana =
          nextAsanaIndex !== -1
            ? prevSchedule[currentIndex + 1 + nextAsanaIndex]
            : null;
        const filteredSchedule = prevSchedule.filter(
          (_, index) =>
            index < startIndex || (endIndex !== undefined && index >= endIndex)
        );
        let updatedSchedule = [];
        if (prevAsana === null && nextAsana !== null) {
          const x = transitionGenerator(
            "start",
            nextAsana.rowData,
            transitions
          );
          if (x.length !== 0) {
            updatedSchedule = [
              ...x.map((item) => ({ rowData: item, count: 1 })),
              ...filteredSchedule,
            ];
          }
        }
        if (prevAsana !== null && nextAsana === null) {
          updatedSchedule = filteredSchedule;
        }
        if (prevAsana === null && nextAsana === null) {
          updatedSchedule = filteredSchedule;
        }
        if (prevAsana !== null && nextAsana !== null) {
          const x = transitionGenerator(
            prevAsana.rowData,
            nextAsana.rowData,
            transitions
          );
          updatedSchedule = [
            ...filteredSchedule.slice(
              0,
              filteredSchedule.findIndex((entry) => entry === prevAsana) + 1
            ),
            ...x.map((item) => ({ rowData: item, count: 1 })),
            ...filteredSchedule.slice(
              filteredSchedule.findIndex((entry) => entry === nextAsana)
            ),
          ];
        }
        return updatedSchedule;
      });
    };
    const handleUpdate = async () => {
      setModalData(rowData);
      setModalState(true);
    };

    return (
      <div>
        <Button
          type="error"
          auto
          scale={1 / 5}
          font="12px"
          onClick={handleDelete}
        >
          Remove
        </Button>
        <Button
          type="warning"
          auto
          scale={1 / 5}
          font="12px"
          onClick={() => handleUpdate(Number(rowData.id))}
        >
          Update
        </Button>
      </div>
    );
  };

  // const asanaIcons = (value, rowData, index) => {
  //   const upClicked = () => {
  //     console.log(playlist_temp);
  //     let x = "Up clicked!" + rowData.rowData.asana_name;
  //     toast(x);
  //   };
  //   const downClicked = () => {
  //     console.log(playlist_temp);
  //     let x = "Down clicked!" + rowData.rowData.asana_name;
  //     toast(x);
  //   };
  //   return (
  //     <div>
  //       <Button type="success" scale={1 / 8} onClick={upClicked}>
  //         <ArrowUp />
  //       </Button>
  //       <Button type="success" scale={1 / 8} onClick={downClicked}>
  //         <ArrowDown />
  //       </Button>
  //     </div>
  //   );
  // };

  const asanaIcons = (value, rowData, index) => {
    const upClicked = async () => {
      let updated_sequence = [];
      const idsArray = playlist_temp.map((rowData) => {
        const id = rowData.rowData.transition_id || rowData.rowData.id;
        return id;
      });
      const filteredArray = idsArray.filter((element) =>
        Number.isInteger(element)
      );
      const currentIndex = filteredArray.indexOf(rowData.rowData.id);
      if (currentIndex > 0) {
        const temp = filteredArray[currentIndex - 1];
        filteredArray[currentIndex - 1] = filteredArray[currentIndex];
        filteredArray[currentIndex] = temp;
      }
      console.log(filteredArray);
      for (let i = 0; i < filteredArray.length; i++) {
        let prevAsanaId;
        if (i === 0) {
          prevAsanaId = "start";
        } else {
          prevAsanaId = filteredArray[i - 1];
        }
        const nextAsanaId = filteredArray[i];
        try {
          let prevAsanaRowData;
          if (prevAsanaId === "start") {
            prevAsanaRowData = "start";
          } else {
            prevAsanaRowData = await getRowDataById(prevAsanaId);
          }
          const nextAsanaRowData = await getRowDataById(nextAsanaId);
          const x = transitionGenerator(
            prevAsanaRowData,
            nextAsanaRowData,
            transitions
          );
          if (prevAsanaId === "start") {
            if (x.length > 0) {
              updated_sequence.push(...x);
            }
            updated_sequence.push(nextAsanaId);
          } else {
            // updated_sequence.push(prevAsanaId);
            if (x.length > 0) {
              updated_sequence.push(...x);
            }

            updated_sequence.push(nextAsanaId);
          }
        } catch (err) {
          console.log(err);
        }
      }
      console.log("UPDATED : ", updated_sequence, playlist_temp);
      setPlaylistTemp(updated_sequence);
      let x = "Up clicked!" + rowData.rowData.asana_name;
      toast(x);
    };

    const downClicked = async () => {
      let updated_sequence = [];
      const idsArray = playlist_temp.map((rowData) => {
        const id = rowData.rowData.transition_id || rowData.rowData.id;
        return id;
      });
      const filteredArray = idsArray.filter((element) =>
        Number.isInteger(element)
      );
      const currentIndex = filteredArray.indexOf(rowData.rowData.id);
      if (currentIndex < filteredArray.length - 1 && currentIndex !== -1) {
        const temp = filteredArray[currentIndex + 1];
        filteredArray[currentIndex + 1] = filteredArray[currentIndex];
        filteredArray[currentIndex] = temp;
      }
      console.log(filteredArray);
      for (let i = 0; i < filteredArray.length; i++) {
        let prevAsanaId;
        if (i === 0) {
          prevAsanaId = "start";
        } else {
          prevAsanaId = filteredArray[i - 1];
        }
        const nextAsanaId = filteredArray[i];
        try {
          let prevAsanaRowData;
          if (prevAsanaId === "start") {
            prevAsanaRowData = "start";
          } else {
            prevAsanaRowData = await getRowDataById(prevAsanaId);
          }
          const nextAsanaRowData = await getRowDataById(nextAsanaId);
          const x = transitionGenerator(
            prevAsanaRowData,
            nextAsanaRowData,
            transitions
          );
          if (prevAsanaId === "start") {
            if (x.length > 0) {
              updated_sequence.push(...x);
            }
            updated_sequence.push(nextAsanaId);
          } else {
            // updated_sequence.push(prevAsanaId);
            if (x.length > 0) {
              updated_sequence.push(...x);
            }
            updated_sequence.push(nextAsanaId);
          }
        } catch (err) {
          console.log(err);
        }
      }

      console.log("UPDATED : ", updated_sequence, playlist_temp);
      setPlaylistTemp(updated_sequence);
      let x = "Down clicked!" + rowData.rowData.asana_name;
      toast(x);
    };

    return (
      <div>
        <Button type="success" scale={1 / 8} onClick={upClicked}>
          <ArrowUp />
        </Button>
        <Button type="success" scale={1 / 8} onClick={downClicked}>
          <ArrowDown />
        </Button>
      </div>
    );
  };

  const filteredAsanasByCategory = predefinedOrder.map((category) => {
    return {
      category: category,
      asanas: sortedAsanas.filter((asana) => asana.asana_category === category),
    };
  });

  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    const newTotalDuration = playlist_temp.reduce(
      (sum, asana) => sum + (asana.rowData.duration || 0) * asana.count,
      0
    );
    setTotalDuration(newTotalDuration);
  }, [playlist_temp, playlist_temp.map((asana) => asana.count)]);

  return (
    <div className="">
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-row">
          <Toggle
            initialChecked={showTeacherMode}
            onChange={() => setShowTeacherMode((prevMode) => !prevMode)}
          />
          <Text h6>{showTeacherMode ? "Teacher Mode" : "Normal Mode"}</Text>
        </div>
        <Spacer />
        <Collapse.Group className="col-span-2 col-start-1">
          {filteredAsanasByCategory.map((categoryData, index) => (
            <Collapse title={categoryData.category} key={index}>
              <Table data={categoryData.asanas} className="bg-white">
                <Table.Column prop="asana_name" label="Asana Name" />
                <Table.Column
                  prop="language"
                  label="Language"
                  render={(data) => {
                    if (data === "") {
                      return "No Audio";
                    }
                    return data.language;
                  }}
                />
                <Table.Column
                  prop="nobreak_asana"
                  label="No Break?"
                  render={(data) => {
                    if (data) {
                      return "Yes";
                    } else {
                      return "No";
                    }
                  }}
                />
                <Table.Column prop="asana_category" label="Category" />
                <Table.Column
                  prop="in_playlist"
                  label="Add To Playlist"
                  width={150}
                  render={renderAction2}
                />
              </Table>
            </Collapse>
          ))}
        </Collapse.Group>

        <Card width={40}>
          <Table data={playlist_temp}>
            <Table.Column
              prop="rowData.asana_name"
              label="Asana Name"
              render={(_, rowData) => {
                return (
                  <p>
                    {rowData.rowData.asana_name
                      ? rowData.rowData.asana_name
                      : rowData.rowData.transition_video_name || ""}
                  </p>
                );
              }}
            />
            <Table.Column
              prop="rowData.asana_category"
              label="Category"
              render={(_, rowData) => {
                return <p>{rowData.rowData.asana_category}</p>;
              }}
            />
            <Table.Column
              prop="rowData.teacher_mode"
              label="Mode"
              render={(_, rowData) => {
                return (
                  <p>{rowData.rowData.teacher_mode ? "Teacher" : "Normal"}</p>
                );
              }}
            />
            <Table.Column prop="count" label="Count" />
            <Table.Column
              prop="reorder"
              label="Reorder"
              width={150}
              render={(value, rowData, index) => {
                if (rowData.rowData?.asana_name) {
                  return asanaIcons(value, rowData, index);
                } else {
                  return null;
                }
              }}
            />

            <Table.Column
              prop="operations"
              label="ACTIONS"
              width={150}
              render={(value, rowData) => {
                if (rowData.rowData?.asana_name) {
                  return renderAction(value, rowData);
                } else {
                  return null;
                }
              }}
            />
          </Table>
          <Divider />
          <form
            className="my-10 flex-col items-center justify-center space-y-10"
            onSubmit={handleSubmit}
          >
            <Input width="100%" id="playlist_name">
              Playlist Name
            </Input>
            <br />
            <br />
            <Text>
              Playlist Duration : {(totalDuration / 60).toFixed(2)} minutes
            </Text>

            <Button htmlType="submit">Submit</Button>
          </form>
        </Card>
      </div>

      <Modal visible={modalState} onClose={() => setModalState(false)}>
        <Modal.Title>Update</Modal.Title>
        <Modal.Subtitle>{modalData.rowData.asana_name}</Modal.Subtitle>
        <Modal.Content>
          <form>
            <Input
              width="100%"
              id="asana_count_playlist"
              placeholder={modalData.count}
              onChange={handleInputChange}
            >
              Count
            </Input>
          </form>
        </Modal.Content>
        <Modal.Action passive onClick={() => setModalState(false)}>
          Cancel
        </Modal.Action>
        <Modal.Action onClick={updateData}>Update</Modal.Action>
      </Modal>
    </div>
  );
}

export default RegisterPlaylistForm;
