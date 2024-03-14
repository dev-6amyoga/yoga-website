import { Table } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import Papa from "papaparse";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const appendToUsers = (newUserData) => {
    setUsers((prevUsers) => [...prevUsers, newUserData]);
  };
  useEffect(() => {
    setUsers([]);
    if (teachers.length > 0) {
      for (var i = 0; i !== teachers.length; i++) {
        console.log(teachers[i].user_id);
        Fetch({
          url: "/user/get-by-id",
          method: "POST",
          data: {
            user_id: teachers[i].user_id,
          },
        }).then((res) => {
          if (res && res.status === 200) {
            console.log(res.data.user);
            appendToUsers(res.data.user);
          } else {
            toast("Error updating profile; retry", {
              type: "error",
            });
          }
        });
      }
    }
  }, [teachers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-teachers",
          method: "GET",
        });
        const data = response.data;
        console.log("THIS IS DATA : ", data);
        setTeachers(data.users);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);
  const handleDownload = (data1) => {
    const csv = Papa.unparse(data1);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <AdminPageWrapper heading="Member Management - Teachers">
      <Table data={users} className="bg-white">
        <Table.Column prop="user_id" label="ID" />
        <Table.Column label="Teacher Name" prop="name" />
        <Table.Column label="Email ID" prop="email" />
        <Table.Column label="Phone" prop="phone" />
      </Table>
    </AdminPageWrapper>
  );
}

export default withAuth(Teachers, ROLE_ROOT);
