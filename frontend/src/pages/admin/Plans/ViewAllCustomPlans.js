import { useEffect, useState } from "react";
import { ROLE_ROOT } from "../../../enums/roles";
import { withAuth } from "../../../utils/withAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
} from "@mui/material";
import { Fetch } from "../../../utils/Fetch";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";

function ViewAllCustomPlans() {
  const [customPlans, setCustomPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/customPlan/getAllCustomPlans",
          method: "GET",
        });
        const data = response.data;
        setCustomPlans(data.custom_plans);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const handleEditClick = (planId) => {
    console.log("Edit plan with ID:", planId);
  };

  return (
    <AdminPageWrapper heading="Plan Management - View Customized Plans">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Plan Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Selected Needs</TableCell>
              <TableCell>Prices</TableCell>
              <TableCell>Playlists</TableCell>
              <TableCell>Validity</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Watch Hours</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customPlans.map((plan) => (
              <TableRow key={plan._id.$oid}>
                <TableCell>{plan.custom_plan_id}</TableCell>
                <TableCell>{plan.plan_name}</TableCell>
                <TableCell>{plan.plan_description}</TableCell>
                <TableCell>{plan.selectedNeeds.join(", ")}</TableCell>
                <TableCell>
                  {plan.prices.map((price, index) => (
                    <div key={index}>
                      {Object.entries(price).map(([key, value]) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {plan.playlists.map((playlist, index) => (
                    <div key={index}>
                      {Object.entries(playlist).map(([playlistId, asanas]) => (
                        <div key={playlistId}>
                          Playlist {playlistId}: {asanas.join(", ")}
                        </div>
                      ))}
                    </div>
                  ))}
                </TableCell>
                <TableCell>{plan.planValidity} days</TableCell>
                <TableCell>{plan.students.join(", ")}</TableCell>
                <TableCell>{plan.watchHours} hours</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleEditClick(plan._id.$oid)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminPageWrapper>
  );
}
export default withAuth(ViewAllCustomPlans, ROLE_ROOT);
