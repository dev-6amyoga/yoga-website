import { Button, Card, Spacer, Text } from "@geist-ui/core";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, BarChart } from "@tremor/react";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { Input, Select } from "@mui/material";

function WatchAnalysis() {
  const [watchTimeCount, setWatchTimeCount] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [uniqueNames, setUniqueNames] = useState([]);

  const columnsDataTable1 = useMemo(
    () => [
      {
        accessorKey: "user_id",
        header: ({ column }) => (
          <SortableColumn column={column}>User ID</SortableColumn>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "totalDuration",
        header: "Net Watch Time (hours)",
      },
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/watch-time/time-statistics",
        });
        const watchTimeData = response.data;
        const enrichedData = await Promise.all(
          watchTimeData.map(async (item) => {
            try {
              const userResponse = await Fetch({
                url: "/user/get-by-id",
                method: "POST",
                data: { user_id: item.user_id },
              });

              if (userResponse.status === 200) {
                return {
                  user_id: item.user_id,
                  name: userResponse.data?.user.name || "Unknown",
                  totalDuration: item.totalWatchTimeInHours,
                };
              } else {
                console.error(
                  `Error fetching user data for ID ${item.user_id}`
                );
                return {
                  user_id: item.user_id,
                  name: "Unknown",
                  totalDuration: item.totalWatchTimeInHours,
                };
              }
            } catch (error) {
              console.error(
                `Error fetching user data for ID ${item.user_id}:`,
                error
              );
              return {
                user_id: item.user_id,
                name: "Unknown",
                totalDuration: item.totalWatchTimeInHours,
              };
            }
          })
        );
        console.log(enrichedData);
        setWatchTimeCount(enrichedData);
        setFilteredData(enrichedData);
      } catch (error) {
        console.error("Error fetching watch time statistics:", error);
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

  const handleSearch = (query) => {
    console.log(query);
    setSearchQuery(query);
    const filtered = watchTimeCount.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleFilterByName = (name) => {
    if (name === "All") {
      setFilteredData(watchTimeCount); // Reset to all data
    } else {
      const filtered = watchTimeCount.filter((item) => item.name === name);
      setFilteredData(filtered);
    }
  };

  return (
    <AdminPageWrapper heading="Watch Analysis">
      <div className="flex items-center mb-4">
        <Input
          clearable
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          width="300px"
          className="mr-4"
        />
      </div>

      <div className="elements">
        <Spacer h={2} />
        {watchTimeCount && watchTimeCount.length > 0 ? (
          <div className="flex justify-center items-center h-full">
            <Card width="100">
              <Text h4 my={10}>
                Watch Time Per User
              </Text>
              <Button onClick={() => handleDownload(filteredData)}>
                Download CSV
              </Button>
              <DataTable
                columns={columnsDataTable1}
                data={filteredData || []}
              ></DataTable>{" "}
            </Card>
          </div>
        ) : (
          <div>No data available</div>
        )}
      </div>

      {/* <div className="elements">
        <Spacer h={2} />


        {filteredData && filteredData.length > 0 ? (
          <div className="flex justify-center items-center h-full">
            <Card width="100">
              <Text h4 my={10}>
                Watch Time Per User
              </Text>
              <Button onClick={() => handleDownload(filteredData)}>
                Download CSV
              </Button>
              <DataTable
                columns={columnsDataTable1}
                data={filteredData || []}
              ></DataTable>
            </Card>
          </div>
        ) : (
          <div>No data available</div>
        )}
      </div> */}
    </AdminPageWrapper>
  );
}

export default withAuth(WatchAnalysis, ROLE_ROOT);
