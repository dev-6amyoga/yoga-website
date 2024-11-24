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

function WatchAnalysis() {
  const [watchTimeCount, setWatchTimeCount] = useState([]);
  const [viewCount, setViewCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [moreColors, setMoreColors] = useState([]);
  const [userAsanaStats, setUserAsanaStats] = useState([]);

  const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 360) / numColors;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
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
        header: "Net Watch Time (hours)",
      },
    ],
    []
  );

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
        // Fetch watch time data
        const response = await Fetch({
          url: "/watch-time/time-statistics",
        });
        const watchTimeData = response.data;

        console.log(watchTimeData, "IS user watch hour DATA!!");

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
      } catch (error) {
        console.error("Error fetching watch time statistics:", error);
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

  // current-month-usage
  const { data: currentMonthUsage } = useQuery({
    queryKey: ["currentMonthUsage"],
    queryFn: async () => {
      const res = await Fetch({
        url: "/watch-time/admin-stats/current-month-usage",
        method: "GET",
        token: true,
      });

      return res?.data?.currentMonthUsage;
    },
  });

  // per-month-usage

  const { data: perMonthUsage } = useQuery({
    queryKey: ["perMonthUsage"],
    queryFn: async () => {
      const res = await Fetch({
        url: "/watch-time/admin-stats/per-month-usage",
        method: "GET",
        token: true,
      });

      return res?.data?.watchTimePerMonth;
    },
  });

  // unused-hours
  const { data: unusedHours } = useQuery({
    queryKey: ["unusedHours"],
    queryFn: async () => {
      const res = await Fetch({
        url: "/watch-time/admin-stats/unused-hours",
        method: "GET",
        token: true,
      });

      return res?.data;
    },
  });

  const { data: usersPerPlan } = useQuery({
    queryKey: ["usersPerPlan"],
    queryFn: async () => {
      const res = await Fetch({
        url: "/user-plan/admin-stats/users-per-plan",
        method: "GET",
        token: true,
      });

      return res?.data?.usersPerPlan;
    },
  });

  const { data: usersPerCustomPlan } = useQuery({
    queryKey: ["usersPerCustomPlan"],
    queryFn: async () => {
      const res = await Fetch({
        url: "/customUserPlan/admin-stats/users-per-plan",
        method: "GET",
        token: true,
      });

      return res?.data?.usersPerPlan;
    },
  });

  const { data: revenuePerMonth } = useQuery({
    queryKey: ["revenuePerMonth"],
    queryFn: async () => {
      const res = await Fetch({
        url: "/transaction/admin-stats/revenue-per-month",
        method: "GET",
        token: true,
      });

      return res?.data?.revenuePerMonth;
    },
  });

  const { data: currentMonthRevenue } = useQuery({
    queryKey: ["currentMonthRevenue"],
    queryFn: async () => {
      const res = await Fetch({
        url: "/transaction/admin-stats/current-month-revenue",
        method: "GET",
        token: true,
      });

      return res?.data?.currentMonthRevenue;
    },
  });

  const watchTimePerMonthValueFormatter = (val) =>
    `${(val / 60).toFixed(2)} minutes`;

  const revenuePerMonthValueFormatter = (val) =>
    `${(parseFloat(val) / 100).toFixed(2)}`;

  return (
    <AdminPageWrapper heading="Watch Analysis">
      <div className="elements">
        <Spacer h={2} />
        {loading ? (
          <div>Loading...</div>
        ) : watchTimeCount && watchTimeCount.length > 0 ? (
          <div className="flex justify-center items-center h-full">
            <Card width="100">
              <Text h4 my={10}>
                Watch Time Per User
              </Text>
              <Button onClick={() => handleDownload(watchTimeCount)}>
                Download CSV
              </Button>
              {/* <PieChart width={400} height={400}>
                <Pie
                  data={watchTimeCount}
                  dataKey="totalWatchTimeInHours"
                  nameKey="user_id"
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
              </PieChart> */}
              <DataTable
                columns={columnsDataTable1}
                data={watchTimeCount || []}
                // refetch={getTransactions}
              ></DataTable>{" "}
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

      <div className="grid gap-8">
        <div className="flex flex-row flex-wrap gap-4">
          <Card>
            <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
              Current Month Usage
            </dt>
            <dd className="mt-2 flex items-baseline space-x-2.5">
              <span className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {((currentMonthUsage?.watch_time || 0) / 3600).toFixed(2)} hours
              </span>
            </dd>
          </Card>
          <Card>
            <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
              Current Month Revenue
            </dt>
            <dd className="mt-2 flex items-baseline space-x-2.5">
              {currentMonthRevenue?.map((revenue) => {
                return (
                  <span
                    key={`revenue-${revenue?.currency?.short_tag}`}
                    className="text-tremor-metric font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong"
                  >
                    {revenue?.currency?.short_tag}{" "}
                    {(parseFloat(revenue?.revenue) / 100).toFixed(2)}
                  </span>
                );
              })}
            </dd>
          </Card>
        </div>

        <Card>
          <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
            Per Month Usage
          </dt>
          <dd className="mt-2 flex items-baseline space-x-2.5">
            <AreaChart
              data={perMonthUsage}
              index="_id"
              categories={["Watch Time per Month"]}
              allowDecimals={true}
              colors={["blue"]}
              valueFormatter={watchTimePerMonthValueFormatter}
              showLegend={true}
              showYAxis={true}
              showGradient={true}
              startEndOnly={true}
              className="mt-6 h-64"
              yAxisWidth={125}
            />
          </dd>
        </Card>

        <Card>
          <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
            Users per User Plan
          </dt>
          <dd className="mt-2 flex items-baseline space-x-2.5">
            <BarChart
              data={usersPerPlan}
              index="plan.name"
              categories={["Users per Plan"]}
              yAxisLabel="Users"
              xAxisLabel="User Plan"
            />
          </dd>
        </Card>

        <Card>
          <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
            Users per Custom User Plan
          </dt>
          <dd className="mt-2 flex items-baseline space-x-2.5">
            <BarChart
              data={usersPerCustomPlan}
              index="plan_name"
              categories={["Users per Plan"]}
              yAxisLabel="Users"
              xAxisLabel="User Plan"
            />
          </dd>
        </Card>

        <Card>
          <dt className="text-tremor-default font-medium text-tremor-content dark:text-dark-tremor-content">
            Revenue per month
          </dt>
          <dd className="mt-2 flex items-baseline space-x-2.5">
            <AreaChart
              data={revenuePerMonth}
              index="month"
              categories={["INR", "USD", "EUR"]}
              allowDecimals={true}
              valueFormatter={revenuePerMonthValueFormatter}
              showLegend={true}
              showYAxis={true}
              showGradient={true}
              startEndOnly={true}
              className="mt-6"
              yAxisWidth={125}
            />
          </dd>
        </Card>
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(WatchAnalysis, ROLE_ROOT);
