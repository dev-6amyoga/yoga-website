// /user-plan/get-all-user-plans

import React, { useEffect, useState } from "react";
import { Paper } from "@mui/material";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import { useMemo } from "react";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import { Fetch } from "../../../utils/Fetch";
function UserPlanPage() {
  const [userPlans, setUserPlans] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userIdNameMap, setUserIdNameMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-all-user-plans",
        });
        const data = response.data;
        console.log(data);
        setUserPlans(data.userplans);
        // const userIdNameMap = data.reduce((map, user) => {
        //   map[user.user_id] = user.name;
        //   return map;
        // }, {});
        // setUserIdNameMap(userIdNameMap);
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, []);

  //   useEffect(() => {
  //     const fetchLoginHistories = async () => {
  //       try {
  //         const response = await Fetch({
  //           url: "/auth/get-login-history",
  //         });
  //         const data = response.data;
  //         const transformedData = data.map((history) => ({
  //           ...history,
  //           user_name: userIdNameMap[history.user_id] || "Unknown User",
  //         }));

  //         setLoginHistories(transformedData);
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     };
  //     fetchLoginHistories();
  //   }, [userIdNameMap]);

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
        accessorKey: "plan_id",
        header: ({ column }) => (
          <SortableColumn column={column}>Plan ID</SortableColumn>
        ),
      },
      {
        accessorKey: "validity_from",
        header: ({ column }) => (
          <SortableColumn column={column}>Start Date</SortableColumn>
        ),
      },
      {
        accessorKey: "validity_to",
        header: ({ column }) => (
          <SortableColumn column={column}>End Date</SortableColumn>
        ),
      },
    ],
    []
  );

  return (
    <AdminPageWrapper heading="Member Management - Login History">
      <Paper>
        <DataTable
          columns={columnsDataTable}
          data={userPlans || []}
        ></DataTable>
      </Paper>
    </AdminPageWrapper>
  );
}

export default withAuth(UserPlanPage, ROLE_ROOT);
