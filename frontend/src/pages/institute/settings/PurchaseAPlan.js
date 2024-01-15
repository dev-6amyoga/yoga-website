import {
  Tabs,
  Table,
  Grid,
  Button,
  Input,
  Divider,
  Card,
  Note,
  ButtonGroup,
} from "@geist-ui/core";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { toast } from "react-toastify";

export default function PurchaseAPlan() {
  const [refreshLoading, setRefreshLoading] = useState(false);
  const notify = (x) => toast(x);
  const [teachers, setTeachers] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [modifiedPlans, setModifiedPlans] = useState([]);
  const [planId, setPlanId] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState({});
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const [selectedValidity, setSelectedValidity] = useState(30);
  const calculateEndDate = (validityDays) => {
    const endDate = new Date(today);
    endDate.setUTCDate(today.getUTCDate() + validityDays);
    return endDate.toISOString().split("T")[0];
  };

  const handleValidityChange = (validity) => {
    setSelectedValidity(validity);
  };

  useEffect(() => {
    for (var x = 0; x < allPlans.length; x++) {
      // console.log(allPlans[x].name);
      var newPlan = {
        plan_name: allPlans[x].name,
        has_basic_playlist: allPlans[x].has_basic_playlist,
        has_playlist_creation: allPlans[x].has_playlist_creation,
        playlist_creation_limit: [allPlans[x].playlist_creation_limit],
        has_self_audio_upload: allPlans[x].has_self_audio_upload,
        number_of_teachers: [allPlans[x].number_of_teachers],
      };
      console.log(newPlan);
      if (modifiedPlans.length === 0) {
        setModifiedPlans((prevPlans) => [...prevPlans, newPlan]);
      } else {
        for (var y = 0; y < modifiedPlans.length; y++) {
          console.log("hi");
        }
      }

      // setModifiedPlans((prevPlans) => [...prevPlans, newPlan]);
    }
  }, [allPlans]);

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
            body: JSON.stringify({ user_id: user.user_id }),
          }
        );
        const data = await response.json();
        if (data["userPlan"]) {
          console.log(data["userPlan"]["plan_id"]);
          setPlanId(data["userPlan"]["plan_id"]);
        } else {
          notify("You don't have a plan yet! Purchase one to continue");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [user.user_id]);

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
      setTeachers(() => res?.data?.teachers?.map((t) => t.user));
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

  async function registerUserPlan(userPlanData) {
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
      } else {
        const errorData = await response.json();
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (planId != 0) {
      notify("You have an active plan! You can't purchase a new plan.");
    } else {
      const discount_code = document.querySelector("#discount_code").value;
      const referral_code = document.querySelector("#referral_code").value;
      const userPlanData_admin = {
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
      registerUserPlan(userPlanData_admin);
      if (teachers.length > cardData.number_of_teachers) {
        notify(
          "Please purchase a higher plan. You have more teachers than the selected plan permits."
        );
      } else {
        if (teachers.length < cardData.number_of_teachers) {
          notify(
            "You have lesser teachers than the selected plan permits. You can add more teachers in the future."
          );
        }
        if (teachers.length === cardData.number_of_teachers) {
          notify(
            "You have the exact number of teachers as mentioned in the selected plan permits. You can add more teachers in the future by purchasing a higher plan."
          );
        }
        for (var t1 = 0; t1 < teachers.length; t1++) {
          const userPlanData_teacher = {
            purchase_date: formattedDate,
            validity_from: formattedDate,
            validity_to: calculateEndDate(selectedValidity),
            cancellation_date: null,
            auto_renewal_enabled: false,
            user_id: teachers[t1].user_id,
            plan_id: cardData.plan_id,
            discount_code: discount_code,
            referral_code: referral_code,
          };
          registerUserPlan(userPlanData_teacher);
        }
      }
    }
  };

  return (
    <InstitutePageWrapper heading="Purchase A Plan">
      <div className="max-w-5xl mx-auto">
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
        <div className="flex flex-col items-center justify-center py-20">
          <Table width={100} data={allPlans} className="bg-white ">
            {/* <Table.Column prop="plan_id" label="Plan ID" /> */}
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
      {/* </div> */}
    </InstitutePageWrapper>
  );
}
