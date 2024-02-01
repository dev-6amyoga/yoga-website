import { toast } from "react-toastify";
import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { Fetch } from "../../../utils/Fetch";
import { Table, Card, Text, Grid, Button } from "@geist-ui/core";
import { useEffect, useState } from "react";
export default function Students() {
  const [students, setStudents] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [updateRequests, setUpdateRequests] = useState([]);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "http://localhost:4000/update-request/get-all",
          method: "GET",
        });
        const data = response.data;
        setUpdateRequests(data.updateRequests);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const RenderAction = (value, rowData, index) => {
    const handleAccept = async () => {
      Fetch({
        url: "http://localhost:4000/update-request/approve",
        method: "POST",
        data: {
          update_request_id: rowData.update_request_id,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            toast("Email Update Approved", { type: "success" });
          }
        })
        .catch((err) => {
          console.log(err);
          toast("An error occured!");
        });
    };
    const handleReject = async () => {
      Fetch({
        url: "http://localhost:4000/update-request/reject",
        method: "POST",
        data: {
          update_request_id: rowData.update_request_id,
        },
      })
        .then((res) => {
          if (res.status === 200) {
            toast("Email Update Rejected", { type: "success" });
          }
        })
        .catch((err) => {
          console.log(err);
          toast("An error occured!");
        });
    };
    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <>
            {rowData.status === "ACCEPTED" && <div>Hi</div>}
            <Button
              type="success"
              auto
              scale={1 / 3}
              font="12px"
              onClick={handleAccept}
            >
              Approve
            </Button>
            <Button
              type="error"
              auto
              scale={1 / 3}
              font="12px"
              onClick={handleReject}
            >
              Reject
            </Button>
          </>
        </Grid>
      </Grid.Container>
    );
  };
  const filteredUpdateRequests = updateRequests.filter(
    (request) => !request.is_approved
  );

  return (
    <div>
      <AdminNavbar />
      <div className="allAsanas flex flex-col items-center min-h-screen justify-center">
        <div className="elements">
          <Card>
            <Table width="100%" data={studentData} className="bg-white">
              <Table.Column prop="user_id" label="ID" />
              <Table.Column label="Student Name" width={150} prop="name" />
              <Table.Column label="Email ID" width={200} prop="email" />
              <Table.Column label="Phone" width={150} prop="phone" />
            </Table>
          </Card>
        </div>

        <Card>
          <Text h4>Pending Email Update Requests</Text>
          <div className="flex flex-col items-start gap-2 p-6 bg-gray-500 text-white mt-4 mx-4 rounded-md">
            <Card width="100%">
              <Table
                width="100%"
                data={filteredUpdateRequests}
                className="bg-white"
              >
                <Table.Column prop="user_id" label="User ID" />
                <Table.Column label="Student Name" width={150} prop="name" />
                <Table.Column
                  label="Old Email ID"
                  width={200}
                  prop="old_email"
                />
                <Table.Column
                  label="New Email ID"
                  width={200}
                  prop="new_email"
                />
                <Table.Column label="Phone" width={150} prop="phone" />
                <Table.Column
                  prop="operation"
                  label="Approve/Reject"
                  width={150}
                  render={RenderAction}
                />
              </Table>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
