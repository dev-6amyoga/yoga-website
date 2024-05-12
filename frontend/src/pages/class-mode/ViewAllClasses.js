import { useEffect, useMemo, useState } from "react";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import SortableColumn from "../../components/Common/DataTable/SortableColumn";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import { Fetch } from "../../utils/Fetch";
import { toast } from "react-toastify";
import { Button, Card, Divider, Text } from "@geist-ui/core";
export default function ViewAllClasses() {
  const [allClasses, setAllClasses] = useState(null);
  const [today, setToday] = useState("");
  const [activeClasses, setActiveClasses] = useState([]);
  const [inactiveClasses, setInactiveClasses] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (today && currentTime && allClasses) {
        let tempActiveClasses = [];
        let tempInactiveClasses = [];
        for (var i = 0; i !== allClasses.length; i++) {
          let days = allClasses[i]["days"];
          if (days.includes(today)) {
            tempActiveClasses.push(allClasses[i]);
          } else {
            tempInactiveClasses.push(allClasses[i]);
          }
        }
        setActiveClasses(tempActiveClasses);
        setInactiveClasses(tempInactiveClasses);
      }
    };
    fetchData();
  }, [today, currentTime, allClasses]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/classMode/getAllClasses",
        });
        const data = response.data;
        setAllClasses(data);
        const now = new Date();
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        setToday(days[now.getDay()]);
        setCurrentTime(now.toLocaleTimeString());
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);

  const handleButtonClick = (rowData) => {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let t1 = days[now.getDay()];
    if (rowData.row.original.days.includes(t1)) {
      console.log("is active");
    } else {
      toast("This class is not active yet!");
    }
  };

  useEffect(() => {
    console.log(today, currentTime);
  }, [today, currentTime]);

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
      {
        accessorKey: "actions",
        header: () => <span>Actions</span>,
        cell: (rowData) => (
          <Button auto onClick={() => handleButtonClick(rowData)}>
            View Details
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <AdminPageWrapper heading="View All Classes">
      <div className="elements">
        <Card hoverable>
          <Text h5>Today's Classes</Text>
          <DataTable
            columns={columnsDataTable}
            data={activeClasses || []}
          ></DataTable>
        </Card>
        <Divider />
        <Card hoverable>
          <Text h5>Upcoming Classes</Text>
          <DataTable
            columns={columnsDataTable}
            data={inactiveClasses || []}
          ></DataTable>
        </Card>
      </div>
    </AdminPageWrapper>
  );
}
