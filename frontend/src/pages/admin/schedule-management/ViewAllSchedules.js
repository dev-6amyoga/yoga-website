import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { useMemo } from "react";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import { Button } from "@geist-ui/core";
function ViewAllSchedules() {
  const columnsDataTable = useMemo(
    () => [
      {
        accessorKey: "schedule_name",
        header: ({ column }) => (
          <SortableColumn column={column}>Schedule Name</SortableColumn>
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

      {
        accessorKey: "asana_ids",
        header: () => (
          <SortableColumn column="asana_ids">Asana Names</SortableColumn>
        ),
        render: (value, rowData) => (
          <div className="flex flex-row flex-wrap gap-2 p-2">
            {value &&
              value.map((asanaId, index) => {
                const asanaName = asanaNameMap[asanaId];
                return (
                  <span key={asanaId}>
                    {asanaName ? asanaName : "Unknown Asana"}
                  </span>
                );
              })}
          </div>
        ),
      },

      {
        accessorKey: "actions",
        header: () => <span>Actions</span>,
        cell: (rowData) => (
          <div className="flex flex-row items-center">
            <Button auto>Delete</Button>
            <Button auto>Update</Button>
          </div>
        ),
      },
    ],
    []
  );

  const [allSchedules, setAllSchedules] = useState([]);
  const [allAsanas, setAllAsanas] = useState([]);
  const asanaNameMap = useMemo(() => {
    return allAsanas.reduce((map, asana) => {
      map[asana.id] = asana.asana_name;
      return map;
    }, {});
  }, [allAsanas]);
  useEffect(() => {
    console.log("map : ", asanaNameMap);
  }, [asanaNameMap]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/content/video/getAllAsanas",
        });
        const data = response?.data;
        console.log("all asanas : ", data);
        setAllAsanas(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/schedule/getAllSchedules",
        });
        const data = response.data;
        console.log("all schedules : ", data);
        setAllSchedules(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminPageWrapper heading="Schedule Management - View All">
      <div className="max-w-7xl">
        <DataTable
          columns={columnsDataTable}
          data={allSchedules || []}
          // refetch={getTransactions}
        ></DataTable>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(ViewAllSchedules, ROLE_ROOT);
