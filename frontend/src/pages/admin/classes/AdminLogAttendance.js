import { Tabs, Tab, Box } from "@mui/material";
import AttendanceByClass from "./AttendanceByClass";
import AttendanceByUser from "./AttendanceByUser";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import TeacherPageWrapper from "../../../components/Common/TeacherPageWrapper";
import { useState } from "react";
export default function AdminLogAttendance({ adminRole = false }) {
  const [tab, setTab] = useState(0);

  const Wrapper = adminRole ? AdminPageWrapper : TeacherPageWrapper;

  return (
    <Wrapper heading={"Log Attendance"}>
      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Enter Attendance by Class" />
        <Tab label="Enter Attendance by User" />
      </Tabs>

      <Box mt={2}>
        {tab === 0 && <AttendanceByClass />}
        {tab === 1 && <AttendanceByUser />} {/* your existing entire screen */}
      </Box>
    </Wrapper>
  );
}
