import { toast } from "react-toastify";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { Fetch } from "../../../utils/Fetch";
import { Table } from "@geist-ui/core";
import { useEffect, useState } from "react";
export default function Students() {
  const [students, setStudents] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const appendToUsers = (newUserData) => {
    setStudentData((prevUsers) => [...prevUsers, newUserData]);
  };
  useEffect(() => {
    if (students.length > 0) {
      setStudentData([]);
      for (var i = 0; i != students.length; i++) {
        console.log(students[i].user_id);
        Fetch({
          url: "http://localhost:4000/user/get-by-id",
          method: "POST",
          data: {
            user_id: students[i].user_id,
          },
        }).then((res) => {
          if (res && res.status === 200) {
            console.log(res.data);
            appendToUsers(res.data.user);
          } else {
            toast("Error updating profile; retry", {
              type: "error",
            });
          }
        });
      }
    }
  }, [students]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "http://localhost:4000/user/get-all-students",
          method: "GET",
        });
        const data = response.data;
        console.log(data);
        setStudents(data.users);
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
        <Table width={50} data={studentData} className="bg-white">
          <Table.Column prop="user_id" label="ID" />
          <Table.Column label="Student Name" width={150} prop="name" />
          <Table.Column label="Email ID" width={150} prop="email" />
          <Table.Column label="Phone" width={150} prop="phone" />
          {/* <Table.Column label="Address 1" width={150} prop="address1" />
          <Table.Column label="Address 2" width={150} prop="address2" /> */}
        </Table>
      </div>
    </div>
  );
}
