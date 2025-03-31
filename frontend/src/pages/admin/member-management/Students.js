import {
  Button,
  Card,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import Papa from "papaparse";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";

function Students() {
  const [students, setStudents] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

        setStudents(sortedUsers);
        setStudentData(sortedUsers);
        setFilteredData(sortedUsers);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = studentData.filter((student) =>
      student.name.toLowerCase().includes(term)
    );
    setFilteredData(filtered);
  };

  const handleDownload = () => {
    const csv = Papa.unparse(studentData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "students.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminPageWrapper heading="Member Management - Students">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <TextField
          label="Search by student name"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          style={{ width: "300px" }}
        />
        <Button variant="contained" color="primary" onClick={handleDownload}>
          Download CSV
        </Button>
      </div>

      <Card sx={{ padding: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell>ID</TableCell> */}
                <TableCell>Username</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Email ID</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((student) => (
                <TableRow key={student.user_id}>
                  {/* <TableCell>{student.user_id}</TableCell> */}
                  <TableCell>{student.username}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="error" size="small">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </AdminPageWrapper>
  );
}

export default withAuth(Students, ROLE_ROOT);
