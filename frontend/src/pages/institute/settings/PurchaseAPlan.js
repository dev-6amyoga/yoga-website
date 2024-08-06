import {
  Button,
  Card,
  Divider,
  Input,
  Modal,
  Note,
  Select,
  Spacer,
} from "@geist-ui/core";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import {
  ROLE_INSTITUTE_ADMIN,
  ROLE_INSTITUTE_OWNER,
} from "../../../enums/roles";
import {
  USER_PLAN_ACTIVE,
  USER_PLAN_STAGED,
} from "../../../enums/user_plan_status";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import { withAuth } from "../../../utils/withAuth";
import RenderRazorpay from "../../student/RenderRazorpay";
import { AssignPlans } from "./AssignPlans";

function FeatureTag({ children }) {
  return (
    <div className="rounded-lg border border-blue-500 p-1 text-blue-500">
      {children}
    </div>
  );
}

function FeatureAvailable({ children }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-green-600">✓</span>
      {children}
    </div>
  );
}

function FeatureNotAvailable({ children }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-red-600">✗</span>
      {children}
    </div>
  );
}

function PlansCards({ allPlans, subscribePlan, selectedCurrency, teachers }) {
  return (
    <div className="my-10 grid w-full grid-cols-1 place-content-center place-items-center gap-4 md:grid-cols-3 lg:gap-8">
      {allPlans?.map((plan) => {
        const selectedPricing = plan.pricing.find(
          (x) => x.currency.short_tag === selectedCurrency
        );
        return (
          <Card key={plan.plan_id} width="100%">
            <Card.Content>
              <h3 className="text-center">{plan.name}</h3>
              <Divider />

              <Spacer h={1} />

              <p className="text-center text-2xl font-bold text-blue-500">
                {selectedCurrency} {selectedPricing.denomination}
              </p>

              <Spacer h={1} />

              <p className="text-center">
                <span className="text-sm uppercase text-zinc-500">
                  Watch Time Limit
                </span>
                <br />
                <span className="text-3xl font-bold text-green-600">
                  {plan.watch_time_limit < 3600 ? (
                    <>{plan.watch_time_limit / 60} Minutes</>
                  ) : (
                    <>{plan.watch_time_limit / 3600} Hours</>
                  )}
                </span>
              </p>
              <Spacer h={1} />

              <p className="text-center">
                <span className="text-sm uppercase text-zinc-500">
                  Validity
                </span>
                <br />
                <span className="text-3xl font-bold text-green-600">
                  {plan.plan_validity_days} Days
                </span>
              </p>

              <Spacer h={2} />

              <div>
                <p className="text-center text-sm uppercase text-zinc-500">
                  Features
                </p>
                <div className="my-4 flex flex-col items-start gap-2">
                  {plan.has_basic_playlist ? (
                    <FeatureAvailable>Play 6AM Yoga playlists</FeatureAvailable>
                  ) : (
                    <FeatureNotAvailable>
                      Play 6AM Yoga playlists
                    </FeatureNotAvailable>
                  )}

                  {plan.has_playlist_creation ? (
                    <FeatureAvailable>
                      Create custom curated playlists
                    </FeatureAvailable>
                  ) : (
                    <FeatureNotAvailable>
                      Create custom curated playlists
                    </FeatureNotAvailable>
                  )}

                  {/* {plan.has_self_audio_upload ? (
												<FeatureAvailable>
													Upload your own audio
												</FeatureAvailable>
											) : (
												<FeatureNotAvailable>
													Upload your own audio
												</FeatureNotAvailable>
											)} */}

                  {plan?.number_of_teachers > 0 ? (
                    <FeatureAvailable>
                      {plan.number_of_teachers} Teacher
                      {plan.number_of_teachers > 1 ? "s" : ""} can be registered
                    </FeatureAvailable>
                  ) : (
                    <FeatureNotAvailable>
                      Teachers cannot be registered
                    </FeatureNotAvailable>
                  )}
                </div>
              </div>
            </Card.Content>
            <Card.Actions>
              <Button
                type="success"
                width={"100%"}
                onClick={() => {
                  if (teachers?.length > plan.number_of_teachers) {
                    toast(
                      "Cannot buy plan that are less than the number of teachers in the institute",
                      { type: "error" }
                    );
                  } else {
                    subscribePlan(plan);
                  }
                }}
              >
                Purchase
              </Button>
            </Card.Actions>
          </Card>
        );
      })}
    </div>
  );
}

function DiscountCouponForm({ handleDiscountCouponFormSubmit }) {
  return (
    <form
      className="flex items-end gap-1"
      onSubmit={handleDiscountCouponFormSubmit}
    >
      <Input width="100%" name="discount_coupon">
        <strong>Discount Coupon</strong>
      </Input>
      <Button htmlType="submit" scale={0.8} width="35%">
        Apply
      </Button>
    </form>
  );
}

function calculateTotalPrice(
  price,
  currency,
  applyTax,
  tax,
  discountCoupon,
  multiplier = 100
) {
  let at = currency === "INR" && applyTax;

  let p = price;

  if (discountCoupon) {
    p = p * (1 - discountCoupon.discount_percentage / 100);
  }

  if (at) {
    p = p * (1 + tax / 100);
  }

  return Math.ceil(p * multiplier);
}

function PurchaseAPlan() {
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );

  const [currentInstitute, setCurrentInstitute] = useState(null);

  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null,
    currency: null,
    amount: null,
  });

  const [loading, setLoading] = useState(false);

  const [validityFromDate, setValidityFromDate] = useState("");

  const calculateEndDate = (validityDays) => {
    const endDate = new Date(validityFromDate);
    endDate.setUTCDate(endDate.getUTCDate() + validityDays);
    return endDate.toISOString().split("T")[0];
  };

  const [toBeRegistered, setToBeRegistered] = useState({});
  const [transactionId, setTransactionId] = useState("");

  const [allPlans, setAllPlans] = useState([]);
  const [myPlans, setMyPlans] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(USER_PLAN_ACTIVE);
  const [planId, setPlanId] = useState(-1);

  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState(null);

  const [price, setPrice] = useState(0);
  const [discountCouponApplied, setDiscountCouponApplied] = useState(false);
  const [discountCoupon, setDiscountCoupon] = useState(null);

  const [currencies, setAllCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(1);

  const [teachers, setTeachers] = useState([]);

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];

  const getEndDate = (userPlan) => {
    var updatedValidityString = "";

    if (userPlan.length === 0) {
      setCurrentStatus(USER_PLAN_ACTIVE);
      var today = new Date();
      updatedValidityString = today?.toISOString();
      console.log("New plan starts from date:", updatedValidityString);
    } else if (userPlan.length === 1) {
      setCurrentStatus(USER_PLAN_STAGED);
      var validityDate = new Date(userPlan[0].validity_to);
      validityDate.setDate(validityDate.getDate() + 1);
      updatedValidityString = validityDate?.toISOString();
      console.log("New plan validity from date:", updatedValidityString);
    } else {
      var highestValidityDate = null;
      setCurrentStatus(USER_PLAN_STAGED);
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
        updatedValidityString = highestValidityDate?.toISOString();
        console.log("New plan validity from date:", updatedValidityString);
      } else {
        console.log("No valid validity_to dates found.");
      }
    }
    return updatedValidityString;
  };

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "/currency/get-all",
      });

      setAllCurrencies(response?.data?.currencies);
      console.log("Fetching currencies");
    } catch (error) {
      toast("Error fetching plans", { type: "error" });
      console.log(error);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "/plan/get-all-institute-plans",
      });
      const data = response.data;
      setAllPlans(data["plans"]);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const subscribePlan = async (data) => {
    setShowCard(true);
    setCardData(data);
    setDiscountCouponApplied(false);
    setDiscountCoupon(null);
    const pricing = data.pricing.find(
      (p) => p.currency.short_tag === selectedCurrency
    );
    setPrice(pricing?.denomination);
  };

  const handleDiscountCouponFormSubmit = async (e) => {
    e.preventDefault();

    const formData = getFormData(e);

    const discount_coupon = formData?.discount_coupon;

    const error = await validateDiscountCoupon(discount_coupon);

    if (error) {
      setDiscountCouponApplied(false);
      setDiscountCoupon(null);
      toast(error.message, {
        type: "error",
      });
      return;
    }
  };

  const validateDiscountCoupon = async (discount_coupon) => {
    if (!discount_coupon) {
      return new Error("Invalid discount coupon");
    }

    try {
      const res = await Fetch({
        url: "/discount-coupon/check-plan-mapping",
        method: "POST",
        data: {
          coupon_name: discount_coupon,
          plan_id: cardData.plan_id,
        },
      });

      if (res.status === 200) {
        console.log(res.data);
        setDiscountCoupon(res.data.discount_coupon);
        setDiscountCouponApplied(true);
        return null;
      }

      return new Error("Invalid discount coupon");
    } catch (err) {
      console.log(err);
      return new Error("Invalid discount coupon");
    }
  };

  const registerUserPlan = async (t1) => {
    toBeRegistered.transaction_order_id = t1;
    toBeRegistered.institute_id = currentInstituteId;
    console.log(toBeRegistered);
    AssignPlans(
      currentInstituteId,
      cardData.plan_id,
      user.user_id,
      toBeRegistered
    );
    // try {
    //   const response = await Fetch({
    //     url: "/user-plan/register",
    //     method: "POST",
    //     data: toBeRegistered,
    //   });
    //   if (response?.status === 200) {
    //     toast("Plan subscribed successfully", {
    //       type: "success",
    //     });
    //     //also add the plan to existing teachers

    //     //invoice download here!! order_id, toBeRegistered.user_id
    //   } else {
    //     const errorData = response.data;
    //     toast(errorData.error, { type: "error" });
    //   }
    // } catch (error) {
    //   console.log(error);
    //   toast("Error registering plan", { type: "error" });
    // }

    setShowCard(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("in handle submit");
    if (!user) {
      toast("Please login to continue", { type: "error" });
      return;
    }

    if (!cardData) {
      toast("Please select a plan to continue", { type: "error" });
      return;
    }

    if (!selectedCurrency || !selectedCurrencyId) {
      toast("Please select a currency to continue", { type: "error" });
      return;
    }

    let userPlanData = {
      user_id: user?.user_id,
      plan_id: cardData?.plan_id,
      institute_id: currentInstituteId,
      cancellation_date: null,
      auto_renewal_enabled: false,
      discount_coupon_id:
        discountCoupon && discountCouponApplied
          ? discountCoupon.discount_coupon_id
          : null,
      referral_code_id: null,
      amount: calculateTotalPrice(
        price,
        selectedCurrency,
        true,
        18,
        discountCoupon
      ),
      currency: selectedCurrency,
      user_type: "INSTITUTE_OWNER",
    };
    if (planId !== -1) {
      if (currentStatus !== USER_PLAN_ACTIVE) {
        toast(
          "You have an active plan! If you purchase a new plan, it will be staged."
        );
      }
      const validityTo = new Date(validityFromDate);
      validityTo.setDate(validityTo.getDate() + cardData.plan_validity_days);

      const validityToDate = validityTo?.toISOString();
      userPlanData.purchase_date = formattedDate;
      userPlanData.validity_from = validityFromDate;
      userPlanData.validity_to = validityToDate;
      userPlanData.current_status = currentStatus;
      setToBeRegistered(userPlanData);
    } else {
      userPlanData.purchase_date = formattedDate;
      userPlanData.validity_from = formattedDate;
      userPlanData.validity_to = calculateEndDate(cardData.plan_validity_days);
      userPlanData.current_status = USER_PLAN_ACTIVE;
      setToBeRegistered(userPlanData);
    }
    try {
      const response = await Fetch({
        url: "/payment/order",
        method: "POST",
        token: true,
        data: userPlanData,
      });
      if (response?.status === 200) {
        const razorpayOrder = response.data?.order;
        if (razorpayOrder && razorpayOrder?.id) {
          setOrderDetails({
            orderId: razorpayOrder?.id,
            currency: razorpayOrder?.currency,
            amount: razorpayOrder?.amount,
          });
          setDisplayRazorpay(true);
        }
      } else {
        toast(response.data?.message);
      }
    } catch (error) {
      console.log(error);
      toast("Error setting up order, try again", { type: "error" });
    }
  };

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await Fetch({
        url: "/institute/teacher/get-all-by-instituteid",
        method: "POST",
        token: true,
        data: {
          institute_id: currentInstituteId,
        },
      });

      if (res.status === 200) {
        setTeachers(res.data.teachers);
      } else {
        toast("Error fetching teachers", { type: "error" });
      }
    } catch (err) {
      toast("Error fetching teachers", { type: "error" });
    }
  }, [currentInstituteId]);

  useEffect(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);

  useEffect(() => {
    if (myPlans) {
      setValidityFromDate(getEndDate(myPlans));
    }
  }, [myPlans]);

  // get all institute plans & currencies
  useEffect(() => {
    fetchPlans();
    fetchCurrencies();
  }, [fetchPlans, fetchCurrencies]);

  // get user plans
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Fetch({
          url: "/user-plan/get-user-institute-plan-by-id",
          method: "POST",
          data: {
            user_id: user?.user_id,
            institute_id: currentInstituteId,
          },
        });
        const data = response.data;
        console.log("DATA IS :", data);

        if (data?.userplans.length !== 0) {
          setMyPlans(data?.userplans);

          if (data?.userplans.length === 1) {
            if (data?.userplans[0].current_status === USER_PLAN_ACTIVE) {
              setPlanId(data?.userplans[0]["plan_id"]);
            } else {
              toast("You don't have a plan yet! Purchase one to continue");
            }
          } else {
            for (var i = 0; i !== data?.userplans.length; i++) {
              if (data?.userplans[i].current_status === USER_PLAN_ACTIVE) {
                setPlanId(data?.userplans[i]["plan_id"]);
                break;
              }
            }
          }
        } else {
          setPlanId(-1);
          toast("You don't have a plan yet! Purchase one to continue");
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (user && currentInstituteId && currentInstituteId !== -1) {
      fetchData();
      fetchTeachers();
    }
  }, [user, currentInstituteId, fetchTeachers]);

  return (
    <InstitutePageWrapper heading="Purchase A Plan">
      <div className="mx-auto max-w-7xl">
        {/* current plan status */}
        {planId === -1 ? (
          <Note type="error" label="Note" filled>
            Please purchase a subscription to unlock all features!.
          </Note>
        ) : (
          <Note
            type="warning"
            label="Note"
            filled
            className="mx-auto max-w-7xl"
          >
            You have an already active plan!
          </Note>
        )}

        <Spacer h={1} />

        <Note label="Current No. of Teachers">{teachers.length}</Note>

        <Spacer h={1} />

        {/* plan history */}
        <div className="mx-auto max-w-7xl">
          <Note label={false} type="success">
            <h4>Plan History</h4>
            <div className="flex flex-col gap-4">
              {/* <pre>{JSON.stringify(myPlans, null, 4)}</pre> */}
              {myPlans &&
                myPlans.map((x) => (
                  <Note
                    label={false}
                    filled={x.current_status === USER_PLAN_ACTIVE}
                    type={
                      x.current_status === USER_PLAN_ACTIVE
                        ? "success"
                        : "secondary"
                    }
                    key={x.id}
                  >
                    <div className="grid grid-cols-3">
                      <span>
                        {x.current_status} : {x.plan.name}
                      </span>
                      <span>
                        VALID FROM :{" "}
                        {new Date(x.validity_from).toLocaleString()}
                      </span>
                      <span>
                        VALID TO : {new Date(x.validity_to).toLocaleString()}
                      </span>
                    </div>
                  </Note>
                ))}
            </div>
          </Note>
        </div>

        <Spacer h={4} />

        <div className="mx-auto mt-10 flex w-full max-w-7xl justify-end">
          <div>
            <p className="text-right">
              Select A Currency |{" "}
              {currencies.length > 0 ? currencies[0].short_tag : "???"} |
              Selected : {selectedCurrency} | {selectedCurrencyId}
            </p>
            <Select
              className=""
              placeholder={
                currencies.length > 0 ? currencies[0].short_tag : "INR"
              }
              initialValue={
                currencies.length > 0 ? currencies[0].short_tag : "INR"
              }
              // value={}
              onChange={(val) => {
                setSelectedCurrency(val);
                setSelectedCurrencyId(
                  currencies.find((x) => x.short_tag === val)?.currency_id ||
                    null
                );
              }}
            >
              {currencies?.map((cur) => {
                return (
                  <Select.Option key={cur.currency_id} value={cur.short_tag}>
                    {cur.short_tag}
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        </div>

        {/* plans show */}
        <PlansCards
          allPlans={allPlans}
          subscribePlan={subscribePlan}
          selectedCurrency={selectedCurrency}
          teachers={teachers}
        />

        {/* plan card */}
        <div>
          <Modal visible={showCard} onClose={() => setShowCard(false)}>
            <Modal.Content>
              {cardData ? (
                <>
                  <h3>{cardData.name}</h3>
                  <Divider />
                  <Spacer />
                  <h5>Features:</h5>
                  <div className="my-2 flex flex-col gap-2">
                    <h6>
                      {cardData.has_basic_playlist ? (
                        <FeatureTag>
                          Use all yoga playlists curated by 6AM Yoga
                        </FeatureTag>
                      ) : (
                        ""
                      )}
                    </h6>
                    <h6>
                      {cardData.has_playlist_creation &&
                      cardData.playlist_creation_limit ? (
                        cardData.playlist_creation_limit === 1000000 ? (
                          <FeatureTag>
                            Create UNLIMITED yoga playlists of your own, using
                            our asana videos
                          </FeatureTag>
                        ) : (
                          <FeatureTag>
                            Create {cardData.playlist_creation_limit} yoga
                            playlists of your own, using our asana videos
                          </FeatureTag>
                        )
                      ) : (
                        ""
                      )}
                    </h6>
                  </div>
                  <Spacer />
                  <Divider />
                  <Spacer />
                  <p>
                    <strong>Price</strong>
                    <br />
                    {cardData ? (
                      <>
                        <span>{selectedCurrency}</span> <span>{price}</span>{" "}
                        {discountCouponApplied ? (
                          <span className="text-green-600">
                            -{" "}
                            {(price * discountCoupon.discount_percentage) / 100}
                          </span>
                        ) : (
                          <></>
                        )}{" "}
                        {selectedCurrency === "INR" ? (
                          <span>+ 18% GST</span>
                        ) : (
                          <></>
                        )}{" "}
                        {selectedCurrency === "INR" || discountCouponApplied ? (
                          <>
                            <span> = </span>{" "}
                            <span>
                              {calculateTotalPrice(
                                price,
                                selectedCurrency,
                                true,
                                18,
                                discountCoupon,
                                1
                              )}
                            </span>
                          </>
                        ) : (
                          <></>
                        )}
                        <br />
                        {discountCouponApplied ? (
                          <span className="rounded-full bg-green-600 px-2 py-1 text-sm text-white">
                            Coupon Applied : {discountCoupon.coupon_name} |{" "}
                            {discountCoupon?.discount_percentage}
                            {"%"}
                            OFF
                            <button
                              className="mx-2 rounded-full border-0 bg-red-500 px-1"
                              onClick={() => {
                                setDiscountCouponApplied(false);
                                setDiscountCoupon(null);
                              }}
                            >
                              Remove
                            </button>
                          </span>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      ""
                    )}
                  </p>
                  <Spacer />
                  <DiscountCouponForm
                    handleDiscountCouponFormSubmit={
                      handleDiscountCouponFormSubmit
                    }
                  />
                  <Spacer />
                  <Divider />
                  <Spacer />
                  <h5>Validity</h5>
                  <Spacer />
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                      <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                        <strong>Plan Start Date</strong>
                        <span className="text-center">
                          {new Date(validityFromDate).toDateString()}
                        </span>
                      </p>

                      <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                        <strong>Plan End Date</strong>
                        <span className="text-center">
                          {new Date(
                            calculateEndDate(cardData.plan_validity_days)
                          ).toDateString()}
                        </span>
                      </p>
                    </div>

                    <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                      <strong>Watch Hours Limit</strong>
                      <span className="text-center">
                        {cardData?.watch_time_limit < 3600 ? (
                          <>{cardData?.watch_time_limit / 60} Minutes</>
                        ) : (
                          <>{cardData?.watch_time_limit / 3600} Hours</>
                        )}
                      </span>
                    </p>
                  </div>
                  <Spacer />
                  <Divider />
                  <Spacer />
                  <Button
                    onClick={handleSubmit}
                    width={"100%"}
                    type="success"
                    loading={loading}
                    disabled={loading}
                  >
                    Purchase
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Modal.Content>
            <Modal.Action onClick={() => setShowCard(false)}>
              Close
            </Modal.Action>
          </Modal>
        </div>

        <RenderRazorpay
          userId={user?.user_id}
          keyId={import.meta.env.VITE_RAZORPAY_KEY_ID}
          keySecret={import.meta.env.VITE_RAZORPAY_KEY_SECRET}
          orderId={orderDetails.orderId}
          currency={orderDetails.currency}
          currencyId={selectedCurrencyId}
          amount={orderDetails.amount}
          payment_for={"user_plan"}
          redirectUrl={"/institute"}
          onErrorCallback={() => {
            setDisplayRazorpay(false);
            setShowCard(false);
            setCardData(null);
          }}
          onSuccessCallback={registerUserPlan}
          displayRazorpay={displayRazorpay}
          setDisplayRazorpay={setDisplayRazorpay}
        />
      </div>
    </InstitutePageWrapper>
  );
}

export default withAuth(PurchaseAPlan, ROLE_INSTITUTE_ADMIN);
