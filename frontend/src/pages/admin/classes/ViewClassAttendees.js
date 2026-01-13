import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Autocomplete,
  TextField,
  Typography,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import AttendanceByClass from "./AttendanceByClass";
import AttendanceTable from "./AttendanceTable";
import { Fetch } from "../../../utils/Fetch";
import dayjs from "dayjs";

export default function ViewClassAttendees() {
  const [classesList, setClassesList] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTime, setSelectedTime] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load class list (same endpoint used everywhere)
  useEffect(() => {
    async function loadClasses() {
      const res = await Fetch({
        url: "/zoom/api/classes",
        method: "GET",
      });

      if (res.status === 200) {
        const uniqueMap = new Map();

        res.data.forEach((cls) => {
          const key = [
            cls.zoom_class_name,
            cls.institute_id,
            cls.teacher_id,
            cls.recurring_days?.join(","),
            cls.recurring_start_time,
            cls.recurring_end_time,
          ].join("|");

          // keep only first one
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, cls);
          }
        });

        setClassesList(Array.from(uniqueMap.values()));
      }
    }

    loadClasses();
  }, []);

  const handleSearch = async () => {
    if (!selectedClass) return;

    setLoading(true);
    setResults(null);

    // 1️⃣ Call SAME-CLASS endpoint
    const res = await Fetch({
      url: `/class-attendance/same-class/${selectedClass.zoom_class_id}`,
      method: "GET",
    });

    if (res.status === 200) {
      let data = res.data.attendees;
      console.log("Fetched attendees:", data);

      if (selectedDate) {
        const dateStr = selectedDate.format("YYYY-MM-DD");
        data = data.filter((a) => a.date.startsWith(dateStr));
      }

      if (selectedTime) {
        const timeStr = selectedTime.format("HH:mm");
        data = data.filter((a) => a.time === timeStr);
      }

      setResults({
        total_attendance: data.length,
        attendees: data,
        classIds: res.data.classIds,
      });
    }

    setLoading(false);
  };

  const exportCSV = () => {
    if (!results || !results.attendees || results.attendees.length === 0)
      return;

    const rows = results.attendees;

    // Convert objects to CSV
    const headers = Object.keys(rows[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(","));

    // Add data rows
    for (const row of rows) {
      const values = headers.map((h) =>
        row[h] !== null && row[h] !== undefined
          ? `"${String(row[h]).replace(/"/g, '""')}"`
          : ""
      );
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

    const dateStr = selectedDate ? selectedDate.format("YYYY-MM-DD") : "all";
    const className = selectedClass?.zoom_class_name
      ?.replace(/\s+/g, "-")
      ?.toLowerCase();

    const filename = `attendance-${className}-${dateStr}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <AdminPageWrapper heading="View Class Attendees">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Card className="mb-6">
          <CardContent>
            <Grid container spacing={3}>
              {/* CLASS SELECT */}
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={classesList}
                  getOptionLabel={(c) =>
                    `${c.zoom_class_name} (${c.recurring_start_time} - ${c.recurring_end_time})`
                  }
                  onChange={(e, val) => setSelectedClass(val)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Class" required />
                  )}
                />
              </Grid>

              {/* DATE */}
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(val) => setSelectedDate(val)}
                />
              </Grid>

              {/* SEARCH BTN */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search Attendance"}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {results && (
          <Box mt={4}>
            <Typography variant="h6" className="mb-3">
              Attendance Results ({results.attendees.length})
            </Typography>

            <Button variant="outlined" sx={{ mb: 2 }} onClick={exportCSV}>
              Export CSV
            </Button>

            <AttendanceTable data={results.attendees} />
          </Box>
        )}
      </LocalizationProvider>
    </AdminPageWrapper>
  );
}
