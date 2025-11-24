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
  Chip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { toast } from "react-toastify";

const liveBlinkingKeyframes = `
  @keyframes liveBlink {
    0%, 49% {
      box-shadow: 0 0 20px 5px rgba(76, 175, 80, 0.8), 0 0 40px 10px rgba(76, 175, 80, 0.4);
    }
    50%, 100% {
      box-shadow: 0 0 10px 2px rgba(76, 175, 80, 0.4), 0 0 20px 5px rgba(76, 175, 80, 0.2);
    }
  }
`;

export default function YogaClassCard({
  classDetails,
  isStudentView = true,
  isAdminView = false,
  isLive = false,
}) {
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

  // ...existing code...

  const handleJoin = async (e) => {
    e.preventDefault();
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
          deviceId: navigator.userAgent,
        },
      });
      console.log(response);

      if (response.data.allowed) {
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

  const handleAdminJoin = async (e) => {
    e.preventDefault();
    setJoining(true);

    try {
      const response = await Fetch({
        url: "/class-attendance/admin/join-class",
        method: "POST",
        token: true,
        data: {
          classId: classDetails.zoom_class_id,
        },
      });

      if (response.data.allowed) {
        window.open(response.data.zoom_url, "_blank");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Admin join error:", error);
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
    const thirtyMinsBeforeStart = new Date(startTime.getTime() - 15 * 60000);
    if (now > endTime) {
      joinDisabled = true;
      joinTooltip = "Class has ended.";
    } else if (now < thirtyMinsBeforeStart) {
      joinDisabled = true;
      joinTooltip =
        "JOIN button will be enabled only 15 mins before class start time.";
    }
  }

  if (
    isStudentView &&
    classDetails.class_type === "recurring" &&
    Array.isArray(classDetails.recurring_days) &&
    classDetails.recurring_days.length > 0
  ) {
    const now = new Date();
    const todayDayNum = now.getDay();

    if (!classDetails.recurring_days.includes(todayDayNum)) {
      joinDisabled = true;
      joinTooltip = "No class scheduled for today.";
    } else {
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
      const thirtyMinsBeforeStart = new Date(todayStart.getTime() - 15 * 60000);

      if (now > todayEnd) {
        joinDisabled = true;
        joinTooltip = "Class has ended.";
      } else if (now < thirtyMinsBeforeStart) {
        joinDisabled = true;
        joinTooltip =
          "JOIN button will be enabled only 15 mins before class start time.";
      }
    }
  }

  const infoData = `
Class Name: ${classDetails.zoom_class_name}
Type: ${classDetails.class_type}
${
  classDetails.class_type === "one_time"
    ? `Start: ${classDetails.start_time ? new Date(classDetails.start_time).toLocaleString() : ""}
End: ${classDetails.end_time ? new Date(classDetails.end_time).toLocaleString() : ""}`
    : `Days: ${Array.isArray(classDetails.recurring_days) ? classDetails.recurring_days.join(", ") : ""}
Start Time: ${classDetails.recurring_start_time}
End Time: ${classDetails.recurring_end_time}`
}
`;

  return (
    <>
      <style>{liveBlinkingKeyframes}</style>
      <Card
        sx={{
          width: "80%",
          borderRadius: 4,
          boxShadow: 3,
          textAlign: "center",
          p: 2,
          mb: 2,
          backgroundColor: isLive ? "rgba(76, 175, 80, 0.1)" : "inherit",
          border: isLive ? "2px solid #4CAF50" : "none",
          animation: isLive ? "liveBlink 1.5s infinite" : "none",
          transition: "all 0.3s ease",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontFamily: "Roboto, sans-serif", fontWeight: 500 }}
            >
              {classDetails.zoom_class_name}
            </Typography>
            {isLive && (
              <Chip
                label="LIVE"
                size="small"
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  fontWeight: "bold",
                  animation: "liveBlink 1.5s infinite",
                }}
              />
            )}
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

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}
          >
            {isAdminView ? (
              <Tooltip title="Join class without attendance tracking">
                <span>
                  <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    sx={{ borderRadius: 2, px: 5, minWidth: 120 }}
                    onClick={handleAdminJoin}
                    disabled={joining}
                  >
                    {joining ? "JOINING..." : "ADMIN JOIN"}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Tooltip
                title={joinDisabled ? joinTooltip : ""}
                arrow
                disableHoverListener={!joinDisabled}
              >
                <span>
                  <Button
                    variant="contained"
                    color={isLive ? "success" : "primary"}
                    size="medium"
                    sx={{
                      borderRadius: 2,
                      px: 5,
                      minWidth: 120,
                      backgroundColor: isLive ? "#4CAF50" : "primary",
                      fontWeight: isLive ? "bold" : "normal",
                    }}
                    onClick={handleJoin}
                    disabled={joinDisabled || joining}
                  >
                    {joining ? "JOINING..." : "JOIN"}
                  </Button>
                </span>
              </Tooltip>
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
    </>
  );
}
