import React from "react";
import "./admin_home.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@geist-ui/core";
export default function Admin_home() {
  const navigate = useNavigate();
  const handleButtonClick = () => {
    navigate("/content/video/create");
  };
  return (
    <div className="admin_home">
      <h1>THIS IS THE ADMIN LOGIN</h1>
      <div>
        <Button onClick={handleButtonClick}>Register New Asana</Button>
      </div>
    </div>
  );
}
