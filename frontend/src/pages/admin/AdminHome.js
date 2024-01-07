import React from "react";
import Navbar_Admin from "../../components/Common/AdminNavbar/AdminNavbar";
import "./AdminHome.css";
import { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Input,
  Modal,
  Select,
  Table,
  Text,
  Checkbox,
} from "@geist-ui/core";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminHome() {
  // const navigate = useNavigate();
  const notify = (x) => toast(x);
  const [institutes, setInstitutes] = useState([]);
  const [sortedInstitutes, setSortedInstitutes] = useState([]);
  const [updated, setupdated] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [DelinstituteId, setDelinstituteId] = useState(0);
  const [delState, setDelState] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [modalData, setModalData] = useState({
    institute_id: 0,
    name: "",
    address1: "",
    address2: "",
    email: "",
    phone: "",
    billing_address: "",
  });

  const closeDelHandler = (event) => {
    setDelState(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/institute/get-all-institutes",
          { headers: { "Cache-Control": "no-store" } }
        );
        console.log(response);
        const data = await response.json();
        setInstitutes(data["institutes"]);
        setupdated(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [updated]);

  useEffect(() => {
    const sortedData = [...institutes].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.institute_id - b.institute_id;
      } else {
        return b.institute_id - a.institute_id;
      }
    });
    setSortedInstitutes(sortedData);
  }, [institutes, sortOrder, updated]);

  const renderAction = (value, rowData, index) => {
    const handleDelete = async () => {
      try {
        const institute_id = Number(rowData.institute_id);
        setDelinstituteId(institute_id);
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
            onClick={() => handleUpdate(Number(rowData.institute_id))}
          >
            Update
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  const handleInputChange = (value, field) => {
    setModalData({ ...modalData, [field]: value });
  };

  const deleteInstitute = async () => {
    try {
      const institute_id = DelinstituteId; // Assuming you have the institute ID to delete
      const response = await fetch(
        `http://localhost:4000/institute/delete-by-id/${institute_id}`, // Adjust the endpoint
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Response from server:", response);
        setInstitutes((prev) =>
          prev.filter((institute) => institute.institute_id !== institute_id)
        );
        console.log("Institute deleted successfully");
      } else {
        console.log("Error deleting Institute:", response.status);
      }

      setDelState(false);
    } catch (error) {
      console.log(error);
    }
  };
  const updateData = async () => {
    try {
      const institute_id = Number(modalData.institute_id);
      console.log(modalData);
      const response = await fetch(
        `http://localhost:4000/institute/update/${institute_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(modalData),
        }
      );
      if (response.ok) {
        notify("Institute updated successfully");
        setupdated(true);
        setModalState(false);
      } else {
        console.log("Error updating Institute:", response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        <Navbar_Admin />
      </div>
      <div>
        <ToastContainer />
      </div>
      <div className="elements">
        <Table width={50} data={sortedInstitutes} className="bg-white ">
          <Table.Column prop="institute_id" label="Institute ID" />
          <Table.Column prop="name" label="Institute Name" />
          <Table.Column prop="address1" label="Address 1" />
          <Table.Column prop="address2" label="Address 2" />
          <Table.Column prop="email" label="Email" />
          <Table.Column prop="phone" label="Phone" />
          <Table.Column prop="billing_address" label="Billing Address" />
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
          <Modal.Title>Update Institute</Modal.Title>
          <Modal.Subtitle>{modalData.name}</Modal.Subtitle>
          <Modal.Content>
            <form>
              <Input
                width="100%"
                id="name"
                placeholder={modalData.name}
                onChange={(e) => handleInputChange(e.target.value, "name")}
              >
                Institute Name
              </Input>

              <Input
                width="100%"
                id="address1"
                placeholder={modalData.address1}
                onChange={(e) => handleInputChange(e.target.value, "address1")}
              >
                Address1
              </Input>

              <Input
                width="100%"
                id="address2"
                placeholder={modalData.address2}
                onChange={(e) => handleInputChange(e.target.value, "address2")}
              >
                Address2
              </Input>

              <Input
                width="100%"
                id="email"
                placeholder={modalData.email}
                onChange={(e) => handleInputChange(e.target.value, "email")}
              >
                Email
              </Input>

              <Input
                width="100%"
                id="phone"
                placeholder={modalData.phone}
                onChange={(e) => handleInputChange(e.target.value, "phone")}
              >
                Phone
              </Input>

              <Input
                width="100%"
                id="billing _address"
                placeholder={modalData.billing_address}
                onChange={(e) =>
                  handleInputChange(e.target.value, "billing_address")
                }
              >
                Billing address
              </Input>
            </form>
          </Modal.Content>

          <Modal.Action passive onClick={() => setModalState(false)}>
            Cancel
          </Modal.Action>
          <Modal.Action onClick={updateData}>Update</Modal.Action>
        </Modal>
        {/* delete modal */}
        <Modal visible={delState} onClose={closeDelHandler}>
          <Modal.Title>Delete institute</Modal.Title>
          <Modal.Content>
            <p>Do you really wish to delete this Institute?</p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setDelState(false)}>
            No
          </Modal.Action>
          <Modal.Action onClick={deleteInstitute}>Yes</Modal.Action>
        </Modal>
      </div>
    </div>
  );
}
