import React from "react";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
import useUserStore from "../../store/UserStore";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import {
  Table,
  Grid,
  Button,
  Card,
  Divider,
  ButtonGroup,
  Input,
} from "@geist-ui/core";
function StudentPlan() {
  const notify = (x) => toast(x);
  const navigate = useNavigate();
  let user = useUserStore((state) => state.user);
  const [allPlans, setAllPlans] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState({});
  const today = new Date();
  const formattedDate = today.toLocaleDateString();
  const [selectedValidity, setSelectedValidity] = useState(30);

  const calculateEndDate = (validityDays) => {
    const endDate = new Date();
    endDate.setDate(today.getDate() + validityDays);
    return endDate.toLocaleDateString("en-GB");
  };
  const handleValidityChange = (validity) => {
    setSelectedValidity(validity);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/plan/get-all-student-plans"
        );
        const data = await response.json();
        setAllPlans(data["plans"]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const discount_code = document.querySelector("#discount_code").value;
    const referral_code = document.querySelector("#referral_code").value;
    const userPlanData = {
      purchase_date: formattedDate,
      validity_from: formattedDate,
      validity_to: calculateEndDate(selectedValidity),
      cancellation_date: null,
      auto_renewal_enabled: false,
      user_id: user.user_id,
      plan_id: cardData.plan_id,
      discount_code: discount_code,
      referral_code: referral_code,
    };
    console.log(userPlanData);
    try {
      const response = await fetch(
        "http://localhost:4000/user-plan/register-user-plan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPlanData),
        }
      );
      if (response.ok) {
        notify("New User-Plan added successfully");
        setTimeout(() => {
          navigate("/student");
        }, 2000);
      } else {
        const errorData = await response.json();
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderAction = (value, rowData, index) => {
    const subscribePlan = async () => {
      setShowCard(true);
      setCardData(rowData);
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
          <Table.Column prop="plan_id" label="Plan ID" />
          <Table.Column prop="name" label="Plan Name" />
          <Table.Column
            prop="has_playlist_creation"
            label="Make Custom Playlists"
            render={(data) => {
              return data ? "Yes" : "No";
            }}
          />
          <Table.Column
            prop="playlist_creation_limit"
            label="Number of Custom Playlists"
            render={(data) => {
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
        <Divider />
        {showCard && (
          <Card>
            <h4>{cardData.name}</h4>
            <Divider />
            <h5>Features:</h5>
            <br />
            <h6>
              {cardData.has_basic_playlist
                ? ". Use all yoga playlists curated by 6AM Yoga"
                : ""}{" "}
            </h6>
            <h6>
              {cardData.has_playlist_creation &&
              cardData.playlist_creation_limit
                ? cardData.playlist_creation_limit === 1000000
                  ? ". Create UNLIMITED yoga playlists of your own, using our asana videos"
                  : ". Create " +
                    cardData.playlist_creation_limit +
                    " yoga playlists of your own, using our asana videos"
                : ""}{" "}
            </h6>
            <Divider />
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full"
            >
              <h5>Validity : </h5>
              {/* later fetch from db */}
              <ButtonGroup type="warning" ghost>
                <Button
                  value={30}
                  onClick={() => handleValidityChange(30)}
                  className={selectedValidity === 30 ? "active" : ""}
                >
                  30 days
                </Button>
                <Button
                  value={60}
                  onClick={() => handleValidityChange(60)}
                  className={selectedValidity === 60 ? "active" : ""}
                >
                  60 days
                </Button>
                <Button
                  value={90}
                  onClick={() => handleValidityChange(90)}
                  className={selectedValidity === 90 ? "active" : ""}
                >
                  90 days
                </Button>
                <Button
                  value={180}
                  onClick={() => handleValidityChange(180)}
                  className={selectedValidity === 180 ? "active" : ""}
                >
                  180 days
                </Button>
                <Button
                  value={365}
                  onClick={() => handleValidityChange(365)}
                  className={selectedValidity === 365 ? "active" : ""}
                >
                  365 days
                </Button>
              </ButtonGroup>
              <Divider />
              <p> Plan Start Date : {formattedDate}</p>
              <p> Plan End Date: {calculateEndDate(selectedValidity)}</p>
              <Divider />
              <Input width="100%" id="discount_code">
                Discount Code
              </Input>
              <Input width="100%" id="referral_code">
                Referral Code
              </Input>
              <Button htmlType="submit">Purchase</Button>
            </form>
          </Card>
        )}
      </div>
      <div>
        <ToastContainer />
      </div>
    </div>
  );
}

export default StudentPlan;

// auto_renewal_enabled
// created
// updated
