import {
  Button,
  Card,
  Divider,
  Grid,
  Input,
  Modal,
  Table,
  Select,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminNavbar from "../../Common/AdminNavbar/AdminNavbar";

export default function RegisterPlaylistForm() {
  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const sortOrder = "asc";
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
      } catch (error) {
        toast(error);
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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/video/getAllTransitions"
        );
        const data = await response.json();
        console.log(data);
        setTransitions(data);
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);

  const returnTransitionVideo = (
    startVideo,
    startVideoCategory,
    endVideo,
    endVideoCategory
  ) => {
    const matchingTransition = transitions.find((transition) => {
      return (
        transition.asana_category_start === startVideoCategory &&
        transition.asana_category_end === endVideoCategory &&
        transition.language === endVideo.language &&
        transition.mat_starting_position === null &&
        transition.mat_ending_position === null &&
        transition.person_starting_position === null &&
        transition.person_ending_position === null
      );
    });
    return matchingTransition;
  };
  const addToPlaylist = (rowData) => {
    var count = document.getElementById(`asana_count_${rowData.id}`).value;
    if (count === "") {
      count = 1;
    }
    if (playlist_temp.length === 0) {
      let filteredItems = transitions.filter(
        (item) =>
          item.asana_category_start === rowData.asana_category &&
          item.asana_category_end === rowData.asana_category &&
          item.language === rowData.language &&
          item.mat_starting_position === null &&
          item.mat_ending_position === null &&
          item.person_starting_position === null &&
          item.person_ending_position === null
      );
      if (filteredItems.length !== 1) {
        toast(
          "Transition video doesnt exist in this language or category of asana"
        );
      } else {
        setPlaylistTemp((prevPlaylist) => [
          ...prevPlaylist,
          {
            rowData: filteredItems[0],
            count: 1,
          },
        ]);
      }
    }
    if (playlist_temp.length !== 0) {
      let startVideo = playlist_temp[playlist_temp.length - 1].rowData;
      let endVideo = rowData;
      console.log(startVideo, endVideo);
      if (startVideo.asana_category === endVideo.asana_category) {
        if (
          startVideo.person_ending_position === "Left" &&
          endVideo.person_starting_position === "Front"
        ) {
          const matchingTransition = transitions.find((transition) => {
            return (
              transition.asana_category === startVideo.asana_category_end &&
              transition.person_starting_position ===
                startVideo.person_ending_position &&
              transition.person_ending_position ===
                endVideo.person_starting_position
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        } else if (
          startVideo.person_ending_position === "Front" &&
          endVideo.person_starting_position === "Left"
        ) {
          const matchingTransition = transitions.find((transition) => {
            return (
              transition.asana_category === startVideo.asana_category_end &&
              transition.person_starting_position ===
                startVideo.person_ending_position &&
              transition.person_ending_position ===
                endVideo.person_starting_position
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
      } else {
        if (
          startVideo.asana_category === "Standing" &&
          endVideo.asana_category === "Sitting"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Standing",
            endVideo,
            "Sitting"
          );
          if (startVideo.person_ending_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.person_starting_position ===
                  startVideo.person_ending_position &&
                transition.person_ending_position ===
                  endVideo.person_starting_position
              );
            });
            setPlaylistTemp((prevPlaylist) => [
              ...prevPlaylist,
              {
                rowData: matchingTransition1,
                count: 1,
              },
            ]);
          }
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Standing" &&
          endVideo.asana_category === "Supine"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Standing",
            endVideo,
            "Supine"
          );
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Front" &&
              transition.mat_ending_position === "Side" &&
              transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Standing" &&
          endVideo.asana_category === "Prone"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Standing",
            endVideo,
            "Prone"
          );
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Front" &&
              transition.mat_ending_position === "Side"
              // transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Sitting" &&
          endVideo.asana_category === "Standing"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Sitting",
            endVideo,
            "Standing"
          );
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Left"
              );
            });
            setPlaylistTemp((prevPlaylist) => [
              ...prevPlaylist,
              {
                rowData: matchingTransition1,
                count: 1,
              },
            ]);
          }
        }
        if (
          startVideo.asana_category === "Sitting" &&
          endVideo.asana_category === "Supine"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Sitting",
            endVideo,
            "Supine"
          );
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Front" &&
              transition.mat_ending_position === "Side" &&
              transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Sitting" &&
          endVideo.asana_category === "Prone"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Sitting",
            endVideo,
            "Prone"
          );
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Front" &&
              transition.mat_ending_position === "Side" &&
              transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Supine" &&
          endVideo.asana_category === "Standing"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Supine",
            endVideo,
            "Standing"
          );
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Side" &&
              transition.mat_ending_position === "Front" &&
              transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          const matchingTransition3 = transitions.find((transition) => {
            return (
              transition.asana_category_end === "Standing" &&
              transition.asana_category_start === "Standing" &&
              transition.language === endVideo.language &&
              transition.mat_starting_position === null &&
              transition.mat_ending_position === null &&
              transition.person_starting_position === null &&
              transition.person_ending_position === null
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition3,
              count: 1,
            },
          ]);
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Left"
              );
            });
            setPlaylistTemp((prevPlaylist) => [
              ...prevPlaylist,
              {
                rowData: matchingTransition1,
                count: 1,
              },
            ]);
          }
        }
        if (
          startVideo.asana_category === "Supine" &&
          endVideo.asana_category === "Sitting"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Supine",
            endVideo,
            "Sitting"
          );
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Side" &&
              transition.mat_ending_position === "Front" &&
              transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          const matchingTransition3 = transitions.find((transition) => {
            return (
              transition.asana_category_end === "Sitting" &&
              transition.asana_category_start === "Sitting" &&
              transition.language === endVideo.language &&
              transition.mat_starting_position === null &&
              transition.mat_ending_position === null &&
              transition.person_starting_position === null &&
              transition.person_ending_position === null
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition3,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Supine" &&
          endVideo.asana_category === "Prone"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Supine",
            endVideo,
            "Prone"
          );
          console.log(matchingTransition);
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Prone" &&
          endVideo.asana_category === "Standing"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Prone",
            endVideo,
            "Standing"
          );
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Side" &&
              transition.mat_ending_position === "Front" &&
              transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          const matchingTransition3 = transitions.find((transition) => {
            return (
              transition.asana_category_end === "Standing" &&
              transition.asana_category_start === "Standing" &&
              transition.language === endVideo.language &&
              transition.mat_starting_position === null &&
              transition.mat_ending_position === null &&
              transition.person_starting_position === null &&
              transition.person_ending_position === null
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition3,
              count: 1,
            },
          ]);
          if (endVideo.person_starting_position === "Left") {
            const matchingTransition1 = transitions.find((transition) => {
              return (
                transition.person_starting_position === "Front" &&
                transition.person_ending_position === "Left"
              );
            });
            setPlaylistTemp((prevPlaylist) => [
              ...prevPlaylist,
              {
                rowData: matchingTransition1,
                count: 1,
              },
            ]);
          }
        }
        if (
          startVideo.asana_category === "Prone" &&
          endVideo.asana_category === "Sitting"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Prone",
            endVideo,
            "Sitting"
          );
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
          const matchingTransition2 = transitions.find((transition) => {
            return (
              transition.mat_starting_position === "Side" &&
              transition.mat_ending_position === "Front" &&
              transition.language === endVideo.language
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition2,
              count: 1,
            },
          ]);
          const matchingTransition3 = transitions.find((transition) => {
            return (
              transition.asana_category_end === "Sitting" &&
              transition.asana_category_start === "Sitting" &&
              transition.language === endVideo.language &&
              transition.mat_starting_position === null &&
              transition.mat_ending_position === null &&
              transition.person_starting_position === null &&
              transition.person_ending_position === null
            );
          });
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition3,
              count: 1,
            },
          ]);
        }
        if (
          startVideo.asana_category === "Prone" &&
          endVideo.asana_category === "Supine"
        ) {
          const matchingTransition = returnTransitionVideo(
            startVideo,
            "Prone",
            endVideo,
            "Supine"
          );
          setPlaylistTemp((prevPlaylist) => [
            ...prevPlaylist,
            {
              rowData: matchingTransition,
              count: 1,
            },
          ]);
        }
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
    try {
      const response = await fetch(
        "http://localhost:4000/content/playlists/addPlaylist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(playlist_sequence),
        }
      );
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

  const [filterCategory, setFilterCategory] = useState("");
  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };
  const uniqueCategories = [
    "All",
    ...new Set(sortedAsanas.map((asana) => asana.asana_category)),
  ];

  const filteredAsanas = sortedAsanas.filter(
    (asana) =>
      filterCategory === "All" ||
      asana.asana_category.toLowerCase().includes(filterCategory.toLowerCase())
  );

  return (
    <div className="video_form min-h-screen">
      <AdminNavbar />
      <div className="flex items-center justify-center my-20 gap-8">
        <Table width={60} data={filteredAsanas} className="bg-white">
          <Table.Column prop="asana_name" label="Asana Name" />
          <Table.Column
            prop="language"
            label="Language"
            render={(data) => (data.language !== "" ? data.language : "none")}
          />
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
          {/* <Table.Filter
              type="text"
              value={filterCategory}
              onChange={handleFilterChange}
            /> */}
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
                  return (
                    <p>
                      {rowData.rowData.asana_name ||
                        rowData.rowData.transition_video_name}
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
                  return (
                    <p>
                      {rowData.rowData.language
                        ? "None"
                        : rowData.rowData.language}
                    </p>
                  );
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
