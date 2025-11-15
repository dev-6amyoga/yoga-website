import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { toast } from "react-toastify";

export default function YogaClassCard({ classDetails, isStudentView = true }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [user, userPlan] = useUserStore((state) => [
    state.user,
    state.userPlan,
  ]);

  let timingStr = "";
  let startTime, endTime;
  let joinDisabled = false;
  let joinTooltip = "";

  const handleJoin = async (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    setJoining(true);

    try {
      const response = await Fetch({
        url: "/class-attendance/join",
        method: "POST",
        data: {
          userId: user.user_id,
          classId: classDetails.zoom_class_id,
          planId: userPlan.plan_id,
          userPlanId: userPlan.user_plan_id,
          deviceId: navigator.userAgent, // Using user agent as device ID
        },
      });
      console.log(response);

      if (response.data.allowed) {
        // If attendance recorded successfully, open Zoom link
        window.open(classDetails.zoom_url, "_blank");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Join error:", error);
      toast.error(error.response?.data?.message || "Failed to join class");
    } finally {
      setJoining(false);
    }
  };
  if (classDetails.class_type === "one_time") {
    startTime = new Date(classDetails.start_time);
    endTime = new Date(classDetails.end_time);
    timingStr =
      classDetails.start_time && classDetails.end_time
        ? `${startTime.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}, ${startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${endTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "";
  } else if (classDetails.class_type === "recurring") {
    const days =
      Array.isArray(classDetails.recurring_days) &&
      classDetails.recurring_days.length
        ? classDetails.recurring_days
            .map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d])
            .join(", ")
        : "";
    timingStr = `${days} | ${classDetails.recurring_start_time} - ${classDetails.recurring_end_time}`;
  }

  if (
    isStudentView &&
    classDetails.class_type === "one_time" &&
    startTime &&
    endTime
  ) {
    const now = new Date();
    const thirtyMinsBeforeStart = new Date(startTime.getTime() - 30 * 60000);
    if (now > endTime) {
      joinDisabled = true;
      joinTooltip = "Class has ended.";
    } else if (now < thirtyMinsBeforeStart) {
      joinDisabled = true;
      joinTooltip =
        "JOIN button will be enabled only 30 mins before class start time.";
    }
  }

  if (
    isStudentView &&
    classDetails.class_type === "recurring" &&
    Array.isArray(classDetails.recurring_days) &&
    classDetails.recurring_days.length > 0
  ) {
    const now = new Date();
    const todayDayNum = now.getDay(); // 0 (Sun) - 6 (Sat)

    // Check if today is a recurring day
    if (!classDetails.recurring_days.includes(todayDayNum)) {
      joinDisabled = true;
      joinTooltip = "No class scheduled for today.";
    } else {
      // Build today's start and end Date objects using today's date and recurring times
      const [startHour, startMinute] = classDetails.recurring_start_time
        .split(":")
        .map(Number);
      const [endHour, endMinute] = classDetails.recurring_end_time
        .split(":")
        .map(Number);

      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour,
        startMinute,
        0
      );
      const todayEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endHour,
        endMinute,
        0
      );
      const thirtyMinsBeforeStart = new Date(todayStart.getTime() - 30 * 60000);

      if (now > todayEnd) {
        joinDisabled = true;
        joinTooltip = "Class has ended.";
      } else if (now < thirtyMinsBeforeStart) {
        joinDisabled = true;
        joinTooltip =
          "JOIN button will be enabled only 30 mins before class start time.";
      }
    }
  }

  const infoData = `
Class Name: ${classDetails.zoom_class_name}
Type: ${classDetails.class_type}
Institute ID: ${classDetails.institute_id}
Teacher ID: ${classDetails.teacher_id}
Plan ID: ${classDetails.plan_id}
${
  classDetails.class_type === "one_time"
    ? `Start: ${classDetails.start_time ? new Date(classDetails.start_time).toLocaleString() : ""}
End: ${classDetails.end_time ? new Date(classDetails.end_time).toLocaleString() : ""}`
    : `Days: ${Array.isArray(classDetails.recurring_days) ? classDetails.recurring_days.join(", ") : ""}
Start Time: ${classDetails.recurring_start_time}
End Time: ${classDetails.recurring_end_time}`
}
Zoom URL: ${classDetails.zoom_url}
Meeting ID: ${classDetails.zoom_meeting_id}
Meeting Password: ${classDetails.zoom_meeting_password}
`;

  return (
    <Card
      sx={{
        width: "80%",
        borderRadius: 4,
        boxShadow: 3,
        textAlign: "center",
        p: 2,
        mb: 2,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontFamily: "Roboto, sans-serif", fontWeight: 500, mr: 1 }}
          >
            {classDetails.zoom_class_name}
          </Typography>
          <IconButton size="small" onClick={() => setInfoOpen(true)}>
            <InfoOutlinedIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 2,
            display: "inline-block",
            px: 2,
            py: 0.5,
            mb: 3,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontStyle: "italic" }}>
            {timingStr}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}>
          <Tooltip
            title={joinDisabled ? joinTooltip : ""}
            arrow
            disableHoverListener={!joinDisabled}
          >
            <span>
              <Button
                variant="contained"
                color="success"
                size="medium"
                sx={{ borderRadius: 2, px: 5, minWidth: 120 }}
                onClick={handleJoin}
                disabled={joinDisabled || joining}
              >
                {joining ? "JOINING..." : "JOIN"}
              </Button>
            </span>
          </Tooltip>
          {!isStudentView && (
            <>
              <Button
                variant="outlined"
                size="medium"
                sx={{ borderRadius: 2, px: 5, minWidth: 120 }}
              >
                ATTENDANCE
              </Button>
              <Button
                variant="outlined"
                size="medium"
                sx={{ borderRadius: 2, px: 5, minWidth: 120 }}
              >
                ATTENDEE LIST
              </Button>
              <Button
                variant="contained"
                color="error"
                size="medium"
                sx={{ borderRadius: 2, px: 5, minWidth: 120 }}
              >
                DELETE
              </Button>
            </>
          )}
        </Box>
      </CardContent>
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogTitle>Class Info</DialogTitle>
        <DialogContent>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {infoData}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
