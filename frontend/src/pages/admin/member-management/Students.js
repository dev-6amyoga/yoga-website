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
  TablePagination,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { Fetch } from "../../../utils/Fetch";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import TeacherPageWrapper from "../../../components/Common/TeacherPageWrapper";

function Students({ adminRole = false }) {
  const [studentData, setStudentData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-students",
          method: "GET",
        });

        const sortedUsers = response.data.users.sort(
          (a, b) => new Date(b.created) - new Date(a.created),
        );

        setStudentData(sortedUsers);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return studentData.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [studentData, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleDownload = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = "students.csv";
    link.click();
  };

  const Wrapper = adminRole ? AdminPageWrapper : TeacherPageWrapper;

  return (
    <Wrapper heading="Member Management - Students">
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
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(0);
          }}
          style={{ width: 300 }}
        />

        <Button variant="contained" onClick={handleDownload}>
          Download CSV
        </Button>
      </div>

      <Card sx={{ padding: 2 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Email ID</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((student) => (
                <TableRow key={student.user_id}>
                  <TableCell>{student.username}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>
                    {adminRole && (
                      <Button variant="contained" color="error" size="small">
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TableContainer>
      </Card>
    </Wrapper>
  );
}

export default Students;
