import { useParams } from "react-router-dom";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";

import { Card, Spacer, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { Fetch } from "../../utils/Fetch";
import { toast } from "react-toastify";

export default function ClassModePage() {
  const { class_id } = useParams();
  const [classDetails, setClassDetails] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/classMode/get-class-by-id",
          method: "POST",
          data: JSON.stringify({ class_id: class_id }),
        });
        if (response?.status === 200) {
          const data = await response.data;
          console.log(data.classObj);
          setClassDetails(data.classObj);
        } else {
          console.log("Failed to create new class");
        }
      } catch (error) {
        toast("Error while making the request:", error);
      }
    };
    fetchData();
  }, [class_id]);

  useEffect(() => {
    let countdownInterval;
    if (classDetails) {
      const updateCountdown = () => {
        const [startHours, startMinutes] = classDetails.start_time
          .split(":")
          .map(Number);
        const [endHours, endMinutes] = classDetails.end_time
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

  return (
    <AdminPageWrapper heading="Class Page">
      <div className="elements">
        {classDetails && (
          <Card hoverable>
            <div className="flex flex-col items-center">
              <div className="flex flex-col items-center">
                <Text>Class Name : {classDetails.class_name}</Text>
                <Text>Start Time : {classDetails.start_time}</Text>
                <Text>End Time : {classDetails.end_time}</Text>
              </div>
              <Spacer />
              <Card type="warning" width="50%" hoverable>
                <div className="flex flex-col items-center">
                  <Text h3>Time Remaining</Text>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: "bold",
                      fontFamily: "'Roboto', sans-serif",
                      color: "white", // Text color
                    }}
                  >
                    <span style={{ fontSize: "40px" }}>{timeRemaining}</span>
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        )}
      </div>
    </AdminPageWrapper>
  );
}
