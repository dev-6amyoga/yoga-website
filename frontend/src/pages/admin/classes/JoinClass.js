"use client";
import React, { useEffect, useState } from "react";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import TeacherPageWrapper from "../../../components/Common/TeacherPageWrapper";
import YogaClassCard from "./YogaClassCard";
import { Fetch } from "../../../utils/Fetch";
import { Box, CircularProgress, Typography } from "@mui/material";
import useUserStore from "../../../store/UserStore";

export default function JoinClass({ adminRole = false }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    setLoading(true);
    Fetch({
      url: "/zoom/admin/classes/today",
      method: "GET",
    })
      .then((res) => {
        setClasses(res.data);
      })
      .catch((err) => {
        console.error("Error fetching today's classes:", err);
      })
      .finally(() => setLoading(false));
  }, []);
  const Wrapper = adminRole ? AdminPageWrapper : TeacherPageWrapper;

  return (
    <Wrapper heading={"Join Class"}>
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
              isStudentView={false}
              isAdminView={true}
            />
          ))}
        </Box>
      )}
    </Wrapper>
  );
}
