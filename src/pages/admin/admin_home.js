import React from "react";
import "./admin_home.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@geist-ui/core";
export default function Admin_home() {
  const navigate = useNavigate();
  const handleRegisterNewButtonClick = () => {
    navigate("/content/video/create");
  };
  const viewAllAsanasButtonClick = () => {
    console.log("hi");
  };
  return (
    <div className="admin_home">
      <h1>THIS IS THE ADMIN LOGIN</h1>
      <div>
        <Button onClick={handleRegisterNewButtonClick}>
          Register New Asana
        </Button>
        <Button onClick={viewAllAsanasButtonClick}>View All Asanas</Button>
      </div>
    </div>
  );
}
