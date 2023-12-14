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

export default function RegisterNewPlaylistStudent() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);
  let user = useUserStore((state) => state.user);
  const user_id = user.user_id;
  const [planId, setPlanId] = useState(0);
  const [planDetails, setPlanDetails] = useState({});
  const [asanas, setAsanas] = useState([]);
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
        setPlanId(data["userPlan"]["plan_id"]);
        try {
          const response1 = await fetch(
            "http://localhost:4000/plan/get-plan-by-id",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                plan_id: planId,
              }),
            }
          );
          const data1 = await response1.json();
          if (data1["plan"]) {
            setPlanDetails(data1["plan"]);
          }
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
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
  const renderAction = (value, rowData, index) => {
    const handleDelete = () => {
      setPlaylistTemp((prevPlaylist) =>
        prevPlaylist.filter((entry) => entry !== rowData)
      );
    };
    const handleUpdate = async () => {
      setModalData(rowData);
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

  const addToPlaylist = (rowData) => {
    var count = document.getElementById(`asana_count_${rowData.id}`).value;
    if (count === "") {
      count = 1;
    }
    setPlaylistTemp((prevPlaylist) => [
      ...prevPlaylist,
      {
        rowData: rowData,
        count: count,
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const playlist_name = document.querySelector("#playlist_name").value;
    const playlist_sequence = {};
    playlist_sequence["playlist_name"] = playlist_name;
    playlist_sequence["asana_ids"] = [];
    const creation_date_and_time = currentDateTime;
    console.log(creation_date_and_time);
    playlist_temp.map((item) => {
      const asana_id_playlist = item["rowData"]["id"];
      const asana_count = Number(item["count"]);
      for (let i = 0; i < asana_count; i++) {
        playlist_sequence["asana_ids"].push(Number(asana_id_playlist));
      }
    });
    console.log(playlist_sequence);
    //   try {
    //     const response = await fetch(
    //       "http://localhost:4000/content/playlists/addPlaylist",
    //       {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify(playlist_sequence),
    //       }
    //     );
    //     if (response.ok) {
    //       toast("Playlist added successfully");
    //       navigate("/admin/allPlaylists");
    //     } else {
    //       console.error("Failed to add playlist");
    //     }
    //   } catch (error) {
    //     console.error("Error during playlist addition:", error);
    //   }
  };

  //   based on user_id, get their plan id and plan details. from plan details extract max playlist count.
  // check if user_id is there in userPlaylistCount else add
  //if there, extract current playlist count and max playlist count.
  //get names of current playlists also.
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
  return (
    <div className="flex-col justify-center">
      <StudentNavbar />
      <br />
      <br />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-7 gap-4 my-10">Make Playlist</div>
        <div>{planId}</div>
        <div>{planDetails.name}</div>
        <div>{planDetails.playlist_creation_limit}</div>
      </div>
      <div className="flex items-center justify-center my-20 gap-8">
        <Card>
          <Table width={60} data={asanas} className="bg-white ">
            <Table.Column prop="asana_name" label="Asana Name" />
            <Table.Column prop="asana_category" label="Category" />
            <Table.Column
              prop="in_playlist"
              label="Add To Playlist"
              width={150}
              render={renderAction2}
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
    </div>
  );
}
