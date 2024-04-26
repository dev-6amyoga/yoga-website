import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { useMemo } from "react";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
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
                console.log("from view sched : ", asanaId);
              })}
          </div>
        ),

        // render: (value, rowData) => (
        //   <div className="flex flex-row flex-wrap gap-2 p-2">
        //     {value.map((asanaId, index) => {
        //       console.log("from view sched : ", asanaId);
        //       // const asana = allAsanas.find((asana) => asana.id === asanaId);
        //       // console.log(asana, "from view sched : ");
        //       // return (
        //       //   <div key={index}>
        //       //     {asana && (
        //       //       <div className="flex flex-col align-center">
        //       //         <div className="w-24 h-12 bg-gray-200 rounded-lg overflow-hidden transition-transform hover:scale-110">
        //       //           <div className="flex items-center justify-center h-full">
        //       //             <span>{asana.asana_name}</span>
        //       //           </div>
        //       //         </div>
        //       //       </div>
        //       //     )}
        //       //   </div>
        //       // );
        //     })}
        //   </div>
        // ),
      },
    ],
    []
  );

  const [allSchedules, setAllSchedules] = useState([]);
  const [allAsanas, setAllAsanas] = useState([]);
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
        toast(error);
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
        toast(error);
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
