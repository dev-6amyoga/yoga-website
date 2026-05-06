import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import YogaClassCard from "../admin/classes/YogaClassCard";

const getClassEndTime = (classObj) => {
  if (classObj.class_type === "one_time") {
    return new Date(classObj.end_time);
  }

  const now = new Date();
  const [endHour, endMinute] = classObj.recurring_end_time.split(":").map(Number);
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    endHour,
    endMinute,
    0,
  );
};

const getClassStartTime = (classObj) => {
  if (classObj.class_type === "one_time") {
    return new Date(classObj.start_time);
  }

  const now = new Date();
  const [startHour, startMinute] = classObj.recurring_start_time
    .split(":")
    .map(Number);
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    startHour,
    startMinute,
    0,
  );
};

const classifyClasses = (classesData) => {
  const now = new Date();
  const liveClasses = [];
  const upcomingClasses = [];
  const finishedClasses = [];

  classesData.forEach((classObj) => {
    const startTime = getClassStartTime(classObj);
    const endTime = getClassEndTime(classObj);
    const joinWindowStart = new Date(startTime.getTime() - 15 * 60000);

    if (now >= joinWindowStart && now < endTime) {
      liveClasses.push(classObj);
    } else if (now < joinWindowStart) {
      upcomingClasses.push(classObj);
    } else {
      finishedClasses.push(classObj);
    }
  });

  const sortByStartTime = (a, b) => getClassStartTime(a) - getClassStartTime(b);
  liveClasses.sort(sortByStartTime);
  upcomingClasses.sort(sortByStartTime);
  finishedClasses.sort(sortByStartTime);

  return { liveClasses, upcomingClasses, finishedClasses };
};

function ClassSection({ title, subtitle, icon, color, classes, isLive = false }) {
  if (!classes.length) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ color, display: "flex" }}>{icon}</Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Box>
          </Stack>
          <Chip label={`${classes.length} class${classes.length > 1 ? "es" : ""}`} />
        </Stack>

        <Stack spacing={2} alignItems="center">
          {classes.map((classObj) => (
            <YogaClassCard
              key={classObj.zoom_class_id}
              classDetails={classObj}
              isStudentView
              isAdminView={false}
              isLive={isLive}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function StudentJoinClass() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, userPlan] = useUserStore((state) => [
    state.user,
    state.userPlan,
  ]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    if (userPlan?.plan_id) {
      Fetch({
        url: `/zoom/api/classes/today?plan_id=${userPlan.plan_id}`,
        method: "GET",
      })
        .then((res) => setClasses(res.data || []))
        .catch(() => setClasses([]))
        .finally(() => setLoading(false));
      return;
    }

    Fetch({
      url: "/zoom/api/classes/today",
      method: "GET",
    })
      .then((res) => {
        const masterClasses = (res.data || []).filter(
          (classObj) => classObj.zoom_class_name === "Master Class",
        );
        setClasses(masterClasses[0] ? [masterClasses[0]] : []);
      })
      .catch(() => setClasses([]))
      .finally(() => setLoading(false));
  }, [user, userPlan]);

  const { liveClasses, upcomingClasses, finishedClasses } = useMemo(
    () => classifyClasses(classes),
    [classes],
  );

  return (
    <StudentPageWrapper>
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Join Class
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              See today&apos;s live, upcoming, and completed yoga sessions.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Live now
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                  {liveClasses.length}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Upcoming today
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                  {upcomingClasses.length}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Finished
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                  {finishedClasses.length}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          {loading ? (
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress />
                </Box>
              </CardContent>
            </Card>
          ) : classes.length === 0 ? (
            <Alert severity="info">
              No classes are scheduled for today. Please check back later.
            </Alert>
          ) : (
            <Stack spacing={3}>
              <ClassSection
                title="Live Now"
                subtitle="Join is available during the active class window."
                icon={<PlayCircleOutlineIcon />}
                color="success.main"
                classes={liveClasses}
                isLive
              />
              <ClassSection
                title="Upcoming Classes"
                subtitle="Join opens 15 minutes before the class starts."
                icon={<AccessTimeIcon />}
                color="primary.main"
                classes={upcomingClasses}
              />
              <ClassSection
                title="Finished Classes"
                subtitle="These sessions have ended for today."
                icon={<CheckCircleOutlineIcon />}
                color="text.secondary"
                classes={finishedClasses}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </StudentPageWrapper>
  );
}
