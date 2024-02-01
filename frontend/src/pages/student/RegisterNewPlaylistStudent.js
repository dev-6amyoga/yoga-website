import React from "react";
import {
  Table,
  Input,
  Button,
  Card,
  Divider,
  Grid,
  Modal,
  Select,
} from "@geist-ui/core";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterNewPlaylistStudent() {
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const [asanas, setAsanas] = useState([]);
  const [playlist_temp, setPlaylistTemp] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    rowData: {
      asana_name: "",
    },
    count: "",
    index: 0,
  });

  const [userPlaylists, setUserPlaylists] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/user-playlists/getAllUserPlaylists/${user?.user_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const playlistIds = data.map((item) => item.playlist_id);
        setUserPlaylists(data);
      } catch (error) {
        toast(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllAsanas"
        );
        const data = await response.json();
        setAsanas(data);
      } catch (error) {
        toast(error);
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
    playlist_temp.map((item) => {
      const asana_id_playlist = item["rowData"]["id"];
      const asana_count = Number(item["count"]);
      for (let i = 0; i < asana_count; i++) {
        playlist_sequence["asana_ids"].push(Number(asana_id_playlist));
      }
    });
    const newId =
      "S_" + String(user?.user_id) + "_" + String(userPlaylists.length + 1);
    const newRecord = {
      playlist_id: newId,
      playlist_user_id: user?.user_id,
      playlist_name: playlist_sequence["playlist_name"],
      asana_ids: playlist_sequence["asana_ids"],
    };
    console.log(newRecord);
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
        toast("Playlist added successfully");
        navigate("/student/view-all-playlists");
      } else {
        console.error("Failed to add playlist");
      }
    } catch (error) {
      console.error("Error during playlist addition:", error);
    }
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

  const [filterCategory, setFilterCategory] = useState("");

  const uniqueCategories = [
    "All",
    ...new Set(asanas.map((asana) => asana.asana_category)),
  ];

  const filteredAsanas = asanas.filter(
    (asana) =>
      filterCategory === "All" ||
      asana.asana_category.toLowerCase().includes(filterCategory.toLowerCase())
  );

  return (
    <div className="flex-col justify-center">
      <StudentNavbar />
      <br />
      <br />
      <div className="flex items-center justify-center my-20 gap-8">
        <Card>
          <Table width={60} data={filteredAsanas} className="bg-white ">
            <Table.Column prop="asana_name" label="Asana Name" />
            <Table.Column prop="asana_category" label="Category">
              <Select
                placeholder="Select Category"
                width="150px"
                groupedBy
                onChange={(value) => setFilterCategory(value)}
              >
                {uniqueCategories.map((category, index) => (
                  <Select.Option key={index} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </Table.Column>
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
