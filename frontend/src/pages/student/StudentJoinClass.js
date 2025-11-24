import React, { useEffect, useState } from "react";
import YogaClassCard from "../admin/classes/YogaClassCard";
import { Fetch } from "../../utils/Fetch";
import { Box, CircularProgress, Typography } from "@mui/material";
import useUserStore from "../../store/UserStore";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import { getLocalDateForRecurringClass } from "../../utils/TimezoneConverter";

export default function StudentJoinClass() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, userPlan] = useUserStore((state) => [
    state.user,
    state.userPlan,
  ]);

  const getClassEndTime = (classObj) => {
    if (classObj.class_type === "one_time") {
      return new Date(classObj.end_time);
    } else if (classObj.class_type === "recurring") {
      // Convert IST time to local timezone
      return getLocalDateForRecurringClass(classObj.recurring_end_time);
    }
  };

  const getClassStartTime = (classObj) => {
    if (classObj.class_type === "one_time") {
      return new Date(classObj.start_time);
    } else if (classObj.class_type === "recurring") {
      // Convert IST time to local timezone
      return getLocalDateForRecurringClass(classObj.recurring_start_time);
    }
  };

  const classifyClasses = (classesData) => {
    const now = new Date();
    const liveClasses = [];
    const upcomingClasses = [];
    const finishedClasses = [];

    classesData.forEach((classObj) => {
      const startTime = getClassStartTime(classObj);
      const endTime = getClassEndTime(classObj);
      const fifteenMinsBeforeStart = new Date(startTime.getTime() - 15 * 60000);
      if (now >= fifteenMinsBeforeStart && now < endTime) {
        liveClasses.push(classObj);
      } else if (now < fifteenMinsBeforeStart) {
        upcomingClasses.push(classObj);
      } else {
        finishedClasses.push(classObj);
      }
    });

    const sortByStartTime = (a, b) =>
      getClassStartTime(a) - getClassStartTime(b);
    liveClasses.sort(sortByStartTime);
    upcomingClasses.sort(sortByStartTime);
    finishedClasses.sort(sortByStartTime);
    return { liveClasses, upcomingClasses, finishedClasses };
  };

  useEffect(() => {
    //console.log(userPlan);
    if (user && userPlan) {
      setLoading(true);
      if (userPlan.plan_id) {
        Fetch({
          url: `/zoom/api/classes/today?plan_id=${userPlan.plan_id}`,
          method: "GET",
        })
          .then((res) => setClasses(res.data))
          .catch((err) => console.error("Error fetching today's classes:", err))
          .finally(() => setLoading(false));
      }
    }
  }, [user, userPlan]);

  const { liveClasses, upcomingClasses, finishedClasses } =
    classifyClasses(classes);

  return (
    <StudentPageWrapper heading={"Join Class"}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : classes.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          No classes scheduled for today.
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          {/* Live Classes Section */}
          {liveClasses.length > 0 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  alignSelf: "center",
                  mb: 1,
                }}
              >
                🔴 LIVE NOW
              </Typography>
              {liveClasses.map((classObj) => (
                <YogaClassCard
                  key={classObj.zoom_class_id}
                  classDetails={classObj}
                  isStudentView={true}
                  isAdminView={false}
                  isLive={true}
                />
              ))}
            </Box>
          )}

          {/* Upcoming Classes Section */}
          {upcomingClasses.length > 0 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#1976d2",
                  alignSelf: "center",
                  mb: 1,
                }}
              >
                Upcoming Classes
              </Typography>
              {upcomingClasses.map((classObj) => (
                <YogaClassCard
                  key={classObj.zoom_class_id}
                  classDetails={classObj}
                  isStudentView={true}
                  isAdminView={false}
                  isLive={false}
                />
              ))}
            </Box>
          )}

          {/* Finished Classes Section */}
          {finishedClasses.length > 0 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#999",
                  alignSelf: "center",
                  mb: 1,
                }}
              >
                Finished Classes
              </Typography>
              {finishedClasses.map((classObj) => (
                <YogaClassCard
                  key={classObj.zoom_class_id}
                  classDetails={classObj}
                  isStudentView={true}
                  isAdminView={false}
                  isLive={false}
                />
              ))}
            </Box>
          )}
        </Box>
      )}
    </StudentPageWrapper>
  );
}
