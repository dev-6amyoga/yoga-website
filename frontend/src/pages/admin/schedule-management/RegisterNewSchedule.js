import {
  Button,
  Card,
  Collapse,
  Divider,
  Grid,
  Input,
  Modal,
  Select,
  Table,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { transitionGenerator } from "../../../components/transition-generator/TransitionGenerator";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import { withAuth } from "../../../utils/withAuth";

function RegisterNewSchedule() {
  const navigate = useNavigate();
  const [asanas, setAsanas] = useState([]);
  const [sortedAsanas, setSortedAsanas] = useState([]);
  const [scheduleFor, setScheduleFor] = useState(null);

  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allInstitutes, setAllInstitutes] = useState([]);
  const [applicableUsers, setApplicableUsers] = useState([]);

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
        const response = await Fetch({
          url: "/user/get-all-students",
          method: "GET",
        });
        const data = response.data;
        const flattenedStudents = data.users.map((student) => ({
          user_id: student.user_id,
          username: student.username,
          name: student.name,
          email: student.email,
          phone: student.phone,
        }));
        setAllStudents(flattenedStudents);
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
          url: "/user/get-all-teachers",
          method: "GET",
        });
        const data = response.data;
        const flattenedStudents = data.users.map((teacher) => ({
          user_id: teacher.user_id,
          username: teacher.user?.username,
          name: teacher.user?.name,
          email: teacher.user?.email,
          institute: teacher.institute?.name,
        }));
        setAllTeachers(flattenedStudents);
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
          url: "/user/get-all-institutes",
          method: "GET",
        });
        const data = response.data;
        const flattenedStudents = data.userInstituteData.map((teacher) => ({
          owner: teacher.user?.name,
          institute: teacher.institute?.name,
          institute_id: teacher.institute?.institute_id,
        }));
        setAllInstitutes(flattenedStudents);
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
          url: "/content/video/getAllAsanas",
        });
        const data = response.data;
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
  const addToSchedule = (rowData) => {
    var count = document.getElementById(`asana_count_${rowData.id}`).value;
    if (count === "") {
      count = 1;
    } else {
      count = Number(count);
    }
    if (schedule.length === 0) {
      const x = transitionGenerator("start", rowData, transitions);
      if (x.length !== 0) {
        setSchedule((prev) => [
          ...prev,
          ...x.map((item) => ({ rowData: item, count: 1 })),
        ]);
      }
    } else {
      let startVideo = schedule[schedule.length - 1].rowData;
      let endVideo = rowData;
      const x = transitionGenerator(startVideo, endVideo, transitions);
      if (x.length !== 0) {
        setSchedule((prev) => [
          ...prev,
          ...x.map((item) => ({ rowData: item, count: 1 })),
        ]);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    let to_be_inserted = {
      schedule_name: formData.playlist_name,
      validity_from: formData.validity_from,
      validity_to: formData.validity_to,
      asana_ids: [],
      applicable_ids: [],
    };
    schedule.map((item) => {
      const asana_id_playlist =
        item["rowData"]["id"] || item["rowData"]["transition_id"];
      const asana_count = Number(item["count"]);
      for (let i = 0; i < asana_count; i++) {
        to_be_inserted["asana_ids"].push(asana_id_playlist);
      }
    });
    to_be_inserted["applicable_ids"] = applicableUsers;

    try {
      const response = await Fetch({
        url: "/schedule/addSchedule",
        method: "POST",
        data: to_be_inserted,
      });
      if (response?.status === 200) {
        toast("Schedule added successfully");
        // navigate("/admin/playlist/view-all");
      } else {
        console.error("Failed to add schedule");
      }
    } catch (error) {
      console.error("Error during schedule addition:", error);
    }
  };

  const renderAction = (value, rowData, index) => {
    const handleDelete = () => {
      setSchedule((prevSchedule) => {
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
  const handleUserRowSelection = (userId, userType) => {
    const userKey = `${userType}_${userId}`;
    setApplicableUsers((prevUsers) => {
      if (prevUsers.includes(userKey)) {
        return prevUsers.filter((user) => user !== userKey);
      } else {
        return [...prevUsers, userKey];
      }
    });
  };

  const handleChooseAll = (userType, data) => {
    for (var i = 0; i < data.length; i++) {
      let userKey = "";
      if (userType === "Institute") {
        userKey = `${userType}_${data[i].institute_id}`;
      } else {
        userKey = `${userType}_${data[i].user_id}`;
      }
      setApplicableUsers((prevUsers) => {
        if (prevUsers.includes(userKey)) {
          return prevUsers.filter((user) => user !== userKey);
        } else {
          return [...prevUsers, userKey];
        }
      });
    }
  };

  return (
    <AdminPageWrapper heading="Schedule Management - Register">
      <div className="grid grid-cols-3 my-10 gap-8">
        {/* <div className="col-start-1 col-span-2 flex flex-col items-center justify-center gap-1"> */}
        <Collapse.Group className="col-start-1 col-span-2">
          {filteredAsanasByCategory.map((categoryData, index) => (
            <Collapse key={index} title={categoryData.category}>
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
            </Collapse>
          ))}
        </Collapse.Group>
        {/* </div> */}

        <div>
          <Card>
            <Table data={schedule} className="bg-dark ">
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
              <Input width="100%" name="playlist_name">
                Schedule Name
              </Input>
              <Input name="validity_from" htmlType="datetime-local">
                Validity From
              </Input>
              <Input name="validity_to" htmlType="datetime-local">
                Validity To
              </Input>
              <Select
                multiple
                width="100%"
                onChange={handler}
                name="schedule_for"
                placeholder="Select User Type"
              >
                <Select.Option key="Student" value="Student">
                  Student
                </Select.Option>
                <Select.Option key="Teacher" value="Teacher">
                  Teacher
                </Select.Option>
                <Select.Option key="Institute" value="Institute">
                  Institute
                </Select.Option>
              </Select>
              <br />
              <br />
              <div>
                {scheduleFor?.includes("Student") && (
                  <div>
                    <Button
                      onClick={() => handleChooseAll("Student", allStudents)}
                    >
                      Choose All Students
                    </Button>
                    <br />

                    <Table width={50} data={allStudents} className="bg-white">
                      <Table.Column
                        label="Username"
                        width={150}
                        prop="username"
                      />
                      <Table.Column
                        label="Student Name"
                        width={150}
                        prop="name"
                      />
                      <Table.Column label="Email ID" width={200} prop="email" />
                      <Table.Column
                        label="Action"
                        width={150}
                        prop="user_id"
                        render={(row) => (
                          <Button
                            onClick={() => {
                              handleUserRowSelection(row, "Student");
                            }}
                          >
                            {applicableUsers.includes(`Student_${row}`)
                              ? "Remove from Applicable Users"
                              : "Add to Applicable Users"}
                          </Button>
                        )}
                      />
                    </Table>
                  </div>
                )}
                <br />
                {scheduleFor?.includes("Teacher") && (
                  <div>
                    <Button
                      onClick={() => handleChooseAll("Teacher", allTeachers)}
                    >
                      Choose All Teachers
                    </Button>
                    <br />
                    <Table width={50} data={allTeachers} className="bg-white">
                      <Table.Column
                        label="Username"
                        width={150}
                        prop="username"
                      />
                      <Table.Column
                        label="Teacher Name"
                        width={150}
                        prop="name"
                      />
                      <Table.Column label="Email ID" width={200} prop="email" />
                      <Table.Column
                        label="Institute"
                        width={200}
                        prop="institute"
                      />
                      <Table.Column
                        label="Action"
                        width={150}
                        prop="user_id"
                        render={(row) => (
                          <Button
                            onClick={() => {
                              handleUserRowSelection(row, "Teacher");
                            }}
                          >
                            {applicableUsers.includes(`Teacher_${row}`)
                              ? "Remove from Applicable Users"
                              : "Add to Applicable Users"}
                          </Button>
                        )}
                      />
                    </Table>
                  </div>
                )}
                <br />
                {scheduleFor?.includes("Institute") && (
                  <div>
                    <Button
                      onClick={() =>
                        handleChooseAll("Institute", allInstitutes)
                      }
                    >
                      Choose All Institutes
                    </Button>
                    <br />
                    <Table width={50} data={allInstitutes} className="bg-white">
                      <Table.Column
                        label="Institute Owner Name"
                        width={150}
                        prop="owner"
                      />
                      <Table.Column
                        label="Institute"
                        width={200}
                        prop="institute"
                      />
                      <Table.Column
                        label="Action"
                        width={150}
                        prop="institute_id"
                        render={(row) => (
                          <Button
                            onClick={() => {
                              handleUserRowSelection(row, "Institute");
                            }}
                          >
                            {applicableUsers.includes(`Institute_${row}`)
                              ? "Remove from Applicable Users"
                              : "Add to Applicable Users"}
                          </Button>
                        )}
                      />
                    </Table>
                  </div>
                )}
              </div>

              <Button htmlType="submit">Submit</Button>
            </form>
          </Card>
        </div>
      </div>

      {/* modal */}
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
    </AdminPageWrapper>
  );
}

export default withAuth(RegisterNewSchedule, ROLE_ROOT);
