import { toast } from "react-toastify";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { Fetch } from "../../../utils/Fetch";
import { Table } from "@geist-ui/core";
import { useEffect, useState } from "react";
export default function Institutes() {
  const [institutes, setInstitutes] = useState([]);
  const [instituteData, setInstituteData] = useState([]);
  const appendToUsers = (newUserData) => {
    setInstituteData((prevUsers) => [...prevUsers, newUserData]);
  };

  useEffect(() => {
    if (institutes.length > 0) {
      setInstituteData([]);
      for (var i = 0; i != institutes.length; i++) {
        console.log(institutes[i].institute_id);
        Fetch({
          url: "http://localhost:4000/institute/get-by-instituteid",
          method: "POST",
          data: {
            institute_id: institutes[i].institute_id,
          },
        }).then((res) => {
          if (res && res.status === 200) {
            console.log(res.data);
            appendToUsers(res.data);
          } else {
            toast("Error updating profile; retry", {
              type: "error",
            });
          }
        });
      }
    }
  }, [institutes]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "http://localhost:4000/user/get-all-institutes",
          method: "GET",
        });
        const data = response.data;
        console.log(data);
        setInstitutes(data.users);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="allAsanas min-h-screen">
      <AdminNavbar />
      <div className="elements">
        <Table width={50} data={instituteData} className="bg-white">
          <Table.Column prop="institute_id" label="ID" />
          <Table.Column label="Institute Name" width={150} prop="name" />
          <Table.Column label="Email ID" width={150} prop="email" />
          <Table.Column label="Phone" width={150} prop="phone" />
          <Table.Column label="Address 1" width={150} prop="address1" />
          <Table.Column label="Address 2" width={150} prop="address2" />
        </Table>
      </div>
    </div>
  );
}
