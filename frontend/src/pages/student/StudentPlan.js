import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  Grid,
  Input,
  Table,
  Select,
  Note,
} from "@geist-ui/core";
import React, { useCallback, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import RenderRazorpay from "./RenderRazorpay";

function StudentPlan() {
  const notify = (x) => toast(x);
  let user = useUserStore((state) => state.user);
  const [allPlans, setAllPlans] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState({});
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null,
    currency: null,
    amount: null,
  });

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const [selectedValidity, setSelectedValidity] = useState(30);
  const [selectedCurrency, setSelectedCurrency] = useState(1);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [planId, setPlanId] = useState(0);

  const calculateEndDate = (validityDays) => {
    const endDate = new Date(today);
    endDate.setUTCDate(today.getUTCDate() + validityDays);
    return endDate.toISOString().split("T")[0];
  };
  const handleValidityChange = (validity) => {
    setSelectedValidity(validity);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-plan/get-user-plan-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user?.user_id }),
          }
        );
        const data = await response.json();
        if (data["userPlan"]) {
          console.log(data["userPlan"]);
          console.log(data["userPlan"]["plan_id"]);
          setPlanId(data["userPlan"]["plan_id"]);
        } else {
          notify("You don't have a plan yet! Purchase one to continue");
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/plan/get-all-student-plan"
      );
      const data = await response.json();
      console.log("DATA IS : ", data);
      setAllPlans(data?.plans);
    } catch (error) {
      notify("Error fetching plans", { type: "error" });
      console.log(error);
    }
  }, []);

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "http://localhost:4000/currency/get-all",
      });

      setAllCurrencies(response?.data?.currencies);
      console.log("Fetching currencies");
    } catch (error) {
      notify("Error fetching plans", { type: "error" });
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (planId != 0) {
      notify("You have an active plan! You can't purchase a new plan.");
      return;
    }
    const discount_coupon_id = document.querySelector(
      "#discount_coupon_id"
    ).value;
    const referral_code_id = document.querySelector("#referral_code_id").value;
    const userPlanData = {
      purchase_date: formattedDate,
      validity_from: formattedDate,
      validity_to: calculateEndDate(selectedValidity),
      cancellation_date: null,
      auto_renewal_enabled: false,
      user_id: user?.user_id,
      plan_id: cardData.plan_id,
      discount_coupon_id: discount_coupon_id,
      referral_code_id: referral_code_id,
      amount: cardData.pricing[0].denomination * 118,
      currency: "INR",
    };
    try {
      const response = await Fetch({
        url: "http://localhost:4000/payment/order",
        method: "POST",
        data: userPlanData,
      });
      if (response.status === 200) {
        const responseJson = response.data;
        const razorpayOrder = responseJson.order;
        if (razorpayOrder && razorpayOrder["id"]) {
          setOrderDetails({
            orderId: razorpayOrder["id"],
            currency: razorpayOrder["currency"],
            amount: razorpayOrder["amount"],
          });
          setDisplayRazorpay(true);
        }
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
            Purchase
          </Button>
        </Grid>
      </Grid.Container>
    );
  };

  const registerUserPlan = async () => {
    const discount_coupon_id = document.querySelector(
      "#discount_coupon_id"
    ).value;
    const referral_code_id = document.querySelector("#referral_code_id").value;
    const userPlanData = {
      purchase_date: formattedDate,
      validity_from: formattedDate,
      validity_to: calculateEndDate(selectedValidity),
      cancellation_date: null,
      auto_renewal_enabled: false,
      user_id: user?.user_id,
      plan_id: cardData.plan_id,
      discount_coupon_id: 0,
      referral_code_id: 0,
      amount: 100,
      currency: "INR",
    };
    try {
      const response = await fetch("http://localhost:4000/user-plan/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userPlanData),
      });
      if (response.ok) {
        notify("Plan subscribed successfully", { type: "success" });
      } else {
        const errorData = await response.json();
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
      notify("Error subscribing plan", { type: "error" });
    }
  };

  return (
    <StudentPageWrapper heading="Plans">
      <div>
        {planId === 0 && (
          <Note type="error" label="Note" filled width={70}>
            Please purchase a subscription to unlock all features!.
          </Note>
        )}
      </div>
      <div>
        {planId != 0 && (
          <Note type="warning" label="Note" filled width={70}>
            You have an already active plan!
          </Note>
        )}
      </div>
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
            prop="pricing"
            label="Price"
            render={(data) => {
              return data
                ? data[0].currency.short_tag +
                    " " +
                    data[0].denomination +
                    " + 18% GST"
                : 0;
            }}
          />
          <Table.Column
            prop="operation"
            label="Purchase"
            width={150}
            render={renderAction}
          />
        </Table>
        <Divider />
        {showCard && (
          <Card>
            <h3>{cardData.name}</h3>
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
              <h5>
                Price :{" "}
                {cardData.pricing[0].currency.short_tag +
                  " " +
                  cardData.pricing[0].denomination}{" "}
                + 18% GST
              </h5>
              <Divider />
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
              <p>
                {" "}
                <h5>Plan Start Date :</h5> {formattedDate}
              </p>
              <p>
                {" "}
                <h5>Plan End Date:</h5> {calculateEndDate(selectedValidity)}
              </p>
              <Divider />
              <Input width="100%" id="discount_coupon_id">
                <h5>Discount Coupon</h5>
              </Input>
              <Input width="100%" id="referral_code_id">
                <h5>Referral Code</h5>
              </Input>
              <Button htmlType="submit">Purchase</Button>
            </form>
          </Card>
        )}
      </div>
      <RenderRazorpay
        userId={user?.user_id}
        keyId={process.env.REACT_APP_RAZORPAY_KEY_ID}
        keySecret={process.env.REACT_APP_RAZORPAY_KEY_SECRET}
        orderId={orderDetails.orderId}
        currency={orderDetails.currency}
        amount={orderDetails.amount}
        payment_for={"user_plan"}
        redirectUrl={"/student"}
        onSuccessCallback={registerUserPlan}
        displayRazorpay={displayRazorpay}
        setDisplayRazorpay={setDisplayRazorpay}
      />
    </StudentPageWrapper>
  );
}

export default StudentPlan;
