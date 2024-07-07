import {
  Button,
  Card,
  Divider,
  Grid,
  Input,
  Modal,
  Table,
  Text,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import { transitionGenerator } from "../../components/transition-generator/TransitionGenerator";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { MonthlyPlaylistChecker } from "../../utils/MonthlyPlaylistChecker";
import { withAuth } from "../../utils/withAuth";

function RegisterNewPlaylistStudent() {
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const [asanas, setAsanas] = useState([]);
  const [submitModalState, setSubmitModalState] = useState(false);
  const [playlist_temp, setPlaylistTemp] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [transitions, setTransitions] = useState([]);
  const [monthlyLimitUnattained, setMonthlyLimitUnattained] = useState(true);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playlistDurationLimit, setPlaylistDurationLimit] = useState(0);
  const [playlistEditLimit, setPlaylistEditLimit] = useState(0);
  const [monthlyPlaylistLimit, setMonthlyPlaylistLimit] = useState(0);
  const [durationToggle, setDurationToggle] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await Fetch({
          url: "/playlist-configs/getAllConfigs",
        });
        const maxPlaylistDuration = data.find(
          (config) => config.playlist_config_name === "PLAYLIST_DURATION"
        );
        const playlistEditCount = data.find(
          (config) => config.playlist_config_name === "PLAYLIST_EDIT_LIMIT"
        );
        const monthlyPlaylistLimit = data.find(
          (config) => config.playlist_config_name === "MONTHLY_PLAYLIST_LIMIT"
        );
        setMonthlyPlaylistLimit(monthlyPlaylistLimit.playlist_config_value);
        setPlaylistDurationLimit(maxPlaylistDuration.playlist_config_value);
        setPlaylistEditLimit(playlistEditCount.playlist_config_value);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const newTotalDuration = playlist_temp.reduce(
      (sum, asana) => sum + (asana.rowData.duration || 0) * asana.count,
      0
    );
    setTotalDuration(newTotalDuration);
  }, [playlist_temp, playlist_temp.map((asana) => asana.count)]);

  useEffect(() => {
    const totalDurationInHours = parseFloat((totalDuration / 60).toFixed(2));
    if (totalDurationInHours > playlistDurationLimit) {
      toast("The maximum duration of the playlist is 80 minutes!");
      setDurationToggle(true);
    } else {
      setDurationToggle(false);
    }
  }, [totalDuration, playlistDurationLimit]);

  const [modalData, setModalData] = useState({
    rowData: {
      asana_name: "",
    },
    count: "",
    index: 0,
  });

  const predefinedOrder = [
    "Warm Up",
    "Suryanamaskara",
    "Standing",
    "Sitting",
    "Supine",
    "Prone",
    "Pranayama",
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllTransitions",
        });
        const data = response.data;
        setTransitions(data);
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
          url: `/user-playlists/getAllUserPlaylists/${user?.user_id}`,
          method: "GET",
        });
        const data = response.data;
        const current_count = data?.length;
        if (monthlyPlaylistLimit !== 0) {
          if (current_count >= monthlyPlaylistLimit) {
            toast(
              "You cannot make any more playlists this month. You have reached your maximum allowed playlists for this month."
            );
            setMonthlyLimitUnattained(false);
          }
        }
        setUserPlaylists(data);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const x = await MonthlyPlaylistChecker(user?.user_id, "STUDENT");
          if (x === -1) {
            toast("You cannot make any more playlists this month!");
          }
        } catch (error) {
          console.error("Error in MonthlyPlaylistChecker:", error);
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        const data = response.data;
        setAsanas(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };

  const updateData = () => {
    const x = document.getElementById("asana_count_playlist").value;
    const entryToUpdate = playlist_temp[modalData.index];
    if (entryToUpdate) {
      entryToUpdate.count = x;
    }
    setModalState(false);
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
      const updatedRowData = { ...rowData, index: index };
      setModalData(updatedRowData);
      setModalState(true);
    };

    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            type="error"
            auto
            scale={1 / 5}
            font="12px"
            onClick={handleDelete}
          >
            Remove
          </Button>
        </Grid>
        <Grid>
          <Button
            type="warning"
            auto
            scale={1 / 5}
            font="12px"
            onClick={() => handleUpdate(Number(rowData.id))}
          >
            Update
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  const addToPlaylist = (rowData, inputId, index) => {
    const countInput = document.getElementById(inputId);
    const countValue = countInput ? countInput.value : "";
    const count = countValue === "" ? 1 : parseInt(countValue, 10);
    if (!isNaN(count)) {
      if (playlist_temp.length === 0) {
        const x = transitionGenerator("start", rowData, transitions);
        if (x.length !== 0) {
          setPlaylistTemp((prev) => [
            ...prev,
            ...x.map((item) => ({ rowData: item, count: 1 })),
          ]);
        }
      } else {
        let startVideo = playlist_temp[playlist_temp.length - 1].rowData;
        let endVideo = rowData;
        const x = transitionGenerator(startVideo, endVideo, transitions);
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
    } else {
      toast("Invalid count entered. Please enter a valid number.");
    }
  };

  const addPlaylist = async (e) => {
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
    const newId =
      "S_" + String(user?.user_id) + "_" + String(userPlaylists.length + 1);
    const newRecord = {
      playlist_id: newId,
      playlist_user_id: user?.user_id,
      playlist_name: playlist_sequence["playlist_name"],
      max_edit_count: Number(playlistEditLimit),
      current_edit_count: 0,
      asana_ids: playlist_sequence["asana_ids"],
      duration: playlist_sequence["duration"],
    };
    try {
      const response = await Fetch({
        url: "/user-playlists/addUserPlaylist",
        method: "POST",
        data: newRecord,
      });
      if (response?.status === 200) {
        toast("Playlist added successfully");
        navigate("/student/view-all-playlists");
      } else {
        console.error("Failed to add playlist");
      }
    } catch (error) {
      console.error("Error during playlist addition:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitModalState(true);
  };

  const renderAction2 = (value, rowData, index) => {
    const inputId = `asana_count_${rowData.id}`;
    return (
      <div>
        <Input width="50%" id={inputId} placeholder="1" min="1" pattern="\d+" />
        <Button
          type="warning"
          auto
          scale={1 / 3}
          font="12px"
          onClick={() => addToPlaylist(rowData, inputId, index)}
        >
          Add
        </Button>
      </div>
    );
  };

  const uniqueCategories = [
    ...new Set(sortedAsanas.map((asana) => asana.asana_category)),
  ];

  const filteredAsanas = sortedAsanas.filter((asana) =>
    asana.asana_category.toLowerCase().includes(filterCategory.toLowerCase())
  );

  const filteredAsanasByCategory = uniqueCategories.map((category) => {
    return {
      category: category,
      asanas: filteredAsanas.filter(
        (asana) => asana.asana_category === category
      ),
    };
  });

  return (
    <div className="flex-col justify-center">
      <StudentNavbar />
      {monthlyLimitUnattained && (
        <div className="flex justify-center my-10 gap-8">
          <div className="flex flex-col items-center justify-center my-10 gap-1">
            {filteredAsanasByCategory.map((categoryData, index) => (
              <Card key={index} shadow width="100%">
                <Card.Content>
                  <h6>{categoryData.category}</h6>
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

                    <Table.Column prop="asana_category" label="Category" />
                    <Table.Column
                      prop="in_playlist"
                      label="Add To Playlist"
                      width={150}
                      render={renderAction2}
                    />
                  </Table>
                </Card.Content>
              </Card>
            ))}
          </div>
          {playlist_temp.length > 0 && (
            <Card height="50%">
              <Table width={40} data={playlist_temp} className="bg-dark ">
                <Table.Column
                  prop="rowData.asana_name"
                  label="Asana Name"
                  render={(_, rowData) => {
                    return (
                      <p>
                        {rowData.rowData.asana_name
                          ? rowData.rowData.asana_name
                          : rowData.rowData.transition_video_name}
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
                  prop="rowData.language"
                  label="Language"
                  render={(_, rowData) => {
                    return <p>{rowData.rowData.language}</p>;
                  }}
                />
                <Table.Column prop="count" label="Count" />
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
                className="flex-col items-center justify-center space-y-10 my-10"
                onSubmit={handleSubmit}
              >
                <Input width="100%" id="playlist_name">
                  Playlist Name
                </Input>
                <Text>
                  Playlist Duration : {(totalDuration / 60).toFixed(2)} minutes
                </Text>

                <Button htmlType="submit" disabled={durationToggle}>
                  Submit
                </Button>
              </form>
            </Card>
          )}
        </div>
      )}

      {!monthlyLimitUnattained && (
        <Card>
          <Card.Content>
            <h3 className="text-center">Update Email ID</h3>
          </Card.Content>
        </Card>
      )}

      <div>
        <Modal visible={modalState} onClose={() => setModalState(false)}>
          <Modal.Title>Update</Modal.Title>
          <Modal.Subtitle>{modalData.rowData.asana_name}</Modal.Subtitle>
          <Modal.Subtitle>{modalData.index}</Modal.Subtitle>
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
      <div>
        <Modal
          visible={submitModalState}
          onClose={() => setSubmitModalState(false)}
        >
          <Modal.Title>Confirmation Screen</Modal.Title>
          <Modal.Subtitle>
            {"Are you sure you want to make this playlist?"}
          </Modal.Subtitle>
          <Modal.Content>
            <Text>
              Kindly note that you can edit this playlist {playlistEditLimit}{" "}
              times.
            </Text>
            <Text>
              You can make {monthlyPlaylistLimit} number of playlists per month.
            </Text>
          </Modal.Content>
          <Modal.Action passive onClick={() => setSubmitModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={addPlaylist}>Agree</Modal.Action>
        </Modal>
      </div>
    </div>
  );
}

export default withAuth(RegisterNewPlaylistStudent, "STUDENT");
