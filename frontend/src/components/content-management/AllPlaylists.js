import {
  Button,
  Grid,
  Input,
  Modal,
  Select,
  Table,
  Text,
  Tooltip,
} from "@geist-ui/core";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  Search,
  Delete,
  Edit,
  XCircle,
} from "@geist-ui/icons";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../enums/roles";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";
import AdminPageWrapper from "../Common/AdminPageWrapper";
import { transitionGenerator } from "../transition-generator/TransitionGenerator";

function AllPlaylists() {
  const [delState, setDelState] = useState(false);
  const [delPlaylistId, setDelPlaylistId] = useState(0);
  const closeDelHandler = (event) => {
    setDelState(false);
  };
  const [playlist1, setPlaylist1] = useState([]);
  const [playlistAsanas, setPlaylistAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    playlist_id: 0,
    playlist_name: "",
    asana_ids: [],
  });
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
  }, [searchTerm, playlist1]);
  const handleAddNewAsana = () => {
    setModalData((prevData) => ({
      ...prevData,
      asana_ids: [...prevData.asana_ids, ""],
    }));
  };

  useEffect(() => {
    const fetchData = async (playlistId) => {
      try {
        const response = await Fetch({
          url: `/content/playlists/deletePlaylist/${playlistId}`,
          method: "DELETE",
        });
        if (response?.status === 200) {
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
        console.log(error);
      }
    };
    for (var i = 0; i !== playlist1.length; i++) {
      if (playlist1[i].asana_ids.length === 0) {
        fetchData(playlist1[i].playlist_id);
      }
    }
  }, [playlist1]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/playlists/getAllPlaylists",
        });
        const data = response.data;
        setPlaylist1(data);
        setFilteredTransitions(data);
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
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        const data = response?.data;
        setPlaylistAsanas(data);
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
        const data = response?.data;
        setTransitions(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async (playlistId) => {
      try {
        const response = await Fetch({
          url: `/content/playlists/deletePlaylist/${playlistId}`,
          method: "DELETE",
        });
        if (response?.status === 200) {
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
        console.log(error);
      }
    };
    for (var i = 0; i !== playlist1.length; i++) {
      if (playlist1[i].asana_ids.length === 0) {
        fetchData(playlist1[i].playlist_id);
      }
    }
  }, [playlist1]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/playlists/getAllPlaylists",
        });
        const data = response.data;
        setPlaylist1(data);
        setFilteredTransitions(data);
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
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        const data = response.data;
        setPlaylistAsanas(data);
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
        const data = response.data;
        setTransitions(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const updateData = async () => {
    try {
      const playlistId = Number(modalData.playlist_id);
      const response = await Fetch({
        url: `/content/playlists/updatePlaylist/${playlistId}`,
        method: "PUT",
        data: modalData,
      });
      if (response.status === 200) {
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
    const filteredAsanaIds = updatedAsanaIds.filter((asanaId) => {
      return typeof asanaId !== "string" || !asanaId.startsWith("T_");
    });
    let resultArray = [];
    const asanaData1 = playlistAsanas.find(
      (asana) => asana.id === filteredAsanaIds[0]
    );
    const transitionResult = transitionGenerator(
      "start",
      asanaData1,
      transitions
    );
    transitionResult?.forEach((element) => {
      resultArray.push(element.transition_id);
    });
    resultArray.push(asanaData1.id);
    for (let i = 0; i < filteredAsanaIds.length - 1; i++) {
      const asanaData2 = playlistAsanas.find(
        (asana) => asana.id === filteredAsanaIds[i]
      );
      const asanaData3 = playlistAsanas.find(
        (asana) => asana.id === filteredAsanaIds[i + 1]
      );
      if (asanaData2 && asanaData3) {
        const result = transitionGenerator(asanaData2, asanaData3, transitions);
        result?.forEach((element) => {
          resultArray.push(element.transition_id);
        });
        resultArray.push(asanaData3.id);
      } else {
        console.error("Asana data not found for IDs:");
      }
    }
    setModalData((prevModalData) => ({
      ...prevModalData,
      asana_ids: resultArray,
    }));
  };
  const deletePlaylist = async () => {
    try {
      const playlistId = delPlaylistId;
      const response = await Fetch({
        url: `/content/playlists/deletePlaylist/${playlistId}`,
        method: "DELETE",
      });
      if (response.status === 200) {
        setPlaylist1((prev) =>
          prev.filter((playlist) => playlist.playlist_id !== playlistId)
        );
      } else {
        toast("Error deleting playlist:", response.status);
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
      setModalData(rowData);
      setModalState(true);
    };

    return (
      <div className="flex flex-row gap-4">
        <Tooltip text={"Remove"}>
          <div
            onClick={() => {
              handleDelete();
            }}
          >
            <Delete className="w-6 h-6" />
          </div>
        </Tooltip>
        <Tooltip text={"Update"}>
          <div
            onClick={() => {
              handleUpdate(Number(rowData.playlist_id));
            }}
          >
            <Edit className="w-6 h-6" />
          </div>
        </Tooltip>
      </div>
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
          asanas_before.push({
            index: i,
            asana_id: modalData.asana_ids[i],
          });
        }
        if (i > index) {
          asanas_after.push({
            index: i,
            asana_id: modalData.asana_ids[i],
          });
        }
      }
    }
    let nowOrderAsanaIds = [];
    if (direction === "up" && asanas_before.length > 0) {
      const temp = asanas_before[asanas_before.length - 1];
      asanas_before[asanas_before.length - 1] = {
        index: index,
        asana_id: modalData.asana_ids[index],
      };
      asanas_before.push(temp);
      nowOrderAsanaIds = [...asanas_before, ...asanas_after].map(
        (asana) => asana.asana_id
      );
    }

    if (direction === "down" && asanas_after.length > 0) {
      const updated_list = [
        ...asanas_after.slice(0, 1),
        {
          index: index,
          asana_id: modalData.asana_ids[index],
        },
        ...asanas_after.slice(1),
      ];
      asanas_after = updated_list;
      nowOrderAsanaIds = [...asanas_before, ...asanas_after].map(
        (asana) => asana.asana_id
      );
    }

    let resultArray = [];
    const asanaData1 = playlistAsanas.find(
      (asana) => asana.id === nowOrderAsanaIds[0]
    );
    const transitionResult = transitionGenerator(
      "start",
      asanaData1,
      transitions
    );
    transitionResult?.forEach((element) => {
      resultArray.push(element.transition_id);
    });
    resultArray.push(asanaData1.id);
    for (let i = 0; i < nowOrderAsanaIds.length - 1; i++) {
      const asanaData2 = playlistAsanas.find(
        (asana) => asana.id === nowOrderAsanaIds[i]
      );
      const asanaData3 = playlistAsanas.find(
        (asana) => asana.id === nowOrderAsanaIds[i + 1]
      );
      if (asanaData2 && asanaData3) {
        const result = transitionGenerator(asanaData2, asanaData3, transitions);
        result?.forEach((element) => {
          resultArray.push(element.transition_id);
        });
        resultArray.push(asanaData3.id);
      } else {
        console.error("Asana data not found for IDs:");
      }
    }
    setModalData((prevModalData) => ({
      ...prevModalData,
      asana_ids: resultArray,
    }));
  };

  const handleRemoveAsana = (indexToRemove) => {
    const newAsanaIds = modalData.asana_ids.filter(
      (_, index) => index !== indexToRemove
    );
    const filteredList = newAsanaIds.filter(
      (item) => !(typeof item === "string" && item.startsWith("T_"))
    );
    let resultArray = [];
    const asanaData1 = playlistAsanas.find(
      (asana) => asana.id === filteredList[0]
    );
    const transitionResult = transitionGenerator(
      "start",
      asanaData1,
      transitions
    );
    transitionResult?.forEach((element) => {
      resultArray.push(element.transition_id);
    });
    resultArray.push(asanaData1.id);
    for (let i = 0; i < filteredList.length - 1; i++) {
      const asanaData2 = playlistAsanas.find(
        (asana) => asana.id === filteredList[i]
      );
      const asanaData3 = playlistAsanas.find(
        (asana) => asana.id === filteredList[i + 1]
      );
      if (asanaData2 && asanaData3) {
        const result = transitionGenerator(asanaData2, asanaData3, transitions);
        result?.forEach((element) => {
          resultArray.push(element.transition_id);
        });
        resultArray.push(asanaData3.id);
      } else {
        console.error("Asana data not found for IDs:");
      }
    }
    setModalData((prevModalData) => ({
      ...prevModalData,
      asana_ids: resultArray,
    }));
  };

  useEffect(() => {
    console.log(modalData, "IS MODAL DATA");
  }, [modalData]);

  return (
    <AdminPageWrapper heading="Content Management - View All Playlists">
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
          <Table data={filteredTransitions} className="bg-white ">
            <Table.Column prop="playlist_id" label="Playlist ID" />
            <Table.Column prop="playlist_name" label="Playlist Name" />
            <Table.Column
              prop="asana_ids"
              label="Asana Names"
              render={(value, rowData) => (
                <div className="flex flex-row flex-wrap gap-2 p-2">
                  {value.map((asanaId, index) => {
                    const asana = playlistAsanas.find(
                      (asana) => asana.id === asanaId
                    );
                    return (
                      <div>
                        {asana && (
                          <div className="flex flex-col items-start gap-1 p-1">
                            <div className="w-fit p-1 rounded-lg bg-gray-200 hover:scale-110 transition-transform">
                              <div className="flex items-center justify-center h-12">
                                <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                  {asana.asana_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              // render={(value, rowData) => (
              //   <div className="flex flex-row flex-wrap gap-2 p-2">
              //     {value.map((asanaId, index) => {
              //       const asana = playlistAsanas.find(
              //         (asana) => asana.id === asanaId
              //       );

              //       if (!asana) return null; // Handle potential errors

              //       // Consecutive name logic
              //       let displayCount = 1;
              //       const nextAsanaId = value[index + 1];
              //       const nextAsana = playlistAsanas.find(
              //         (asana) => asana.id === nextAsanaId
              //       );
              //       while (
              //         nextAsana &&
              //         nextAsana.asana_name === asana.asana_name
              //       ) {
              //         displayCount++;
              //         index++;
              //         const nextAsanaId = value[index + 1];
              //         const nextAsana = playlistAsanas.find(
              //           (asana) => asana.id === nextAsanaId
              //         );
              //       }

              //       return (
              //         <div key={asanaId}>
              //           {asana && (
              //             <div className="flex flex-col items-start gap-1 p-1">
              //               <div className="w-fit p-1 rounded-lg bg-gray-200 hover:scale-110 transition-transform">
              //                 <div className="flex items-center justify-center h-12">
              //                   <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              //                     {asana.asana_name}{" "}
              //                     {displayCount > 1 && `(x${displayCount})`}
              //                   </span>
              //                 </div>
              //               </div>
              //             </div>
              //           )}
              //         </div>
              //       );
              //     })}
              //   </div>
              // )}
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
        {/* <Modal
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
                let isAsana = true;
                let asanaName = "";
                if (asanaId !== "") {
                  const asana =
                    playlistAsanas.find((asana) => asana.id === asanaId) ||
                    transitions.find(
                      (transition) => transition.transition_id === asanaId
                    );
                  isAsana = asana && asana.asana_name ? true : false;
                  asanaName =
                    asana && asana.asana_name
                      ? asana.asana_name
                      : asana && asana.transition_video_name
                        ? asana.transition_video_name
                        : "Undefined";
                }
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
        </Modal> */}

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
                let isAsana = true;
                let asanaName = "";
                if (asanaId !== "") {
                  const asana = playlistAsanas.find(
                    (asana) => asana.id === asanaId
                  );
                  if (asana) {
                    isAsana = true;
                    asanaName = asana.asana_name;
                  } else {
                    isAsana = false;
                  }
                }
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
                    {/* {!isAsana && (
                      <div>
                        <Text type="success">Transition Video</Text>
                        <h5>{asanaName}</h5>
                        <br />
                      </div>
                    )} */}
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
    </AdminPageWrapper>
  );
}

export default withAuth(AllPlaylists, ROLE_ROOT);
