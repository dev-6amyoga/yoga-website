import { useEffect, useMemo, useState } from "react";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import SortableColumn from "../../components/Common/DataTable/SortableColumn";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import { Fetch } from "../../utils/Fetch";
import { toast } from "react-toastify";

export default function ViewAllClasses() {
  const [allClasses, setAllClasses] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/classMode/getAllClasses",
        });
        const data = response.data;
        setAllClasses(data);
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);
  const columnsDataTable = useMemo(
    () => [
      {
        accessorKey: "class_name",
        header: ({ column }) => (
          <SortableColumn column={column}>Class Name</SortableColumn>
        ),
      },
      {
        accessorKey: "class_desc",
        header: ({ column }) => (
          <SortableColumn column={column}>Description</SortableColumn>
        ),
      },
      {
        accessorKey: "start_time",
        header: ({ column }) => (
          <SortableColumn column={column}>Start Time</SortableColumn>
        ),
      },
      {
        accessorKey: "end_time",
        header: ({ column }) => (
          <SortableColumn column={column}>End Time</SortableColumn>
        ),
      },
      {
        accessorKey: "days",
        header: () => <SortableColumn column="days">Days</SortableColumn>,
        render: (value, rowData) => (
          <div className="flex flex-row flex-wrap gap-2 p-2">
            {value &&
              value.map((day, index) => {
                return (
                  <div>
                    <span>{day}</span>
                  </div>
                );
              })}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminPageWrapper heading="View All Classes">
      <div className="elements">
        <DataTable
          columns={columnsDataTable}
          data={allClasses || []}
          // refetch={getTransactions}
        ></DataTable>
      </div>
    </AdminPageWrapper>
  );
}
