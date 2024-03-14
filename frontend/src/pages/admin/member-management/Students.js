import {
  Button,
  Card,
  Grid,
  Input,
  Modal,
  Spacer,
  Table,
  Text,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { validateEmail, validatePhone } from "../../../utils/formValidation";
import { withAuth } from "../../../utils/withAuth";
import Papa from "papaparse";

function Students() {
  const [students, setStudents] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
  const [delState, setDelState] = useState(false);
  const [delUserId, setDelUserId] = useState(0);
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    user_id: 0,
    username: "",
    name: "",
    email: "",
    phone: "",
  });
  const appendToUsers = (newUserData) => {
    setStudentData((prevUsers) => [...prevUsers, newUserData]);
  };
  useEffect(() => {
    if (students.length > 0) {
      setStudentData([]);
      for (var i = 0; i !== students.length; i++) {
        console.log(students[i].user_id);
        Fetch({
          url: "/user/get-by-id",
          method: "POST",
          data: {
            user_id: students[i].user_id,
          },
        }).then((res) => {
          if (res && res.status === 200) {
            console.log(res.data);
            appendToUsers(res.data.user);
          } else {
            toast("Error updating profile; retry", {
              type: "error",
            });
          }
        });
      }
    }
  }, [students]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-students",
          method: "GET",
        });
        const data = response.data;
        console.log(data);
        setStudents(data.users);
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
          url: "/update-request/get-all",
          method: "GET",
        });
        const data = response.data;
        setUpdateRequests(data.updateRequests);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);
  const RenderAction = (value, rowData, index) => {
    const handleAccept = async () => {
      Fetch({
        url: "/update-request/approve",
        method: "POST",
        data: {
          update_request_id: rowData.update_request_id,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            toast("Email Update Approved", { type: "success" });
          }
        })
        .catch((err) => {
          console.log(err);
          toast("An error occured!");
        });
    };
    const handleReject = async () => {
      Fetch({
        url: "/update-request/reject",
        method: "POST",
        data: {
          update_request_id: rowData.update_request_id,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            toast("Email Update Rejected", { type: "success" });
          }
        })
        .catch((err) => {
          console.log(err);
          toast("An error occured!");
        });
    };
    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <>
            {rowData.status === "ACCEPTED" && <div>Hi</div>}
            <Button
              type="success"
              auto
              scale={1 / 3}
              font="12px"
              onClick={handleAccept}
            >
              Approve
            </Button>
            <Button
              type="error"
              auto
              scale={1 / 3}
              font="12px"
              onClick={handleReject}
            >
              Reject
            </Button>
          </>
        </Grid>
      </Grid.Container>
    );
  };
  const filteredUpdateRequests = updateRequests.filter(
    (request) => !request.admin_approved
  );
  const renderAction1 = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const userId = Number(rowData.user_id);
        setDelUserId(userId);
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
            onClick={() => handleUpdate(Number(rowData.user_id))}
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

  const deleteUser = async () => {
    try {
      const delId = delUserId;
      const response = await Fetch({
        url: "/user/delete-by-id",
        method: "DELETE",
        data: { user_id: delId },
      });
      if (response?.status === 200) {
        toast("Deleted successfully!");
        setStudentData((prev) =>
          prev.filter((playlist) => playlist.user_id !== delId)
        );
      } else {
        console.log("Error deleting user:", response.status);
      }
      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };
  const updateData = async () => {
    console.log("Modal Data : ", modalData);
    const [validEmail, emailError] = validateEmail(modalData.email);

    if (!validEmail) {
      toast(emailError.message, { type: "error" });
      return;
    }

    const [validPhone, phoneError] = validatePhone(modalData.phone);

    if (!validPhone) {
      toast(phoneError.message, { type: "error" });
      return;
    }
    try {
      const response = await Fetch({
        url: "/user/update-profile",
        method: "POST",
        data: modalData,
      });
      if (response?.status === 200) {
        toast("Update successful!");
        setStudentData((prev) =>
          prev.map((p1) => (p1.user_id === modalData.user_id ? modalData : p1))
        );
        setModalState(false);
      } else {
        console.log("Error updating user details:", response.status);
        console.log(response);
      }
    } catch (error) {
      console.error(error);
    }
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
  return (
    <AdminPageWrapper heading="Member Management - Students">
      <div className="elements">
        <Card>
          <Table width="100%" data={studentData} className="bg-white">
            <Table.Column prop="user_id" label="ID" />
            <Table.Column label="Username" width={150} prop="username" />
            <Table.Column label="Student Name" width={150} prop="name" />
            <Table.Column label="Email ID" width={200} prop="email" />
            <Table.Column label="Phone" width={150} prop="phone" />
            <Table.Column
              prop="operation"
              label="ACTIONS"
              width={150}
              render={renderAction1}
            />
          </Table>
        </Card>
      </div>
      <Spacer h={2} />
      <Card>
        <Text h4>Pending Email Update Requests</Text>
        <Table width="100%" data={filteredUpdateRequests} className="bg-white">
          <Table.Column prop="user_id" label="User ID" />
          <Table.Column label="Student Name" width={150} prop="name" />
          <Table.Column label="Old Email ID" width={200} prop="old_email" />
          <Table.Column label="New Email ID" width={200} prop="new_email" />
          <Table.Column label="Phone" width={150} prop="phone" />
          <Table.Column
            prop="operation"
            label="Approve/Reject"
            width={150}
            render={RenderAction}
          />
        </Table>
      </Card>
      <div>
        <Modal
          visible={modalState}
          onClose={() => setModalState(false)}
          width="50rem"
        >
          <Modal.Title>Update User Details</Modal.Title>
          <Modal.Content>
            <form>
              <Input
                width="100%"
                id="username"
                placeholder={modalData.username}
                onChange={handleInputChange}
              >
                Username
              </Input>
              <Input
                width="100%"
                id="name"
                placeholder={modalData.name}
                onChange={handleInputChange}
              >
                Name
              </Input>
              <Input
                width="100%"
                id="email"
                placeholder={modalData.email}
                onChange={handleInputChange}
              >
                Email ID
              </Input>
              <Input
                width="100%"
                id="phone"
                placeholder={modalData.phone}
                onChange={handleInputChange}
              >
                Phone Number
              </Input>
              <br />
            </form>
          </Modal.Content>
          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>

        <Modal visible={delState} onClose={() => setDelState(false)}>
          <Modal.Title>Delete User</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this user?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDelState(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deleteUser}>Yes</Modal.Action>
        </Modal>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(Students, ROLE_ROOT);
