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

export default function YogaClassCard({
  classDetails,
  isStudentView = true,
  isAdminView = false,
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [user, userPlan] = useUserStore((state) => [
    state.user,
    state.userPlan,
  ]);

  /** ----------------------------------------------------------------------
   *  SINGLE SOURCE OF TRUTH — Already converted server times
   * ---------------------------------------------------------------------- */
  const start = new Date(classDetails.local_start_time);
  const end = new Date(classDetails.local_end_time);
  const now = new Date();

  /** ----------------------------------------------------------------------
   *  Format for display (local timezone)
   * ---------------------------------------------------------------------- */
  function formatDisplayTime(date) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
  }

  /** ----------------------------------------------------------------------
   *  LIVE & JOIN LOGIC — same in all countries
   *
   *  JOIN enable window:
   *    15 min before start  →  end of class
   *
   *  LIVE indicator:
   *    now >= start && now <= end
   * ---------------------------------------------------------------------- */
  const fifteenBefore = new Date(start.getTime() - 15 * 60000);

  const isLive = now >= start && now <= end;

  let joinDisabled = false;
  let joinTooltip = "";

  if (now < fifteenBefore) {
    joinDisabled = true;
    joinTooltip = "JOIN will be enabled 15 minutes before class start time.";
  } else if (now > end) {
    joinDisabled = true;
    joinTooltip = "Class has ended.";
  }

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoining(true);

    // 1️⃣ Open popup immediately during the user click event
    const popup = window.open("", "_blank");

    try {
      // Skip attendance tracking for Master Class
      if (classDetails.zoom_class_name === "Master Class") {
        const universalZoomUrl = classDetails.zoom_url;
        if (popup) {
          popup.location.href = universalZoomUrl;
        } else {
          window.location.href = universalZoomUrl;
        }
        toast.success("Joining class...");
        return;
      }

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

      if (!response.data.allowed) {
        popup?.close();
        toast.error(response.data.message);
        return;
      }

      const universalZoomUrl = classDetails.zoom_url;

      if (popup) {
        popup.location.href = universalZoomUrl;
      } else {
        window.location.href = universalZoomUrl;
      }

      toast.success(response.data.message);
    } catch (error) {
      popup?.close();
      toast.error(error.response?.data?.message || "Failed to join class");
    } finally {
      setJoining(false);
    }
  };

  // const handleJoin = async (e) => {
  //   e.preventDefault();
  //   setJoining(true);

  //   try {
  //     const response = await Fetch({
  //       url: "/class-attendance/join",
  //       method: "POST",
  //       data: {
  //         userId: user.user_id,
  //         classId: classDetails.zoom_class_id,
  //         planId: userPlan.plan_id,
  //         userPlanId: userPlan.user_plan_id,
  //         deviceId: navigator.userAgent,
  //       },
  //     });

  //     if (response.data.allowed) {
  //       try {
  //         const newTab = window.open(classDetails.zoom_url, "_blank");
  //         if (!newTab) {
  //           window.location.href = classDetails.zoom_url;
  //         }
  //       } catch {
  //         window.location.href = classDetails.zoom_url;
  //       }
  //       toast.success(response.data.message);
  //     } else {
  //       toast.error(response.data.message);
  //     }
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || "Failed to join class");
  //   } finally {
  //     setJoining(false);
  //   }
  // };

  const handleAdminJoin = async () => {
    setJoining(true);

    try {
      const response = await Fetch({
        url: "/class-attendance/admin/join-class",
        method: "POST",
        token: true,
        data: { classId: classDetails.zoom_class_id },
      });

      if (response.data.allowed) {
        window.open(response.data.zoom_url, "_blank");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join class");
    } finally {
      setJoining(false);
    }
  };

  function formatIST(date) {
    console.log(date, "IST");
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    });
  }

  function formatEST(date) {
    console.log(date, "EST");
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/New_York",
    });
  }
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log("User Time Zone:", userTimeZone);
  const isIndia = userTimeZone === "Asia/Calcutta";
  console.log("Is India Time Zone:", isIndia);
  const displayStart = isIndia ? formatIST(start) : formatEST(start);
  const displayEnd = isIndia ? formatIST(end) : formatEST(end);

  const infoData = `
Class Name: ${classDetails.zoom_class_name}
Start: ${start.toLocaleString()}
End:   ${end.toLocaleString()}
Type:  ${classDetails.class_type}
`;

  return (
    <>
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
        }}
      >
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Typography variant="h6">{classDetails.zoom_class_name}</Typography>

            {isLive && (
              <Chip
                label="LIVE"
                size="small"
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            )}

            <IconButton size="small" onClick={() => setInfoOpen(true)}>
              <InfoOutlinedIcon />
            </IconButton>
          </Box>

          {/* Time display */}
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
              {`${displayStart} - ${displayEnd}`}
            </Typography>
          </Box>

          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {isAdminView ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdminJoin}
                disabled={joining}
                sx={{ borderRadius: 2, px: 5 }}
              >
                {joining ? "JOINING..." : "ADMIN JOIN"}
              </Button>
            ) : (
              <Tooltip title={joinDisabled ? joinTooltip : ""} arrow>
                <span>
                  <Button
                    variant="contained"
                    color={isLive ? "success" : "primary"}
                    onClick={handleJoin}
                    disabled={joinDisabled || joining}
                    sx={{ borderRadius: 2, px: 5 }}
                  >
                    {joining ? "JOINING..." : "JOIN"}
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>

      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)}>
        <DialogTitle>Class Info</DialogTitle>
        <DialogContent>
          <pre>{infoData}</pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
