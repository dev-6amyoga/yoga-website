import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import { useEffect } from "react";

export const AssignPlans = async (
  instituteId,
  planId,
  ownerId,
  toBeRegistered
) => {
  const fetchData = async () => {
    if (instituteId > 0) {
      try {
        const response = await Fetch({
          url: "http://localhost:4000/institute/teacher/get-all-by-instituteid",
          method: "POST",
          data: {
            institute_id: instituteId,
          },
        });
        let teacherIds = response?.data?.teachers.map(
          (item) => item["user_id"]
        );
        const response1 = await Fetch({
          url: "http://localhost:4000/user-plan/register",
          method: "POST",
          data: toBeRegistered,
        });
        if (response1.status === 200) {
          toast("Plan subscribed successfully for Institute", {
            type: "success",
          });
          try {
            for (let teacherId of teacherIds) {
              const updatedToBeRegistered = {
                ...toBeRegistered,
                user_id: teacherId,
                user_type: "TEACHER",
              };
              const response = await Fetch({
                url: "http://localhost:4000/user-plan/register",
                method: "POST",
                data: updatedToBeRegistered,
              });
              if (response.status === 200) {
                toast(
                  "Plan subscribed successfully for teacher ID: " + teacherId,
                  {
                    type: "success",
                  }
                );
              } else {
                toast("Failed to subscribe plan for teacher ID: " + teacherId, {
                  type: "error",
                });
              }
            }
          } catch (error) {
            console.log(error);
          }
        } else {
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  fetchData();
};
