import * as React from "react";
import {
  alpha,
  CssBaseline,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import StudentNavMUI from "../../../components/Common/StudentNavbar/StudentNavMUI";
import Hero from "../components/Hero";
import { useEffect, useState } from "react";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_STUDENT } from "../../../enums/roles";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
function ViewMyClasses() {
  const [mode, setMode] = React.useState("light");
  const defaultTheme = createTheme({ palette: { mode } });
  const [classes, setClasses] = useState([]);
  let user = useUserStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      const res = await Fetch({
        url: "/class/student/get-all",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { user_id: user?.user_id },
      });
      if (res.status === 200) {
        setClasses(res.data);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "numeric", day: "numeric" };
    const date = new Date(dateString).toLocaleDateString(undefined, options);
    const time = new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} ${time}`;
  };

  const joinClass = (class_id) => {
    toast("Joining class..." + String(class_id));
    window.open(`/student/class/${class_id}/info`, "_blank");
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <StudentNavMUI />
      <Hero heading="My Classes" />
      <div className="flex flex-col items-center border-600-blue">
        <Box
          id="image"
          sx={(theme) => ({
            mt: { xs: 0, sm: 0 },
            alignSelf: "center",
            height: { xs: 150, sm: 400 },
            width: { xs: "90%", sm: "80%" },
            borderRadius: "10px",
            outline: "1px solid",
            outlineColor:
              theme.palette.mode === "light"
                ? alpha("#BFCCD9", 0.5)
                : alpha("#9CCCFC", 0.1),
            boxShadow:
              theme.palette.mode === "light"
                ? `0 0 12px 8px ${alpha("#9CCCFC", 0.2)}`
                : `0 0 24px 12px ${alpha("#033363", 0.2)}`,
          })}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Class Name</TableCell>
                  <TableCell>Class Description</TableCell>
                  {/* <TableCell>Class Type</TableCell> */}
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  {/* <TableCell>Status</TableCell> */}
                  <TableCell>Teacher</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {classes.map((classItem) => (
                  <TableRow key={classItem.class_name}>
                    <TableCell>{classItem.class_name}</TableCell>
                    <TableCell>{classItem.class_desc}</TableCell>
                    {/* <TableCell>{classItem.class_type}</TableCell> */}
                    <TableCell>
                      {formatDate(classItem.onetime_class_start_time)}
                    </TableCell>
                    <TableCell>
                      {formatDate(classItem.onetime_class_end_time)}
                    </TableCell>
                    {/* <TableCell>{classItem.status}</TableCell> */}
                    <TableCell>{classItem.teacher_id}</TableCell>
                    <TableCell align="right">
                      <Button
                        onClick={() => {
                          joinClass(classItem._id);
                        }}
                        variant="contained"
                        color="primary"
                      >
                        Join
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default withAuth(ViewMyClasses, ROLE_STUDENT);
