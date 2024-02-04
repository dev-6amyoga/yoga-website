import {
  Button,
  Card,
  Divider,
  Grid,
  Input,
  Modal,
  Table,
  Select,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
export default function ViewAllSchedules() {
  return (
    <div className="video_form min-h-screen">
      <AdminNavbar />
      <div className="flex justify-center my-10 gap-8">View All Schedules</div>
    </div>
  );
}
