import { ExitToApp, Share } from "@mui/icons-material";
import { Avatar, Button, Card, CardContent } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ClassAPI } from "../../../api/class.api";
import DisplayWatchTime from "../../../components/Common/DisplayWatchTime";
import StudentPageWrapper from "../../../components/Common/StudentPageWrapper";
import { CLASS_ONGOING, CLASS_UPCOMING } from "../../../enums/class_status";
import { getFrontendDomain } from "../../../utils/getFrontendDomain";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";

export default function ClassInfoStudent() {
  // get user_id, if it is null or not in allowed_students, display message
  const { class_id } = useParams();
  let user = useUserStore((state) => state.user);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const navigate = useNavigate();
  const [validUser, setValidUser] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const { data: classDetails } = useQuery({
    queryKey: ["classInfo", class_id],
    queryFn: async () => {
      const [res, err] = await ClassAPI.postGetClassById(class_id);
      console.log(res);
      if (err) {
        console.error(err);
        toast.error("Failed to fetch class info");
      }

      return res.class;
    },
  });

  const { data: classHistoryInfo } = useQuery({
    queryKey: ["classHistoryInfo", class_id],
    queryFn: async () => {
      const [res, err] = await ClassAPI.postGetLatestClassHistoryById(class_id);

      if (err) {
        console.error(err);
        toast.error("Failed to fetch class history info");
      }

      return res.class_history;
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (classDetails && user) {
        const res = await Fetch({
          url: "/class/student/get-all",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: { class_id: classDetails.class_id, user_id: user?.user_id },
        });
        if (res.status === 200) {
          console.log(res.data);
          if (res.data.length > 0) {
            setValidUser(true);
          } else {
            setValidUser(false);
          }
          // setClasses(res.data);
        } else {
          console.error("Failed to fetch class data");
        }
      } else {
        setValidUser(false);
      }
    };
    if (classDetails) {
      fetchData();
    }
  }, [user, classDetails]);

  useEffect(() => {
    let countdownInterval;
    if (classDetails) {
      const updateCountdown = () => {
        const [startHours, startMinutes] = classDetails.onetime_class_start_time
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = classDetails.onetime_class_end_time
          .split(":")
          .map(Number);
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();

        const totalStartSeconds = startHours * 3600 + startMinutes * 60;
        const totalEndSeconds = endHours * 3600 + endMinutes * 60;
        const currentTotalSeconds =
          currentHours * 3600 + currentMinutes * 60 + currentSeconds;

        if (currentTotalSeconds > totalEndSeconds) {
          setTimeRemaining("Class has ended!");
          clearInterval(countdownInterval);
        } else if (currentTotalSeconds >= totalStartSeconds) {
          setTimeRemaining("Class has started!");
          clearInterval(countdownInterval);
        } else {
          const totalSecondsRemaining = totalStartSeconds - currentTotalSeconds;
          const hours = Math.floor(totalSecondsRemaining / 3600);
          const minutes = Math.floor(
            (totalSecondsRemaining - hours * 3600) / 60
          );
          const seconds = totalSecondsRemaining - hours * 3600 - minutes * 60;
          setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        }
      };

      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 1000);
    }
    return () => clearInterval(countdownInterval); // Cleanup
  }, [classDetails]);

  const handleMarkAttendance = async () => {
    // toast.info(classDetails.status);

    navigate(`/student/class/${class_id}`);
  };

  const handleShare = () => {
    // Copy to clipboard

    navigator.clipboard.writeText(
      `${getFrontendDomain()}/student/class/${class_id}/info`
    );
    toast.info("Link copied to clipboard");
  };

  return (
    <StudentPageWrapper heading="Class Info Student">
      {validUser && (
        <div className="elements">
          {classDetails && (
            <>
              <div className="flex flex-row gap-2">
                <Card
                  sx={{
                    flex: 1,
                  }}
                >
                  <CardContent>
                    <p className="font-medium">Starts In</p>
                    <div className="text-2xl text-center">
                      <DisplayWatchTime
                        endTs={new Date(classHistoryInfo?.start_time)}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card
                  sx={{
                    flex: 1,
                  }}
                >
                  <CardContent>
                    <p className="font-medium">Ends In</p>
                    <div className="text-2xl">
                      <DisplayWatchTime
                        endTs={new Date(classHistoryInfo?.end_time)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card
                sx={{
                  border: "1px solid",
                  borderColor: "primary.main",
                  background: "linear-gradient(#033363, #021F3B)",
                  borderRadius: "1rem",
                  margin: "2rem 0",
                }}
              >
                <CardContent>
                  <div className="class-info-student">
                    {/* info */}
                    <div className="class-info-student-title">
                      <h3 className="text-white">{classDetails.class_name}</h3>
                      <p className="class-info-student-desc text-y-white text-sm max-w-2xl break-all">
                        {classDetails.class_desc}
                      </p>
                    </div>

                    <div className="class-info-student-teacher text-white flex flex-col gap-2 py-1">
                      <div className="flex flex-row gap-2 items-center">
                        <Avatar>{classDetails?.teacher?.name[0]}</Avatar>
                        {classDetails.teacher.name}
                      </div>
                    </div>

                    <div className="class-info-student-info flex flex-col md:flex-row gap-8 text-sm text-white">
                      <div>
                        <p className="font-medium">Start Time</p>
                        <p>
                          {new Date(
                            classDetails.onetime_class_start_time
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">End Time</p>
                        <p>
                          {new Date(
                            classDetails.onetime_class_end_time
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Duration</p>
                        <p>
                          {classDetails?.onetime_class_end_time &&
                          classDetails?.onetime_class_start_time
                            ? (new Date(classDetails.onetime_class_end_time) -
                                new Date(
                                  classDetails.onetime_class_start_time
                                )) /
                              1000 /
                              3600
                            : 0}{" "}
                          hours
                        </p>
                      </div>
                    </div>

                    {/* actions */}
                    <div className="class-info-student-actions flex flex-col gap-4 justify-center">
                      <Button
                        variant="contained"
                        startIcon={<ExitToApp />}
                        sx={{
                          minWidth: "fit-content",
                        }}
                        onClick={handleMarkAttendance}
                        disabled={
                          new Date(classHistoryInfo?.start_time) > now ||
                          new Date(classHistoryInfo?.end_time) < now
                        }
                      >
                        Join Class
                      </Button>
                      <Button
                        sx={{
                          minWidth: "fit-content",
                        }}
                        variant="contained"
                        startIcon={<Share />}
                        disabled={
                          classHistoryInfo?.status !== CLASS_ONGOING &&
                          classHistoryInfo?.status !== CLASS_UPCOMING &&
                          classHistoryInfo?.status !== "CLASS_METADATA_DRAFT"
                        }
                        onClick={handleShare}
                      >
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
      {!validUser && (
        <div className="elements">
          <p>You do not have permissions to join this class!</p>
        </div>
      )}
    </StudentPageWrapper>
  );
}
