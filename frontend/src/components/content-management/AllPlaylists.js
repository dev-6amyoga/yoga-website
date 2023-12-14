import {
  Button,
  Grid,
  Input,
  Modal,
  Table,
  Text,
  Select,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import AdminNavbar from "../Common/AdminNavbar/AdminNavbar";
import "./AllPlaylists.css";

export default function AllPlaylists() {
  const [delState, setDelState] = useState(false);
  const [delPlaylistId, setDelPlaylistId] = useState(0);
  const closeDelHandler = (event) => {
    setDelState(false);
  };

  const [playlist1, setPlaylist1] = useState([]);
  const [playlistAsanas, setPlaylistAsanas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedPlaylists, setSortedPlaylists] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    playlist_id: 0,
    playlist_name: "",
    asana_ids: [],
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/playlists/getAllPlaylists"
        );
        const data = await response.json();
        setPlaylist1(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllAsanas"
        );
        const data = await response.json();
        setPlaylistAsanas(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const sortedData = [...playlist1].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.playlist_name.localeCompare(b.playlist_name);
      } else {
        return b.playlist_name.localeCompare(a.playlist_name);
      }
    });
    setSortedPlaylists(sortedData);
  }, [playlist1, sortOrder]);

  const updateData = async () => {
    try {
      const playlistId = Number(modalData.playlist_id);
      console.log(modalData);
      const response = await fetch(
        `http://localhost:4000/content/playlists/updatePlaylist/${playlistId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modalData),
        }
      );
      if (response.ok) {
        console.log("Playlist updated successfully");
        setPlaylist1((prev) =>
          prev.map((p1) => (p1.playlist_id === playlistId ? modalData : p1))
        );
        setModalState(false);
      } else {
        console.log("Error updating asana:", response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleAsanaNameChange = (value, index) => {
    const updatedAsanaIds = [...modalData.asana_ids];
    const selectedAsana = playlistAsanas.find(
      (asana) => asana.asana_name === value
    );
    updatedAsanaIds[index] = selectedAsana ? selectedAsana.id : value;
    setModalData((prevData) => ({ ...prevData, asana_ids: updatedAsanaIds }));
  };

  const deletePlaylist = async () => {
    try {
      const playlistId = delPlaylistId;
      const response = await fetch(
        `http://localhost:4000/content/playlists/deletePlaylist/${playlistId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("Response from server:", response);
        setPlaylist1((prev) =>
          prev.filter((playlist) => playlist.playlist_id !== playlistId)
        );
        console.log("Playlist deleted successfully");
      } else {
        console.log("Error deleting playlist:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };

  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const playlist_id = Number(rowData.playlist_id);
        setDelPlaylistId(playlist_id);
        setDelState(true);
      } catch (error) {
        console.error(error);
      }
    };

    const handleUpdate = async () => {
      console.log("IN UPDATE!");
      setModalData(rowData);
      setModalState(true);
    };

    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            type="error"
            auto
            scale={1 / 3}
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
            scale={1 / 3}
            font="12px"
            onClick={() => handleUpdate(Number(rowData.playlist_id))}
          >
            Update
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  return (
    <div className="allAsanas min-h-screen">
      <AdminNavbar />
      <div className="elements">
        {loading ? (
          <Text>Loading</Text>
        ) : (
          <Table width={100} data={sortedPlaylists} className="bg-white ">
            <Table.Column prop="playlist_id" label="Playlist ID" />
            <Table.Column prop="playlist_name" label="Playlist Name" />

            <Table.Column
              prop="asana_ids"
              label="Asana Names"
              render={(value, rowData) => (
                <div>
                  {value.map((asanaId, index) => {
                    const asana = playlistAsanas.find(
                      (asana) => asana.id === asanaId
                    );
                    return (
                      <div key={index}>
                        {asana ? asana.asana_name : asanaId}
                      </div>
                    );
                  })}
                </div>
              )}
            />

            <Table.Column
              prop="operation"
              label="ACTIONS"
              width={150}
              render={renderAction}
            />
          </Table>
        )}
      </div>
      <div>
        <Modal visible={modalState} onClose={() => setModalState(false)}>
          <Modal.Title>Update Playlist</Modal.Title>
          <Modal.Subtitle>{modalData.playlist_name}</Modal.Subtitle>
          <Modal.Content>
            <form>
              <Input
                width="100%"
                id="playlist_name"
                placeholder={modalData.playlist_name}
                onChange={handleInputChange}
              >
                Playlist Name
              </Input>
              {modalData.asana_ids.map((asanaId, index) => {
                const asana = playlistAsanas.find(
                  (asana) => asana.id === asanaId
                );
                const asanaName = asana ? asana.asana_name : asanaId;
                return (
                  <div>
                    <Text>Asana {index + 1}</Text>
                    <Select
                      key={index}
                      width="100%"
                      placeholder={`Select Asana ${index + 1}`}
                      value={asanaName}
                      onChange={(value) => handleAsanaNameChange(value, index)}
                    >
                      {playlistAsanas.map((asanaOption) => (
                        <Select.Option
                          key={asanaOption.id}
                          value={asanaOption.asana_name}
                        >
                          {asanaOption.asana_name}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                );
              })}
            </form>
          </Modal.Content>
          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>

        <Modal visible={delState} onClose={closeDelHandler}>
          <Modal.Title>Delete Playlist</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this playlist?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDelState(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deletePlaylist}>Yes</Modal.Action>
        </Modal>
      </div>
    </div>
  );
}
