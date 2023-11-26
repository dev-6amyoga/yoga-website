import React from "react";
import "./admin_home.css";
import { useNavigate } from "react-router-dom";
import { Button } from "@geist-ui/core";
import Navbar_Admin from "../../components/Common/Admin Navbar/Admin_Navbar";
import AllAsanas from "../../components/content-management/all_asanas";
export default function Admin_home() {
  // const navigate = useNavigate();
  return (
    <div className="admin_home">
      <Navbar_Admin />
      <div></div>
    </div>
  );
}
