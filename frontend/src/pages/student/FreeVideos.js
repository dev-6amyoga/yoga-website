import React from "react";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";
import { Note } from "@geist-ui/core";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";

export default function FreeVideos() {
  const [planId, setPlanId] = useState(0);
  let user = useUserStore((state) => state.user);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-plan/get-user-plan-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user.user_id }),
          }
        );
        const data = await response.json();
        if (data["userPlan"]) {
          setPlanId(data["userPlan"]["plan_id"]);
        } else {
          console.log(data["error"]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [user.user_id]);

  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      <br />
      <br />
      <div className="px-20">
        {planId === 0 && (
          <Note type="error" label="Note" filled width={100}>
            Please purchase a subscription to unlock all features!.
          </Note>
        )}
      </div>
      {/* <div>Plans for : {user.name}!</div> */}
      <div className="flex flex-col items-center justify-center py-20">
        Free Videos!
      </div>
      {/* <div>
        <ToastContainer />
      </div> */}
    </div>
  );
}
