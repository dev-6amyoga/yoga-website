import {
  Button,
  Grid,
  Input,
  Modal,
  Select,
  Spacer,
  Table,
  Text,
} from "@geist-ui/core";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function WatchAnalysis() {
  const [watchCount, setWatchCount] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/watch-history/video-view-counts",
        });
        const data = response.data;
        setWatchCount(data);
      } catch (error) {
        console.log(error);
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
        <Button
        //   onClick={() => {
        //     handleDownload(sortedPlans);
        //   }}
        >
          Download CSV
        </Button>
        <Spacer h={2} />
        {/* <Table data={}>
          <Table.Column prop="plan_id" label="Plan ID" />
          <Table.Column prop="name" label="Plan Name" />
          <Table.Column
            prop="has_basic_playlist"
            label="Can use 6AM Playlist"
          />
          <Table.Column
            prop="has_playlist_creation"
            label="Can make own playlist"
          />
          <Table.Column
            prop="playlist_creation_limit"
            label="Playlist creation Limit"
          />
          <Table.Column prop="has_self_audio_upload" label="Self Audio" />
          <Table.Column prop="number_of_teachers" label="Number of teachers" />
          <Table.Column prop="plan_validity" label="Plan Validity" />
          <Table.Column prop="plan_user_type" label="Plan user type" />
          <Table.Column
            prop="operation"
            label="ACTIONS"
            width={150}
            render={renderAction}
          />
        </Table> */}
      </div>
    </AdminPageWrapper>
  );
}

export default withAuth(WatchAnalysis, ROLE_ROOT);
