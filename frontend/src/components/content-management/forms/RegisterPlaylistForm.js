import {
  Button,
  Card,
  Divider,
  Grid,
  Input,
  Modal,
  Table,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminNavbar from "../../Common/AdminNavbar/AdminNavbar";

export default function RegisterPlaylistForm() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
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
          "http://localhost:4000/content/video/getAllAsanas"
        );
        const data = await response.json();
        setAsanas(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const sortedData = [...asanas].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.asana_category.localeCompare(b.asana_category);
      } else {
        return b.asana_category.localeCompare(a.asana_category);
      }
    });
    setSortedAsanas(sortedData);
  }, [asanas, sortOrder]);

  const addToPlaylist = (rowData) => {
    const count = document.getElementById(`asana_count_${rowData.id}`).value;
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
    try {
      const response = await fetch("http://localhost:4000/addPlaylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playlist_sequence),
      });
      if (response.ok) {
        toast("Playlist added successfully");
        navigate("/admin/allPlaylists");
      } else {
        console.error("Failed to add playlist");
      }
    } catch (error) {
      console.error("Error during playlist addition:", error);
    }
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
  return (
    <div className="video_form min-h-screen">
      <AdminNavbar />
      <div className="flex items-center justify-center my-20 gap-8">
        <Table width={60} data={sortedAsanas} className="bg-white ">
          <Table.Column prop="asana_name" label="Asana Name" />
          <Table.Column prop="asana_category" label="Category" />
          <Table.Column
            prop="in_playlist"
            label="Add To Playlist"
            width={150}
            render={renderAction2}
          />
        </Table>
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
      <ToastContainer />
    </div>
  );
}
