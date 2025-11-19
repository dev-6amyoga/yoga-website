"use client";
import React, { useEffect, useState } from "react";
import YogaClassCard from "../admin/classes/YogaClassCard";
import { Fetch } from "../../utils/Fetch";
import { Box, CircularProgress, Typography } from "@mui/material";
import useUserStore from "../../store/UserStore";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";

export default function StudentJoinClass() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, userPlan] = useUserStore((state) => [
    state.user,
    state.userPlan,
  ]);

  //dummy commit

  useEffect(() => {
    console.log(userPlan);
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
            gap: 2,
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          {classes.map((classObj) => (
            <YogaClassCard
              key={classObj.zoom_class_id}
              classDetails={classObj}
              isStudentView={true}
              isAdminView={false}
            />
          ))}
        </Box>
      )}
    </StudentPageWrapper>
  );
}
