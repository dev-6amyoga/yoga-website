import React from "react";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
export default function FreeVideos() {
  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      {/* <div>Plans for : {user.name}!</div> */}
      <div className="flex flex-col items-center justify-center py-20">
        Free Videos!
      </div>
      <div>
        <ToastContainer />
      </div>
    </div>
  );
}
