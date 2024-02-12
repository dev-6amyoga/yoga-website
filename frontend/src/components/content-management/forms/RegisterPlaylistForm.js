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
import { transitionGenerator } from "../../transition-generator/TransitionGenerator";
import {toast } from "react-toastify";
import AdminNavbar from "../../Common/AdminNavbar/AdminNavbar";
export default function RegisterPlaylistForm() {
  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [transitions, setTransitions] = useState([]);
  const predefinedOrder = [
    "Warm Up",
    "Suryanamaskara",
    "Standing",
    "Sitting",
    "Supine",
    "Prone",
    "Pranayama",
  ];
  const [sortedAsanas, setSortedAsanas] = useState([]);
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

  const addToPlaylist = (rowData) => {
    var count = document.getElementById(`asana_count_${rowData.id}`).value;
    if (count === "") {
      count = 1;
    } else {
      count = Number(count);
    }
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
    <div className="video_form min-h-screen">
      <AdminNavbar />
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
                  <Table.Column
                    prop="nobreak_asana"
                    label="No Break?"
                    render={(data) => {
                      if (data) {
                        return "Yes";
                      } else {
                        return "No";
                      }
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
                  console.log(rowData);
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
