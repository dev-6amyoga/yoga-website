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
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState(false);
  const [delState, setDelState] = useState(false);
  const [modalData, setModalData] = useState({
    user_id: 0,
    username: "",
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-students",
          method: "GET",
        });

        const data = response.data;

        const sortedUsers = data.users.sort((a, b) => {
          return new Date(b.created) - new Date(a.created);
        });

        console.log(sortedUsers);

        // Set the sorted data to state
        setStudents(sortedUsers);
        setStudentData(sortedUsers);
        setFilteredData(sortedUsers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Handle Search Input Change
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = studentData.filter((student) =>
      student.name.toLowerCase().includes(term)
    );
    setFilteredData(filtered);
  };

  // Handle CSV Download
  const handleDownload = () => {
    const csv = Papa.unparse(studentData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "students.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminPageWrapper heading="Member Management - Students">
      {/* Search and Download Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Input
          placeholder="Search by student name"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: "300px", padding: "10px" }}
        />
        <Button
          onClick={handleDownload}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "4px",
          }}
        >
          Download CSV
        </Button>
      </div>

      {/* Student Table */}
      <Card>
        <Table width="100%" data={filteredData} className="bg-white">
          <Table.Column prop="user_id" label="ID" />
          <Table.Column label="Username" width={150} prop="username" />
          <Table.Column label="Student Name" width={150} prop="name" />
          <Table.Column label="Email ID" width={200} prop="email" />
          <Table.Column label="Phone" width={150} prop="phone" />
          <Table.Column
            prop="operation"
            label="ACTIONS"
            width={150}
            render={(value, rowData) => (
              <div>
                {/* Example Actions */}
                <Button type="error" auto scale={1 / 3}>
                  Delete
                </Button>
              </div>
            )}
          />
        </Table>
      </Card>
    </AdminPageWrapper>
  );
}
export default withAuth(Students, ROLE_ROOT);
