import React from "react";
import {
  Table,
  Input,
  Button,
  Card,
  Divider,
  Grid,
  Modal,
} from "@geist-ui/core";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterNewPlaylistStudent() {
  const navigate = useNavigate();
  const notify = (x) => toast(x);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  let user = useUserStore((state) => state.user);
  const user_id = user?.user_id;
  const [planId, setPlanId] = useState(0);
  const [planDetails, setPlanDetails] = useState({});
  const [userPlaylist, setUserPlaylist] = useState({});
  const [asanas, setAsanas] = useState([]);
  const [playlist_temp, setPlaylistTemp] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [currentCount, setCurrentCount] = useState(0);
  const [maxCount, setMaxCount] = useState(0);
  const [maxStudId, setMaxStudId] = useState(0);
  const [idForUpdate, setIdForUpdate] = useState("");
  const [modalData, setModalData] = useState({
    rowData: {
      asana_name: "",
    },
    count: "",
    index: 0,
  });

  const findRecordByKeyValue = (array, key, value) => {
    return array.find((item) => item[key] === value);
  };
  const getMaxPlaylistCount = (userId, l1) => {
    const counts = l1
      .filter((id) => id.startsWith(`S_${userId}_`))
      .map((id) => parseInt(id.split("_")[2]));
    if (counts.length === 0) {
      return null;
    }
    return Math.max(...counts);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-playlists/getAllUserPlaylists",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const playlistIds = data.map((item) => item.playlist_id);
        if (getMaxPlaylistCount(user_id, playlistIds) != null) {
          setMaxStudId(getMaxPlaylistCount(user_id, playlistIds));
        } else {
          setMaxStudId(0);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof window !== "undefined") {
        try {
          const response = await fetch(
            "http://localhost:4000/user-plan/get-user-plan-by-id",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ user_id: user.user_id }),
            }
          );
          const data = await response.json();
          const retrievedPlanId = data?.userPlan?.plan_id;
          setPlanId(retrievedPlanId);
          if (retrievedPlanId) {
            try {
              const response1 = await fetch(
                "http://localhost:4000/plan/get-plan-by-id",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    plan_id: retrievedPlanId,
                  }),
                }
              );
              const data1 = await response1.json();
              if (data1["plan"]) {
                setPlanDetails(data1["plan"]);
                try {
                  const response3 = await fetch(
                    "http://localhost:4000/user-playlist-count/getAllUserPlaylistCounts"
                  );
                  const data3 = await response3.json();
                  const isUserPresent = data3.some(
                    (record) => record.user_id === user_id
                  );
                  if (isUserPresent) {
                    const record = findRecordByKeyValue(
                      data3,
                      "user_id",
                      user_id
                    );
                    setCurrentCount(record.current_count);
                    setMaxCount(record.maximum_count);
                  } else {
                    const maxPlaylistUserId = Math.max(
                      ...data3.map((record) => record.playlist_user_id),
                      0
                    );
                    const newRecord = {
                      playlist_user_id: maxPlaylistUserId + 1,
                      user_id: user_id,
                      user_type: "STUDENT",
                      current_count: 0,
                      maximum_count: data1["plan"]["playlist_creation_limit"],
                    };
                    try {
                      const response = await fetch(
                        "http://localhost:4000/user-playlist-count/addUserPlaylistCount",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify(newRecord),
                        }
                      );
                      if (response.ok) {
                        console.log("Count added successfully");
                      } else {
                        console.error("Failed to add count");
                      }
                    } catch (error) {
                      console.error("Error during count addition:", error);
                    }
                  }
                } catch (error) {
                  console.log(error);
                }
              }
            } catch (error) {
              console.log(error);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchData();
  }, [user_id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllAsanas"
        );
        const data = await response.json();
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

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

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
      setPlaylistTemp((prevPlaylist) =>
        prevPlaylist.filter((entry) => entry !== rowData)
      );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const playlist_name = document.querySelector("#playlist_name").value;
    const playlist_sequence = {};
    playlist_sequence["playlist_name"] = playlist_name;
    playlist_sequence["asana_ids"] = [];
    // const creation_date_and_time = currentDateTime;
    playlist_temp.map((item) => {
      const asana_id_playlist = item["rowData"]["id"];
      const asana_count = Number(item["count"]);
      for (let i = 0; i < asana_count; i++) {
        playlist_sequence["asana_ids"].push(Number(asana_id_playlist));
      }
    });
    // console.log(playlist_sequence, currentCount, maxCount, maxStudId);
    const newId = "S_" + String(user_id) + "_" + String(maxStudId + 1);
    const newRecord = {
      playlist_id: newId,
      playlist_user_id: user_id,
      user_type: user["role"]["name"],
      playlist_name: playlist_sequence["playlist_name"],
      asana_ids: playlist_sequence["asana_ids"],
    };
    console.log(newRecord);
    if (currentCount === maxCount) {
      console.log("LIMIT REACHED!!");
    } else {
      console.log("CAN ADD");
      try {
        const response = await fetch(
          "http://localhost:4000/user-playlists/addUserPlaylist",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newRecord),
          }
        );
        if (response.ok) {
          setMaxStudId((prevMaxStudId) => prevMaxStudId + 1);
          //post req to update prev count in userPlaylistCount by +1

          toast("Playlist added successfully");
        } else {
          console.error("Failed to add playlist");
        }
      } catch (error) {
        console.error("Error during playlist addition:", error);
      }
    }
  };

  const renderAction2 = (value, rowData, index) => {
    const inputId = `asana_count_${rowData.id}`;
    return (
      <div>
        <Input
          width="50%"
          id={inputId}
          placeholder="1"
          // type="number"
          min="1"
          pattern="\d+"
        />
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

  return (
    <div className="flex-col justify-center">
      <StudentNavbar />
      <br />
      <br />
      <Card width={50}>
        <h4>My Library</h4>
        <br />
        <h5>Maximum playlists that can be made : {maxCount}</h5>
        <h5>Playlists already made : {currentCount}</h5>
      </Card>

      <div className="flex items-center justify-center my-20 gap-8">
        <Card>
          <Table width={60} data={asanas} className="bg-white ">
            <Table.Column prop="asana_name" label="Asana Name" />
            <Table.Column prop="asana_category" label="Category" />
            <Table.Column
              prop="in_playlist"
              label="Add To Playlist"
              width={150}
              render={(value, rowData, index) =>
                renderAction2(value, rowData, index)
              }
            />
          </Table>
        </Card>
        {playlist_temp.length > 0 && (
          <Card>
            <Table width={40} data={playlist_temp} className="bg-dark ">
              <Table.Column
                prop="rowData.asana_name"
                label="Asana Name"
                render={(_, rowData) => {
                  return <p>{rowData.rowData.asana_name}</p>;
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
                prop="operation"
                label="ACTIONS"
                width={150}
                render={renderAction}
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
              <Button htmlType="submit">Submit</Button>
            </form>
          </Card>
        )}
      </div>

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
        <ToastContainer />
      </div>
    </div>
  );
}
