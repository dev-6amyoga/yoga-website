import {
  Button,
  Grid,
  Input,
  Modal,
  Select,
  Table,
  Text,
} from "@geist-ui/core";
import { useEffect, useState } from "react";
import AdminNavbar from "../../Common/AdminNavbar/AdminNavbar";
import "./AllPlaylists.css";

export default function AllPlaylists() {
  const [asanas, setAsanas] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/content/playlists/getAllPlaylists"
        );
        const data = await response.json();
        setAsanas(data);
        console.log(data);
        console.log(asanas);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, []);
}
