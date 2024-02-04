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
import { toast } from "react-toastify";
import getFormData from "../../../utils/getFormData";
import CustomInput from "../../../components/Common/CustomInput";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { transitionGenerator } from "../../../components/transition-generator/TransitionGenerator";
export default function RegisterNewSchedule() {
  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [scheduleFor, setScheduleFor] = useState("");
  const [transitions, setTransitions] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [filterCategory, setFilterCategory] = useState("");
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    rowData: {
      asana_name: "",
    },
    count: "",
  });
  const [filteredAsanasByCategory, setFilteredAsanasByCategory] = useState([]);
  const [playlistAsana, setPlaylistAsana] = useState({
    transitions: [],
    asana: {},
  });
  const predefinedOrder = [
    "Warm Up",
    "Suryanamaskara",
    "Standing",
    "Sitting",
    "Supine",
    "Prone",
    "Pranayama",
  ];
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
    const uniqueCategories = [
      ...new Set(sortedAsanas.map((asana) => asana.asana_category)),
    ];
    const filteredAsanas = sortedAsanas.filter((asana) =>
      asana.asana_category.toLowerCase().includes(filterCategory.toLowerCase())
    );
    const filteredAsanasByCategory1 = uniqueCategories.map((category) => {
      return {
        category: category,
        asanas: filteredAsanas.filter(
          (asana) => asana.asana_category === category
        ),
      };
    });
    setFilteredAsanasByCategory(filteredAsanasByCategory1);
  }, [sortedAsanas]);
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
  const addToSchedule = (rowData) => {
    var count = document.getElementById(`asana_count_${rowData.id}`).value;
    if (count === "") {
      count = 1;
    } else {
      count = Number(count);
    }
    if (schedule.length === 0) {
      const x = transitionGenerator(rowData, rowData, transitions);
      setSchedule((prev) => [
        ...prev,
        ...x.map((item) => ({ rowData: item, count: 1 })),
      ]);
    } else {
      let startVideo = schedule[schedule.length - 1].rowData;
      let endVideo = rowData;
      const x = transitionGenerator(startVideo, endVideo, transitions);
      setSchedule((prev) => [
        ...prev,
        ...x.map((item) => ({ rowData: item, count: 1 })),
      ]);
    }
    setSchedule((prev) => [
      ...prev,
      {
        rowData: rowData,
        count: count,
      },
    ]);
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
          onClick={() => addToSchedule(rowData)}
        >
          Add
        </Button>
      </div>
    );
  };

  const handler = (val) => {
    setScheduleFor(val);
  };

  useEffect(() => {
    console.log(scheduleFor);
  }, [scheduleFor]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    console.log(formData);
  };

  const renderAction = (value, rowData, index) => {
    const handleDelete = () => {
      setSchedule((prevPlaylist) =>
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

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setModalData({ ...modalData, [id]: value });
  };
  const updateData = () => {
    const x = document.getElementById("asana_count_playlist").value;
    for (var entry in schedule) {
      if (schedule[entry].rowData.asana_name === modalData.rowData.asana_name) {
        schedule[entry].count = x;
      }
    }
    setModalState(false);
  };
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
        {schedule.length > 0 && (
          <Card height="50%">
            <Table width={40} data={schedule} className="bg-dark ">
              <Table.Column
                prop="rowData.asana_name || rowData.transition_video_name"
                label="Asana Name"
                render={(_, rowData) => {
                  return (
                    <p>
                      {rowData.rowData?.asana_name ||
                        rowData.rowData?.transition_video_name}
                    </p>
                  );
                }}
              />

              <Table.Column
                prop="rowData.asana_category"
                label="Category"
                render={(_, rowData) => {
                  return (
                    <p>{rowData.rowData?.asana_category || "Transition"}</p>
                  );
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
              <Input width="100%" name="playlist_name">
                Schedule Name
              </Input>
              <CustomInput name="validity_from" type="datetime-local">
                Validity From
              </CustomInput>
              <CustomInput name="validity_to" type="datetime-local">
                Validity To
              </CustomInput>
              <Select
                onChange={handler}
                name="schedule_for"
                placeholder="Select User Type"
              >
                <Select.Option value="Student">Student</Select.Option>
                <Select.Option value="Teacher">Teacher</Select.Option>
                <Select.Option value="Institute">Institute</Select.Option>
              </Select>
              <br />

              <Button htmlType="submit">Submit</Button>
            </form>
          </Card>
        )}
      </div>
      <div>
        <Modal visible={modalState} onClose={() => setModalState(false)}>
          <Modal.Title>Update</Modal.Title>
          <Modal.Subtitle>
            {modalData.rowData.asana_name ||
              modalData.rowData.transition_video_name}
          </Modal.Subtitle>
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
