import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import { useMemo } from "react";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import { Fetch } from "../../../utils/Fetch";
function LoginHistory() {
  const [loginHistories, setLoginHistories] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userIdNameMap, setUserIdNameMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Fetch({
          url: "/user/get-all-users",
        });
        const data = response.data.users;
        setAllUsers(data);
        const userIdNameMap = data.reduce((map, user) => {
          map[user.user_id] = user.name;
          return map;
        }, {});

        setUserIdNameMap(userIdNameMap);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchLoginHistories = async () => {
      try {
        const response = await Fetch({
          url: "/auth/get-login-history",
        });
        const data = response.data;
        const transformedData = data.map((history) => ({
          ...history,
          user_name: userIdNameMap[history.user_id] || "Unknown User",
        }));

        setLoginHistories(transformedData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLoginHistories();
  }, [userIdNameMap]);

  const columnsDataTable = useMemo(
    () => [
      //   {
      //     accessorKey: "login_history_id",
      //     header: ({ column }) => (
      //       <SortableColumn column={column}>ID</SortableColumn>
      //     ),
      //   },
      {
        accessorKey: "user_id",
        header: ({ column }) => (
          <SortableColumn column={column}>User ID</SortableColumn>
        ),
      },
      {
        accessorKey: "user_name",
        header: ({ column }) => (
          <SortableColumn column={column}>User Name</SortableColumn>
        ),
      },
      {
        accessorKey: "created",
        header: ({ column }) => (
          <SortableColumn column={column}>Date and Time</SortableColumn>
        ),
      },
    ],
    []
  );

  return (
    <AdminPageWrapper heading="Member Management - Login History">
      {/* <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User ID</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>User Agent</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>OS</TableCell>
              <TableCell>Browser</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loginHistories.map((history) => (
              <TableRow key={history.id}>
                <TableCell>{history.user_id}</TableCell>
                <TableCell>{history.ip}</TableCell>
                <TableCell>{history.user_agent}</TableCell>
                <TableCell>{history.platform}</TableCell>
                <TableCell>{history.os}</TableCell>
                <TableCell>{history.browser}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> */}
      <Paper>
        <DataTable
          columns={columnsDataTable}
          data={loginHistories || []}
        ></DataTable>
      </Paper>
    </AdminPageWrapper>
  );
}

export default withAuth(LoginHistory, ROLE_ROOT);
