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
  const [userDetails, setUserDetails] = useState([]);
  const [userIdNameMap, setUserIdNameMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-all-user-plans",
        });
        const data = response.data;
        setUserPlans(data.userplans);
        const userDetailsPromises = data.userplans.map((userPlan) =>
          Fetch({
            url: "/user/get-by-id",
            method: "POST",
            data: { user_id: userPlan.user_id },
          }).then((response) => response.data)
        );
        const userDetailsArray = await Promise.all(userDetailsPromises);
        setUserDetails(userDetailsArray);
        const userIdNameMapping = {};
        userDetailsArray.forEach((user) => {
          userIdNameMapping[user.user.user_id] = user.user.name;
        });
        setUserIdNameMap(userIdNameMapping);
      } catch (error) {
        console.error("Error fetching user plans or details:", error);
      }
    };

    fetchUsers();
  }, []);

  const columnsDataTable = useMemo(
    () => [
      {
        accessorKey: "user_id",
        header: ({ column }) => (
          <SortableColumn column={column}>User Name</SortableColumn>
        ),
        cell: ({ row }) => {
          const userId = row.original.user_id;
          return userIdNameMap[userId] || "Loading...";
        },
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
    [userIdNameMap]
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
