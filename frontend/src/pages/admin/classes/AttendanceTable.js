import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Chip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

export default function AttendanceTable({ data }) {
  if (!data || data.length === 0) {
    return <Typography>No attendance found.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>User ID</strong>
            </TableCell>
            <TableCell>
              <strong>Name</strong>
            </TableCell>
            <TableCell>
              <strong>Email</strong>
            </TableCell>
            <TableCell>
              <strong>Phone</strong>
            </TableCell>
            <TableCell>
              <strong>Date</strong>
            </TableCell>
            <TableCell>
              <strong>Status</strong>
            </TableCell>
            <TableCell>
              <strong>Join Time</strong>
            </TableCell>
            <TableCell>
              <strong>Duration (min)</strong>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((a) => (
            <TableRow key={a.id}>
              <TableCell>{a.user?.user_id}</TableCell>
              <TableCell>{a.user?.name}</TableCell>
              <TableCell>{a.user?.email}</TableCell>
              <TableCell>{a.user?.phone}</TableCell>

              <TableCell>{dayjs(a.date).format("YYYY-MM-DD")}</TableCell>

              <TableCell>
                <Chip
                  label={a.attendance_status}
                  color={
                    a.attendance_status === "ATTENDED" ? "success" : "error"
                  }
                  size="small"
                />
              </TableCell>

              <TableCell>
                {a.join_time ? dayjs(a.join_time).format("HH:mm") : "--"}
              </TableCell>

              <TableCell>{a.duration_minutes ?? "--"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
