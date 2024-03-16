import React, { useEffect, useState } from "react";
import { Button, Card, Spacer, Text } from "@geist-ui/core";
import Papa from "papaparse";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

function WatchAnalysis() {
  const [watchTimeCount, setWatchTimeCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [colors, setColors] = useState([]);

  const generateColors = (numColors) => {
    const colors = [];
    for (let i = 0; i < numColors; i++) {
      const hue = (i * 360) / numColors;
      colors.push(`hsl(${hue}, 70%, 50%)`);
    }
    return colors;
  };

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
        setError(null); // Reset error state
      } catch (error) {
        console.log(error);
        setError(error); // Set error state
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
        <Button onClick={() => handleDownload(watchTimeCount)}>
          Download CSV
        </Button>
        <Spacer h={2} />
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : watchTimeCount && watchTimeCount.length > 0 ? (
          <div className="flex justify-center items-center h-full">
            <Card width="50">
              <Text h4 my={10}>
                Asana Watch Time
              </Text>
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
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(WatchAnalysis, ROLE_ROOT);
