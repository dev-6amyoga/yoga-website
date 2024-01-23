import { useEffect } from "react";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { Fetch } from "../../../utils/Fetch";

export default function Students() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "http://localhost:4000/user/get-all-teachers",
          method: "GET",
        });
        const data = response.data;
        console.log(data);
      } catch (err) {
        console.log(err);
      }
    };
  }, []);
  return (
    <div className="allAsanas min-h-screen">
      <AdminNavbar />
      <div className="elements">Students</div>
    </div>
  );
}
