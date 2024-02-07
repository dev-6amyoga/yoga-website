import {
  Button,
  Grid,
  Input,
  Modal,
  Table,
  Text,
  Select,
  Tooltip,
  Card,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { Search } from "@geist-ui/icons";
import AdminNavbar from "../Common/AdminNavbar/AdminNavbar";
import Papa from "papaparse";
import {
  PlusCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  XCircle,
} from "@geist-ui/icons";
import { transitionGenerator } from "../transition-generator/TransitionGenerator";
import { toast } from "react-toastify";

export default function AllPlaylists() {
  const [delState, setDelState] = useState(false);
  const [delPlaylistId, setDelPlaylistId] = useState(0);
  const closeDelHandler = (event) => {
    setDelState(false);
  };
  const [playlist1, setPlaylist1] = useState([]);
  const [playlistAsanas, setPlaylistAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortedPlaylists, setSortedPlaylists] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    playlist_id: 0,
    playlist_name: "",
    asana_ids: [],
  });

  useEffect(() => {
    console.log("MODAL DATA IS : ", modalData);
  }, [modalData]);
  const handleDownload = (data1) => {
    const csv = Papa.unparse(data1);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransitions, setFilteredTransitions] = useState([]);
  useEffect(() => {
    if (searchTerm.length > 0) {
      setFilteredTransitions(
        playlist1.filter((transition) =>
          transition.playlist_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredTransitions(playlist1);
    }
  }, [searchTerm]);
  const [newAsana, setNewAsana] = useState({ id: "", asana_name: "" });
  const handleAddNewAsana = () => {
    setModalData((prevData) => ({
      ...prevData,
      asana_ids: [...prevData.asana_ids, newAsana.id],
    }));
  };
  useEffect(() => {
    const fetchData = async (playlistId) => {
      try {
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
          setPlaylist1((prev) =>
            prev.filter((playlist) => playlist.playlist_id !== playlistId)
          );
          setFilteredTransitions((prev) =>
            prev.filter((playlist) => playlist.playlist_id !== playlistId)
          );
        } else {
          toast("Error deleting playlist:", response.status);
        }
      } catch (error) {
        toast(error);
      }
    };
    for (var i = 0; i != playlist1.length; i++) {
      if (playlist1[i].asana_ids.length === 0) {
        fetchData(playlist1[i].playlist_id);
      }
    }
  }, [playlist1]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/playlists/getAllPlaylists"
        );
        const data = await response.json();
        setPlaylist1(data);
        setFilteredTransitions(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast(error);
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
        toast(error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllTransitions"
        );
        const data = await response.json();
        setTransitions(data);
      } catch (error) {
        toast(error);
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
        setPlaylist1((prev) =>
          prev.map((p1) => (p1.playlist_id === playlistId ? modalData : p1))
        );
        setFilteredTransitions((prev) =>
          prev.map((p1) => (p1.playlist_id === playlistId ? modalData : p1))
        );
        setModalState(false);
      } else {
        toast("Error updating playlist:", response.status);
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
        setPlaylist1((prev) =>
          prev.filter((playlist) => playlist.playlist_id !== playlistId)
        );
      } else {
        toast("Error deleting playlist:", response.status);
      }
      setDelState(false);
    } catch (error) {
      toast(error);
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

  const handleAsanaReorder = (index, direction) => {
    let asanas_before = [];
    let asanas_after = [];
    for (var i = 0; i < modalData.asana_ids.length; i++) {
      if (
        !Number(modalData.asana_ids[i]) &&
        modalData.asana_ids[i].startsWith("T_")
      ) {
      } else {
        if (i < index) {
          asanas_before.push({ index: i, asana_id: modalData.asana_ids[i] });
        }
        if (i > index) {
          asanas_after.push({ index: i, asana_id: modalData.asana_ids[i] });
        }
      }
    }
    let prevAsana = asanas_before[asanas_before.length - 1];
    let prevOfPrevAsana = asanas_before[asanas_before.length - 2];
    let nextAsana = asanas_after[0];
    let nextOfNextAsana = asanas_after[1];
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < modalData.asana_ids.length - 1)
    ) {
      if (direction === "up") {
        console.log(modalData.asana_ids[index], " moved up.");
        console.log("Next asana now becomes : ", prevAsana);
        console.log("Previous asana now becomes : ", prevOfPrevAsana);
        console.log("Next of next asana becomes : ", nextAsana);
        console.log(modalData.asana_ids);
        // if (prevOfPrevAsana) {
        //   modalData.asana_ids.splice(
        //     prevOfPrevAsana["index"] + 1,
        //     prevAsana["index"] - prevOfPrevAsana["index"] - 1
        //   );
        //   modalData.asana_ids.splice(
        //     prevAsana["index"] + 1,
        //     index - prevAsana["index"] - 1
        //   );
        //   modalData.asana_ids.splice(index + 1, nextAsana["index"] - index - 1);
        //   console.log(modalData.asana_ids);
        // } else {
        // }
        //remove prevprev-prev, prev-current, current-next
        //now, alter modalData.asana_ids to change the order of asanas, and remove all transitions between them.
      }
      if (direction === "down") {
        console.log(modalData.asana_ids[index], " moved down.");
        console.log("Next asana now becomes : ", nextOfNextAsana);
        console.log("Previous asana now becomes : ", nextAsana);
        console.log("Previous of previous asana becomes : ", prevAsana);
        console.log(modalData.asana_ids);
        //remove prev-current, current-next, next-nextnext
        //now, alter modalData.asana_ids to change the order of asanas, and remove all transitions between them.
      }
    }
    // setModalData((prevModalData) => {
    //   const reorderedAsanas = [...prevModalData.asana_ids];
    //   if (
    //     (direction === "up" && index > 0) ||
    //     (direction === "down" && index < reorderedAsanas.length - 1)
    //   ) {
    //     [
    //       reorderedAsanas[index],
    //       reorderedAsanas[index + (direction === "up" ? -1 : 1)],
    //     ] = [
    //       reorderedAsanas[index + (direction === "up" ? -1 : 1)],
    //       reorderedAsanas[index],
    //     ];
    //   } else {
    //     return prevModalData;
    //   }
    //   const updatedTransitions = [];
    //   for (let i = 0; i < reorderedAsanas.length - 1; i++) {
    //     const asana1 = playlistAsanas.find(
    //       (asana) => asana.id === reorderedAsanas[i]
    //     );
    //     const asana2 = playlistAsanas.find(
    //       (asana) => asana.id === reorderedAsanas[i + 1]
    //     );
    //     console.log(" SENDING : ", asana1, asana2);
    //     const transitionsBetweenAsanas = transitionGenerator(asana1, asana2);
    //     updatedTransitions.push(...transitionsBetweenAsanas);
    //   }
    //   return {
    //     ...prevModalData,
    //     asana_ids: reorderedAsanas,
    //     transitions: updatedTransitions,
    //   };
    // });
  };

  const handleRemoveAsana = (indexToRemove) => {
    setModalData((prevData) => {
      const newAsanaIds = prevData.asana_ids.filter(
        (_, index) => index !== indexToRemove
      );

      return {
        ...prevData,
        asana_ids: newAsanaIds,
      };
    });
  };

  return (
    <div className="allAsanas min-h-screen">
      <AdminNavbar />
      <div className="elements">
        <Button
          onClick={() => {
            handleDownload(playlist1);
          }}
        >
          Download CSV
        </Button>
        <br />
        <Input
          icon={<Search />}
          scale={5 / 3}
          clearable
          type="warning"
          placeholder="Search"
          className="bg-white "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {loading ? (
          <Text>Loading</Text>
        ) : (
          <Table width={100} data={filteredTransitions} className="bg-white ">
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
        <Modal
          visible={modalState}
          onClose={() => setModalState(false)}
          width="50rem"
        >
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
              <br />
              <br />

              {modalData.asana_ids.map((asanaId, index) => {
                const asana =
                  playlistAsanas.find((asana) => asana.id === asanaId) ||
                  transitions.find(
                    (transition) => transition.transition_id === asanaId
                  );
                const isAsana = asana.asana_name ? true : false;
                const asanaName =
                  asana.asana_name || asana.transition_video_name;
                return (
                  <div>
                    {isAsana && (
                      <div>
                        <Text type="error">Asana {index + 1}</Text>
                        <Grid.Container gap={1} justify="left" height="40px">
                          <Grid>
                            {" "}
                            <Select
                              key={index}
                              width="100%"
                              placeholder={`Select Asana ${index + 1}`}
                              value={asanaName}
                              onChange={(value) =>
                                handleAsanaNameChange(value, index)
                              }
                            >
                              {playlistAsanas.map((asanaOption) => (
                                <Select.Option
                                  key={asanaOption.id}
                                  value={asanaOption.asana_name}
                                >
                                  {asanaOption.asana_name +
                                    " " +
                                    asanaOption.language}
                                </Select.Option>
                              ))}
                            </Select>
                          </Grid>
                          <Grid>
                            {" "}
                            {index > 0 && (
                              <Tooltip text={"Move Up"} type="dark">
                                {" "}
                                <Button
                                  icon={<ArrowUpCircle />}
                                  auto
                                  scale={2 / 3}
                                  onClick={() =>
                                    handleAsanaReorder(index, "up")
                                  }
                                />
                              </Tooltip>
                            )}
                          </Grid>
                          <Grid>
                            {" "}
                            {index < modalData.asana_ids.length - 1 && (
                              <Tooltip text={"Move Down"} type="dark">
                                {" "}
                                <Button
                                  icon={<ArrowDownCircle />}
                                  auto
                                  scale={2 / 3}
                                  onClick={() =>
                                    handleAsanaReorder(index, "down")
                                  }
                                />
                              </Tooltip>
                            )}
                          </Grid>
                          <Grid>
                            <Tooltip text={"Delete Asana"} type="dark">
                              {" "}
                              <Button
                                type="error"
                                icon={<XCircle />}
                                auto
                                scale={2 / 3}
                                onClick={() => handleRemoveAsana(index)}
                              />
                            </Tooltip>
                          </Grid>
                        </Grid.Container>
                        <br />
                      </div>
                    )}
                    {!isAsana && (
                      <div>
                        <Text type="success">Transition Video</Text>
                        <h5>{asanaName}</h5>
                        <br />
                      </div>
                    )}
                  </div>
                );
              })}
              <br />
              <Tooltip text={"Add New Asana"} type="dark">
                {" "}
                <Button
                  iconRight={<PlusCircle />}
                  auto
                  scale={2 / 3}
                  onClick={handleAddNewAsana}
                />
              </Tooltip>
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
