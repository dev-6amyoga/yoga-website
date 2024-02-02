import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  Grid,
  Input,
  Note,
  Spacer,
  Table,
} from "@geist-ui/core";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import RenderRazorpay from "../../student/RenderRazorpay";

export default function PurchaseAPlan() {
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );
  const [currentInstitute, setCurrentInstitute] = useState(null);
  useState(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);

  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null,
    currency: null,
    amount: null,
  });
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [validityFromDate, setValidityFromDate] = useState("");
  const calculateEndDate = (validityDays) => {
    const endDate = new Date(validityFromDate);
    endDate.setUTCDate(endDate.getUTCDate() + validityDays);
    return endDate.toISOString().split("T")[0];
  };
  const [teachers, setTeachers] = useState([]);
  const [myPlans, setMyPlans] = useState([]);
  const [toBeRegistered, setToBeRegistered] = useState({});

  const [transactionId, setTransactionId] = useState("");
  const [allPlans, setAllPlans] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("ACTIVE");
  const [planId, setPlanId] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState({});
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const [selectedValidity, setSelectedValidity] = useState(30);
  const handleValidityChange = (validity) => {
    setSelectedValidity(validity);
  };
  const getEndDate = (userPlan) => {
    var updatedValidityString = "";
    if (userPlan.length === 0) {
      setCurrentStatus("ACTIVE");
      var today = new Date();
      updatedValidityString = today.toISOString();
      console.log("New plan starts from date:", updatedValidityString);
    } else if (userPlan.length === 1) {
      setCurrentStatus("STAGED");
      var validityDate = new Date(userPlan[0].validity_to);
      validityDate.setDate(validityDate.getDate() + 1);
      updatedValidityString = validityDate.toISOString();
      console.log("New plan validity from date:", updatedValidityString);
    } else {
      var highestValidityDate = null;
      setCurrentStatus("STAGED");
      for (var i = 0; i !== userPlan.length; i++) {
        var validityDate = new Date(userPlan[i].validity_to);
        if (
          highestValidityDate === null ||
          validityDate > highestValidityDate
        ) {
          highestValidityDate = validityDate;
        }
      }
      if (highestValidityDate !== null) {
        highestValidityDate.setDate(highestValidityDate.getDate() + 1);
        updatedValidityString = highestValidityDate.toISOString();
        console.log("New plan validity from date:", updatedValidityString);
      } else {
        console.log("No valid validity_to dates found.");
      }
    }
    return updatedValidityString;
  };

  useEffect(() => {
    const fetchData = async () => {
      setValidityFromDate(getEndDate(myPlans));
    };
    if (myPlans) {
      fetchData();
    }
  }, [myPlans]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/plan/get-all-institute-plans"
        );
        const data = await response.json();
        setAllPlans(data["plans"]);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-plan/get-user-institute-plan-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: user?.user_id,
              institute_id: currentInstituteId,
            }),
          }
        );
        const data = await response.json();
        console.log("DATA IS :", data);
        if (data["userPlan"].length != 0) {
          setMyPlans(data["userPlan"]);
          if (data["userPlan"].length === 1) {
            if (data["userPlan"][0].current_status === "ACTIVE") {
              setPlanId(data["userPlan"][0]["plan_id"]);
            } else {
              toast("You don't have a plan yet! Purchase one to continue");
            }
          } else {
            for (var i = 0; i !== data["userPlan"].length; i++) {
              if (data["userPlan"][i].current_status === "ACTIVE") {
                setPlanId(data["userPlan"][i]["plan_id"]);
                break;
              }
            }
          }
        } else {
          setPlanId(0);
          toast("You don't have a plan yet! Purchase one to continue");
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (user && currentInstituteId && currentInstituteId !== 0) {
      fetchData();
    }
  }, [user, currentInstituteId]);

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

  const getTeachers = useCallback(async () => {
    setRefreshLoading(true);
    setTeachers([]);
    try {
      const res = await Fetch({
        url: "http://localhost:4000/institute/teacher/get-all-by-instituteid",
        method: "POST",
        data: {
          institute_id: currentInstituteId,
        },
      });
      console.log(res.data);
      setTeachers(res?.data?.teachers);
      setRefreshLoading(false);
    } catch (err) {
      toast(`Error : ${err?.response?.data?.message}`, {
        type: "error",
      });
      setRefreshLoading(false);
    }
  }, []);
  useEffect(() => {
    getTeachers();
  }, [getTeachers]);

  const registerUserPlan = async (t1) => {
    toBeRegistered.transaction_order_id = t1;
    try {
      const response = await fetch("http://localhost:4000/user-plan/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toBeRegistered),
      });
      if (response.ok) {
        for (var te1 = 0; te1 < teachers.length; te1++) {
          toBeRegistered.user_id = teachers[te1].user_id;
          toBeRegistered.transaction_order_id = t1 + "_TEACHER" + String(te1);
          console.log(toBeRegistered);
          try {
            const response = await fetch(
              "http://localhost:4000/user-plan/register",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(toBeRegistered),
              }
            );
            if (response.ok) {
              toast("Plan subscribed successfully", {
                type: "success",
              });
              //invoice download here!! order_id, toBeRegistered.user_id
            } else {
              toast("An error occured!");
            }
          } catch (err) {
            toast(err);
          }
        }
      } else {
        const errorData = await response.json();
        toast(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let userPlanData = {};
    const validityTo = new Date(validityFromDate);
    validityTo.setDate(validityTo.getDate() + selectedValidity);
    const validityToDate = validityTo.toISOString();
    userPlanData = {
      purchase_date: formattedDate,
      validity_from: validityFromDate,
      validity_to: validityToDate,
      cancellation_date: null,
      auto_renewal_enabled: false,
      user_id: user?.user_id,
      plan_id: cardData.plan_id,
      discount_coupon_id: 0,
      referral_code_id: 0,
      amount: cardData.pricing[0].denomination * 118,
      currency: "INR",
      current_status: currentStatus,
      user_type: "INSTITUTE",
      institute_id: currentInstituteId,
    };
    setToBeRegistered(userPlanData);
    if (teachers.length > cardData.number_of_teachers) {
      toast(
        "Please purchase a higher plan. You have more teachers than the selected plan permits."
      );
    } else {
      if (currentStatus !== "ACTIVE") {
        toast(
          "You have an active plan! If you purchase a new plan, it will be staged."
        );
      }

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
          toast(errorData.error);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <InstitutePageWrapper heading="Purchase A Plan">
      <div className="max-w-7xl mx-auto">
        <h4></h4>
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
        <Spacer h={3} />

        <Note label={false} type="success">
          <h4>Plan History</h4>
          {myPlans &&
            myPlans.map((x) => (
              <Note label={false} type="secondary" key={x.id}>
                {x.current_status} : {x.plan.name} , VALID FROM :
                {x.validity_from.split("T")[0]}, VALID TO :{" "}
                {x.validity_to.split("T")[0]}
              </Note>
            ))}
        </Note>

        <div className="flex flex-col items-center justify-center py-20">
          <Table width={100} data={allPlans} className="bg-white ">
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
                return data === 1000000
                  ? "Unlimited"
                  : data
                  ? data.toString()
                  : "0";
              }}
            />
            <Table.Column
              prop="has_self_audio_upload"
              label="Upload your own audio"
              render={(data) => {
                return data ? "Yes" : "No";
              }}
            />

            <Table.Column
              prop="number_of_teachers"
              label="No. of Teachers"
              render={(data) => {
                return data === 100000
                  ? "Unlimited"
                  : data
                  ? data.toString()
                  : "0";
              }}
            />
            <Table.Column
              prop="operation"
              label="Purchase"
              width={150}
              render={renderAction}
            />
          </Table>
        </div>
        <Divider />
        {showCard && (
          <Card>
            <h4>{cardData.name}</h4>
            <Divider />
            <h5>Features:</h5>
            <br />
            <h6>. One Admin Account</h6>
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
            <h6>
              {cardData.has_self_audio_upload
                ? ". Upload your own audio to our videos"
                : " "}
            </h6>
            <h6>
              {cardData.number_of_teachers
                ? cardData.number_of_teachers === 100000
                  ? ". For UNLIMITED teachers in your institute"
                  : ". For " +
                    cardData.number_of_teachers +
                    " teachers in your institute"
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
              <h5>Validity : </h5>
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
              <p>
                {" "}
                <h5>Plan Start Date :</h5> {validityFromDate}
              </p>
              <p> Plan End Date: {calculateEndDate(selectedValidity)}</p>
              <Divider />
              <Input width="100%" id="discount_coupon_id">
                Discount Code
              </Input>
              <Input width="100%" id="referral_code_id">
                Referral Code
              </Input>
              <Button htmlType="submit">Purchase</Button>
            </form>
          </Card>
        )}
        <RenderRazorpay
          userId={user?.user_id}
          keyId={process.env.REACT_APP_RAZORPAY_KEY_ID}
          keySecret={process.env.REACT_APP_RAZORPAY_KEY_SECRET}
          orderId={orderDetails.orderId}
          currency={orderDetails.currency}
          amount={orderDetails.amount}
          payment_for={"user_plan"}
          redirectUrl={"/institute"}
          onSuccessCallback={registerUserPlan}
          displayRazorpay={displayRazorpay}
          setDisplayRazorpay={setDisplayRazorpay}
        />
      </div>
    </InstitutePageWrapper>
  );
}
