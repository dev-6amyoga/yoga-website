import React, { useEffect, useState } from "react";
import { Button, Spacer } from "@geist-ui/core";
import Papa from "papaparse";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import { ROLE_ROOT } from "../../../enums/roles";
import { Bar } from "react-chartjs-2";

function WatchAnalysis() {
  const [watchTimeCount, setWatchTimeCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({ url: "/watch-time/time-statistics" });
        const data = response.data;
        setWatchTimeCount(data);
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
          <div>Error: {error.message}</div> // Display error message
        ) : watchTimeCount && watchTimeCount.length > 0 ? (
          <Bar
            data={{
              labels: watchTimeCount.map((item) => `Asana ${item.asana_id}`),
              datasets: [
                {
                  label: "Duration",
                  data: watchTimeCount.map((item) => item.duration),
                  backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#8A2BE2",
                    "#00CED1",
                  ],
                },
              ],
            }}
            options={{
              indexAxis: "y",
              scales: {
                x: {
                  beginAtZero: true,
                },
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        ) : (
          <div>No data available</div>
        )}
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(WatchAnalysis, ROLE_ROOT);
