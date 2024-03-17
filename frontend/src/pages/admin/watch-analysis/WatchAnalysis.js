import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Spacer, Text } from "@geist-ui/core";
import Papa from "papaparse";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import SortableColumn from "../../../components/Common/DataTable/SortableColumn";
import { DataTable } from "../../../components/Common/DataTable/DataTable";

function WatchAnalysis() {
  const [watchTimeCount, setWatchTimeCount] = useState([]);
  const [viewCount, setViewCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [moreColors, setMoreColors] = useState([]);
  const [userAsanaStats, setUserAsanaStats] = useState([]);

  //   const {
  //     isLoading,
  //     data: transactions,
  //     error,
  //     refetch: getTransactions,
  //   } = useQuery({
  //     queryKey: ["transactions"],
  //     queryFn: async () => {
  //       const res = await Fetch({
  //         url: "/transaction/get-all",
  //         method: "GET",
  //         token: true,
  //       });
  //       return res?.data?.transactions;
  //     },
  //   });

  const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 360) / numColors;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  };

  const columnsDataTable = useMemo(
    () => [
      {
        accessorKey: "user_id",
        header: ({ column }) => (
          <SortableColumn column={column}>User ID</SortableColumn>
        ),
      },
      {
        accessorKey: "asana_id",
        header: "Asana ID",
      },
      {
        accessorKey: "totalDuration",
        header: "Net Watch Time",
      },
      {
        accessorKey: "totalCount",
        header: ({ column }) => (
          <SortableColumn column={column}>Net Watch Count</SortableColumn>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({ url: "/watch-time/time-statistics" });
        const data = response.data;
        const reducedData = data.map((item) => ({
          label: item.label,
          duration: item.data.reduce((acc, curr) => acc + curr.duration, 0),
        }));
        let COLORS = generateColors(reducedData.length);
        setColors(COLORS);
        setWatchTimeCount(reducedData);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/watch-history/video-view-counts",
        });
        const data = response.data;
        let COLORS = generateColors(data.length);
        setMoreColors(COLORS);
        console.log(data);
        setViewCount(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/watch-history/combined-data",
        });
        const data = response.data;
        const filteredData = data.filter(
          (entry) =>
            entry.asana_id > 0 &&
            entry.user_id !== null &&
            entry.user_id !== "null" &&
            typeof entry.user_id !== "undefined"
        );

        setUserAsanaStats(filteredData);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
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

  return (
    <AdminPageWrapper heading="Watch Analysis">
      <div className="elements">
        <Spacer h={2} />
        {loading ? (
          <div>Loading...</div>
        ) : watchTimeCount && watchTimeCount.length > 0 ? (
          <div className="flex justify-center items-center h-full">
            <Card width="30">
              <Text h4 my={10}>
                Asana Watch Time
              </Text>
              <Button onClick={() => handleDownload(watchTimeCount)}>
                Download CSV
              </Button>
              <PieChart width={400} height={400}>
                <Pie
                  data={watchTimeCount}
                  dataKey="duration"
                  nameKey="label"
                  cx={200}
                  cy={200}
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {watchTimeCount.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </div>
        ) : (
          <div>No data available</div>
        )}
        <Spacer h={2} />
        {loading ? (
          <div>Loading...</div>
        ) : viewCount && viewCount.length > 0 ? (
          <div className="flex justify-center items-center h-full">
            <Card width="30">
              <Text h4 my={10}>
                Asana View Count
              </Text>
              <Button onClick={() => handleDownload(viewCount)}>
                Download CSV
              </Button>
              <PieChart width={400} height={400}>
                <Pie
                  data={viewCount}
                  dataKey="viewcount"
                  nameKey="label"
                  cx={200}
                  cy={200}
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {viewCount.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={moreColors[index % moreColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </div>
        ) : (
          <div>No data available</div>
        )}
        <Spacer h={2} />
        {userAsanaStats && userAsanaStats.length > 0 ? (
          <div className="max-w-7xl">
            <DataTable
              columns={columnsDataTable}
              data={userAsanaStats || []}
              // refetch={getTransactions}
            ></DataTable>
          </div>
        ) : (
          <div>No data available</div>
        )}
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(WatchAnalysis, ROLE_ROOT);
