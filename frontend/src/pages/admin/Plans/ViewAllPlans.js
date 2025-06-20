import {
  Button,
  Grid,
  Input,
  Modal,
  Select,
  Spacer,
  Table,
  Text,
} from "@geist-ui/core";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function ViewAllPlans() {
  const notify = (x) => toast(x);
  const [plans, setPlans] = useState([]);
  const [delState, setDelState] = useState(false);
  const [delPlanId, setDelPlanId] = useState(0);
  const [modalState, setModalState] = useState(false);
  const [updated, setupdated] = useState(false);
  const [sortedPlans, setSortedPlans] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalData, setModalData] = useState({
    plan_id: 0,
    name: "",
    has_basic_playlist: false,
    has_playlist_creation: false,
    playlist_creation_limit: 0,
    has_self_audio_upload: false,
    number_of_teachers: 0,
    plan_validity: 0,
    plan_user_type: "",
  });

  const closeDelHandler = (event) => {
    setDelState(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/plan/get-all",
        });
        const data = response.data;

        const sortedUsers = data.plans.sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });
        setPlans(sortedUsers);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [updated]);

  useEffect(() => {
    const sortedData = [...plans].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.plan_id - b.plan_id;
      } else {
        return b.plan_id - a.plan_id;
      }
    });
    setSortedPlans(sortedData);
  }, [plans, sortOrder, updated]);

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
  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const plan_id = Number(rowData.plan_id);
        setDelPlanId(plan_id);
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
            onClick={() => handleUpdate(Number(rowData.plan_id))}
          >
            Update
          </Button>
        </Grid>
      </Grid.Container>
    );
  };
  const handleInputChange = (value, field) => {
    if (field === "has_basic_playlist") {
      setModalData({ ...modalData, [field]: value === "Yes" });
    } else if (field === "has_playlist_creation") {
      setModalData({ ...modalData, [field]: value === "Yes" });
    } else {
      setModalData({ ...modalData, [field]: value });
    }
  };

  const deletePlan = async () => {
    try {
      const plan_id = delPlanId; // Assuming you have the plan ID to delete

      const response = await Fetch({
        url: `/plan/deletePlan/${plan_id}`, // Adjust the endpoint
        method: "DELETE",
      });

      if (response?.status === 200) {
        console.log("Response from server:", response);
        setPlans((prev) => prev.filter((plan) => plan.plan_id !== plan_id));
        console.log("Plan deleted successfully");
      } else {
        console.log("Error deleting plan:", response.status);
      }

      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };
  const updateData = async () => {
    try {
      const plan_id = Number(modalData.plan_id);
      console.log(modalData);
      const response = await Fetch({
        url: `/plan/update-plan/${plan_id}`,
        method: "PUT",
        data: modalData,
      });
      if (response?.status === 200) {
        notify("Plan updated successfully");
        setupdated(true);
        setModalState(false);
      } else {
        console.log("Error updating asana:", response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <AdminPageWrapper heading="Plan Management - View All Plans">
      <div className="elements">
        <Button
          onClick={() => {
            handleDownload(sortedPlans);
          }}
        >
          Download CSV
        </Button>

        <Spacer h={2} />
        <Table data={sortedPlans}>
          <Table.Column prop="plan_id" label="Plan ID" />
          <Table.Column prop="name" label="Plan Name" />
          <Table.Column
            prop="has_basic_playlist"
            label="Can use 6AM Playlist"
          />
          <Table.Column
            prop="has_playlist_creation"
            label="Can make own playlist"
          />
          <Table.Column
            prop="playlist_creation_limit"
            label="Playlist creation Limit"
          />
          <Table.Column prop="has_self_audio_upload" label="Self Audio" />
          <Table.Column prop="number_of_teachers" label="Number of teachers" />
          <Table.Column prop="plan_validity" label="Plan Validity" />
          <Table.Column prop="plan_user_type" label="Plan user type" />
          <Table.Column
            prop="operation"
            label="ACTIONS"
            width={150}
            render={renderAction}
          />
        </Table>
      </div>
      <div>
        {/* update modal */}
        <Modal visible={modalState} onClose={() => setModalState(false)}>
          <Modal.Title>Update Plan</Modal.Title>
          <Modal.Subtitle>{modalData.name}</Modal.Subtitle>
          <Modal.Content>
            <form>
              <Input
                width="100%"
                id="name"
                placeholder={modalData.name}
                onChange={(e) => handleInputChange(e.target.value, "name")}
              >
                Plan Name
              </Input>

              <Text>Has Basic Playlist </Text>
              <Select
                placeholder={modalData.has_basic_playlist ? "Yes" : "No"}
                onChange={(value) =>
                  handleInputChange(value, "has_basic_playlist")
                }
                id="has_basic_playlist"
              >
                <Select.Option value="Yes"> Yes </Select.Option>
                <Select.Option value="No"> No </Select.Option>
              </Select>

              <Text>Has Basic Playlist </Text>
              <Select
                placeholder={modalData.has_playlist_creation ? "Yes" : "No"}
                onChange={(value) =>
                  handleInputChange(value, "has_playlist_creation")
                }
                id="has_playlist_creation"
              >
                <Select.Option value="Yes"> Yes </Select.Option>
                <Select.Option value="No"> No </Select.Option>
              </Select>

              <Input
                width="100%"
                id="name"
                placeholder={modalData.playlist_creation_limit}
                onChange={(e) =>
                  handleInputChange(e.target.value, "playlist_creation_limit")
                }
              >
                Playlist Creation Limit
              </Input>

              <Text>Has Self Audio Upload </Text>
              <Select
                placeholder={modalData.has_self_audio_upload ? "Yes" : "No"}
                onChange={(value) =>
                  handleInputChange(value, "has_self_audio_upload")
                }
                id="has_self_audio_upload"
              >
                <Select.Option value="Yes"> Yes </Select.Option>
                <Select.Option value="No"> No </Select.Option>
              </Select>

              <Input
                width="100%"
                id="number_of_teachers"
                placeholder={modalData.number_of_teachers}
                onChange={(e) =>
                  handleInputChange(e.target.value, "number_of_teachers")
                }
              >
                Number of Teachers
              </Input>

              <Input
                width="100%"
                id="plan_validity"
                placeholder={modalData.plan_validity}
                onChange={(e) =>
                  handleInputChange(e.target.value, "plan_validity")
                }
              >
                Plan Validity
              </Input>

              <Text> Plan User Type </Text>
              <Select
                placeholder={modalData.plan_user_type ? "Institute" : "Student"}
                onChange={(value) => handleInputChange(value, "plan_user_type")}
                id="plan_user_type"
              >
                <Select.Option value="Institute"> Institute </Select.Option>
                <Select.Option value="Student"> Student </Select.Option>
              </Select>
            </form>
          </Modal.Content>

          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>
        {/* delete modal */}
        <Modal visible={delState} onClose={closeDelHandler}>
          <Modal.Title>Delete plan</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this Plan?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDelState(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deletePlan}>Yes</Modal.Action>
        </Modal>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(ViewAllPlans, ROLE_ROOT);
