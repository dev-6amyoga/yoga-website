import { Button, Card, Spacer, Text } from "@geist-ui/core";
import Papa from "papaparse";
import { useEffect, useMemo, useState } from "react";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { DataTable } from "../../../components/Common/DataTable/DataTable";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { Input } from "@mui/material";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

function WatchAnalysis() {
  const [watchTimeCount, setWatchTimeCount] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const handleRangeChange = (ranges) => {
    setDateRange([ranges.selection]);
    console.log("Selected Range:", ranges.selection);
  };

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
        header: "All time Watch hours (hours)",
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

  const handleFilter = () => {
    console.log("hi");
    console.log("Selected Range:", ranges.selection);
  };

  return (
    <AdminPageWrapper heading="Watch Analysis">
      <div className="flex justify-center items-center mb-4">
        <Card width="100">
          <div className="flex flex-row gap-8 items-center">
            <Input
              clearable
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              width="300px"
              className="mr-4"
            />
            <div>
              <h4>Select Date Range</h4>
              <DateRange
                editableDateInputs={true}
                onChange={handleRangeChange}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
              />
            </div>
            <Button onClick={() => handleFilter()}>Search</Button>
          </div>
        </Card>
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
    </AdminPageWrapper>
  );
}

export default withAuth(WatchAnalysis, ROLE_ROOT);
