import {
  Button,
  Grid,
  Input,
  Modal,
  Select,
  Table,
  Text,
  Tooltip,
  Tag,
} from "@geist-ui/core";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PlusCircle,
  XCircle,
} from "@geist-ui/icons";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import { transitionGenerator } from "../../components/transition-generator/TransitionGenerator";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";

export default function ViewAllPlaylists() {
  // const navigate = useNavigate();
  const [transitions, setTransitions] = useState([]);
  const [delState, setDelState] = useState(false);
  const [delPlaylistId, setDelPlaylistId] = useState("");
  const [modalState, setModalState] = useState(false);
  const [unmodifiedData, setUnmodifiedData] = useState({
    playlist_id: "",
    playlist_name: "",
    asana_ids: [],
  });
  const [modalData, setModalData] = useState({
    playlist_id: "",
    playlist_name: "",
    asana_ids: [],
  });
  let user = useUserStore((state) => state.user);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistEditLimit, setPlaylistEditLimit] = useState(0);
  const [monthlyPlaylistLimit, setMonthlyPlaylistLimit] = useState(0);
  const [playlistAsanas, setPlaylistAsanas] = useState([]);
  const [newAsana, setNewAsana] = useState({ id: "", asana_name: "" });

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await Fetch({
          url: "/playlist-configs/getAllConfigs",
        });
        const playlistEditCount = data.find(
          (config) => config.playlist_config_name === "PLAYLIST_EDIT_LIMIT"
        );
        setPlaylistEditLimit(playlistEditCount.playlist_config_value);
        const monthlyLimit = data.find(
          (config) => config.playlist_config_name === "MONTHLY_PLAYLIST_LIMIT"
        );
        setPlaylistEditLimit(playlistEditCount.playlist_config_value);
        setMonthlyPlaylistLimit(monthlyLimit.playlist_config_value);
      } catch (err) {
        console.log(err);
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

  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        setDelPlaylistId(rowData.playlist_id);
        setDelState(true);
      } catch (error) {
        console.error(error);
      }
    };
    const handleUpdate = async () => {
      setModalData(rowData);
      setUnmodifiedData(rowData);
      setModalState(true);
    };
    const disabledUpdate =
      rowData.current_edit_count === playlistEditLimit ? true : false;
    const tooltipText = `You have ${playlistEditLimit - rowData.current_edit_count} edits remaining`;

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
          <Tooltip text={tooltipText} type="dark">
            <Button
              type="warning"
              auto
              scale={1 / 3}
              font="12px"
              onClick={() => handleUpdate(rowData.playlist_id)}
              disabled={disabledUpdate}
            >
              Update
            </Button>
          </Tooltip>
        </Grid>
      </Grid.Container>
    );
  };

  const deletePlaylist = async () => {
    try {
      const playlistId = delPlaylistId;
      const response = await Fetch({
        url: `/user-playlists/deleteUserPlaylist/${playlistId}`,
        method: "DELETE",
      });
      if (response?.status === 200) {
        toast("Deleted Successfully!");
        setUserPlaylists((prev) =>
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

  const updateData = async () => {
    try {
      console.log(modalData, unmodifiedData);
      if (modalData === unmodifiedData) {
        toast("There are no changes to be updated.");
      } else {
        if (modalData.current_edit_count === playlistEditLimit) {
          toast("Maximum edit count has been attained.");
        } else {
          const playlistId = modalData.playlist_id;
          modalData.current_edit_count = modalData.current_edit_count + 1;
          const response = await Fetch({
            url: `/user-playlists/updateUserPlaylist/${playlistId}`,
            method: "PUT",
            data: modalData,
          });
          if (response?.status === 200) {
            toast("Updated Successfully!");
            setUserPlaylists((prev) =>
              prev.map((p1) => (p1.playlist_id === playlistId ? modalData : p1))
            );
            setModalState(false);
          } else {
            toast("Error updating playlist:", response.status);
          }
        }
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
    setModalData((prevData) => ({
      ...prevData,
      asana_ids: updatedAsanaIds,
    }));
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

  const handleAddNewAsana = () => {
    setModalData((prevData) => ({
      ...prevData,
      asana_ids: [...prevData.asana_ids, newAsana.id],
    }));
  };

  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      <div>
        <Button
          onClick={() => {
            handleDownload(userPlaylists);
          }}
        >
          Download CSV
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <Table width={100} data={userPlaylists} className="bg-white ">
          <Table.Column prop="playlist_id" label="Playlist ID" />
          <Table.Column prop="playlist_name" label="Playlist Name" />
          <Table.Column
            prop="asana_ids"
            label="Asana Names"
            render={(value, rowData) => (
              <div>
                {value.map((asanaId, index) => {
                  const asana =
                    playlistAsanas.find((asana) => asana.id === asanaId) ||
                    transitions.find(
                      (transition) => transition.transition_id === asanaId
                    );
                  return (
                    <Tag key={index}>
                      {asana?.asana_name || asana?.transition_video_name}
                    </Tag>
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
                let isAsana = true;
                let asanaName = "";
                if (asanaId !== "") {
                  const asana =
                    playlistAsanas.find((asana) => asana.id === asanaId) ||
                    transitions.find(
                      (transition) => transition.transition_id === asanaId
                    );
                  isAsana = asana.asana_name ? true : false;
                  asanaName = asana.asana_name || asana.transition_video_name;
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
        </Modal>
      </div>
      <div>
        <Modal visible={delState} onClose={() => setDelState(false)}>
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
