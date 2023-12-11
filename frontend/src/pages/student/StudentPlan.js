import React from "react";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";
import { Table, Grid, Button } from "@geist-ui/core";
function StudentPlan() {
  let user = useUserStore((state) => state.user);
  const [allPlans, setAllPlans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/get-all-student-plans"
        );
        const data = await response.json();
        setAllPlans(data["plans"]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const renderAction = (value, rowData, index) => {
    const subscribePlan = async () => {
      console.log("subscribed!");
    };
    return (
      <Grid.Container gap={0.1}>
        <Grid>
          <Button
            type="error"
            auto
            scale={1 / 3}
            font="12px"
            onClick={subscribePlan}
          >
            Subscribe
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      {/* <div>Plans for : {user.name}!</div> */}
      <div className="flex flex-col items-center justify-center py-20">
        <Table width={100} data={allPlans} className="bg-white ">
          <Table.Column prop="id" label="Plan ID" />
          <Table.Column prop="name" label="Plan Name" />
          <Table.Column
            prop="has_playlist_creation"
            label="Make Custom Playlists"
            render={(data) => {
              console.log(data);
              return data ? "Yes" : "No";
            }}
          />
          <Table.Column
            prop="playlist_creation_limit"
            label="Number of Custom Playlists"
            render={(data) => {
              console.log(data);
              return data ? data : "0";
            }}
          />
          <Table.Column
            prop="operation"
            label="Subscribe"
            width={150}
            render={renderAction}
          />
        </Table>
      </div>
    </div>
  );
}

export default StudentPlan;
