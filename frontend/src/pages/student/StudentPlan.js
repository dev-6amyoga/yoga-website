import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import calculateTotalPrice from "../../utils/calculateTotalPrice";
import RazorpayCheckout from "./RenderRazorpay";
import Pricing from "./components/Pricing";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import Hero from "./components/Hero";
import { ROLE_STUDENT } from "../../enums/roles";
import { withAuth } from "../../utils/withAuth";
import {
  Alert,
  Box,
  Button,
  Divider,
  Input,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import InstitutePlansAccordion from "../../components/student/InstitutePlansAccordion";

function DiscountCouponForm({ handleDiscountCouponFormSubmit }) {
  return (
    <form
      className="flex items-end gap-1"
      onSubmit={handleDiscountCouponFormSubmit}
    >
      <Input width="100%" name="discount_coupon">
        <strong>Discount Coupon</strong>
      </Input>
      <Button type="submit" scale={0.8} width="35%">
        Apply
      </Button>
    </form>
  );
}

function StudentPlan() {
  const user = useUserStore((state) => state.user);
  const navigate = useNavigate();
  const { planId: urlPlanId } = useParams();
  const [allInstitutePlans, setAllInstitutePlans] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [price, setPrice] = useState(0);
  const [discountCouponApplied, setDiscountCouponApplied] = useState(false);
  const [discountCoupon, setDiscountCoupon] = useState(null);
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null,
    currency: null,
    amount: null,
  });
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  const [loading, setLoading] = useState(false);
  const [myPlans, setMyPlans] = useState([]);
  const [validityFromDate, setValidityFromDate] = useState("");
  const [currencies, setAllCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(1);
  const [planId, setPlanId] = useState(-1);
  const [toBeRegistered, setToBeRegistered] = useState({});
  const [invalidCountry, setInvalidCountry] = useState(false);
  const [formattedDate, setFormattedDate] = useState(new Date().toISOString());
  const [hasRecentInstituteSubscription, setHasRecentInstituteSubscription] =
    useState(false);

  const checkRecentInstituteSubscription = useCallback(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    console.log("Current date:", new Date());
    console.log("Six months ago:", sixMonthsAgo);
    console.log("My plans:", myPlans);

    // Check if user had ANY plan within the last 6 months
    const hasRecentInstitute = myPlans.some((plan) => {
      const planDate = new Date(plan.validity_from);
      const isRecent = planDate >= sixMonthsAgo;

      console.log(`Plan: ${plan.plan?.name}`, {
        planDate: planDate.toDateString(),
        isRecent,
      });

      return isRecent;
    });

    console.log("Has recent subscription:", hasRecentInstitute);
    setHasRecentInstituteSubscription(hasRecentInstitute);
  }, [myPlans]);

  useEffect(() => {
    checkRecentInstituteSubscription();
  }, []);

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

  const fetchPlans = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "/plan/get-all-student-plans",
      });
      const filteredPlans = response.data?.plans?.filter(
        (plan) => plan.plan_user_type === "STUDENT",
      );
      setAllPlans(filteredPlans);
    } catch (error) {
      toast("Error fetching plans", { type: "error" });
    }
    try {
      const response = await Fetch({
        url: "/plan/get-all-institute-plans",
      });
      console.log("Fetched institute plans:", response.data?.plans);
      let filteredPlans = response.data?.plans?.filter(
        (plan) => plan.plan_user_type === "INSTITUTE",
      );

      // Filter out 30-day plans if user doesn't have any plan within last 6 months
      if (!hasRecentInstituteSubscription) {
        filteredPlans = filteredPlans.filter(
          (plan) => plan.plan_validity_days !== 30,
        );
      }

      console.log("Filtered institute plans:", filteredPlans);
      setAllInstitutePlans(filteredPlans);
    } catch (error) {
      toast("Error fetching plans", { type: "error" });
    }
  }, [hasRecentInstituteSubscription]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const fetchUserPlans = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "/user-plan/get-user-plan-by-id",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: { user_id: user?.user_id },
      });
      const data = response.data;
      console.log(data);
      setValidityFromDate(data.newPlanPrediction.start_date);
      if (!data?.userPlan?.length) return;
      data.userPlan.sort(
        (a, b) => new Date(a.validity_to) - new Date(b.validity_to),
      );
      setMyPlans(data.userPlan);
      const activePlan = data.userPlan.find(
        (plan) => plan.current_status === "ACTIVE",
      );
      console.log("ACTIVE : ", activePlan);
      if (activePlan) setPlanId(activePlan.plan_id);
    } catch (error) {
      console.error("Error fetching user plans:", error);
    }
  }, [user, formattedDate]);

  useEffect(() => {
    if (urlPlanId && allPlans.length > 0) {
      const plan = allPlans.find((p) => p.plan_id === Number(urlPlanId));
      if (plan) onSelectPlan(plan);
    }
  }, [urlPlanId, allPlans]);

  const onSelectPlan = (plan) => {
    setSelectedPlan(plan);
    const pricing = plan.pricing.find(
      (p) => p.currency.short_tag === selectedCurrency,
    );
    setPrice(pricing?.denomination || 0);
  };

  const fetchCurrencies = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "/currency/get-all",
      });
      setAllCurrencies(response?.data?.currencies);
    } catch (error) {
      toast("Error fetching plans", { type: "error" });
    }
  }, []);

  const validateDiscountCoupon = async (discount_coupon) => {
    if (!discount_coupon) {
      return new Error("Invalid discount coupon");
    }
    try {
      let isCustom = false;
      const res = await Fetch({
        url: "/discount-coupon/check-plan-mapping",
        method: "POST",
        token: true,
        data: {
          coupon_name: discount_coupon,
          is_custom_plan: isCustom,
          plan_id: cardData.plan_id,
        },
      });
      if (res.status === 200) {
        setDiscountCoupon(res.data.discount_coupon);
        setDiscountCouponApplied(true);
        return null;
      }
      return new Error(res?.data?.message);
    } catch (err) {
      if (err?.response?.data?.error) {
        return new Error(err?.response?.data?.error);
      } else {
        return new Error("Invalid discount coupon");
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedPlan) {
      toast("Please select a plan", { type: "error" });
      return;
    }

    const amount = calculateTotalPrice(price, selectedCurrency, true, 5);

    const userPlanPayload = {
      purchase_date: new Date().toISOString(),
      validity_from: validityFromDate || new Date().toISOString(),
      validity_to: null,
      cancellation_date: null,
      auto_renewal_enabled: false,
      referral_code_id: null,
      current_status: "ACTIVE",
      is_trial: false,
      user_type: "STUDENT",
      institute_id: selectedPlan?.institute_id || null,
    };

    const payload = {
      user_id: user.user_id,
      plan_id: selectedPlan.plan_id,
      amount,
      currency: selectedCurrency,
      user_plan_payload: userPlanPayload,
    };

    setLoading(true);

    try {
      // FREE PLAN
      if (amount === 0) {
        await Fetch({
          url: "/payment/commit",
          method: "POST",
          token: true,
          data: {
            ...payload,
            status: "SUCCESS",
            payment_method: "FREE",
            order_id: `free_${Date.now()}`,
          },
        });

        toast("Plan activated!");
        window.location.reload();
        return;
      }

      // PAID PLAN
      const res = await Fetch({
        url: "/payment/order",
        method: "POST",
        data: payload,
        token: true,
      });

      if (res.status === 200) {
        const order = res.data.order;
        setOrderDetails({
          orderId: order.id,
          currency: order.currency,
          amount: order.amount,
        });
        setDisplayRazorpay(true);
      }
    } catch (err) {
      toast("Error initiating payment", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSuccess = () => {
    setShowCard(false);
    setDisplayRazorpay(false);
    toast("Payment successful! Activating your plan...");
    setActivating(true);
    pollForActivation();
  };

  const subscribePlan = async (data) => {
    setShowCard(true);
    setCardData(data);
    setSelectedPlan(data);
    setDiscountCouponApplied(false);
    setDiscountCoupon(null);
    const pricing = data.pricing.find(
      (p) => p.currency.short_tag === selectedCurrency,
    );
    setPrice(pricing.denomination);
  };

  const pollForActivation = async () => {
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const res = await Fetch({
          url: "/user-plan/get-user-plan-by-id",
          method: "POST",
          data: { user_id: user?.user_id },
        });

        if (res?.data?.userPlan?.length > myPlans.length) {
          clearInterval(interval);
          setActivated(true);
          setActivating(false);
          toast("Plan activated 🎉");

          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }

        if (attempts > 15) {
          clearInterval(interval);
          toast("Activation is taking longer than usual", { type: "info" });
          setActivating(false);
        }
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 2000);
  };

  useEffect(() => {
    if (user) {
      fetchUserPlans();
    }
  }, [user, fetchUserPlans]);

  useEffect(() => {
    fetchPlans();
    fetchCurrencies();
  }, [fetchPlans, fetchCurrencies]);

  const [filteredPlans, setFilteredPlans] = useState([]);

  useEffect(() => {
    setFilteredPlans(allPlans);
  }, [allPlans]);

  const calculateEndDate = (validityDays) => {
    if (!validityFromDate) return null;
    if (!validityDays || isNaN(validityDays)) return null;

    const start = new Date(validityFromDate);
    if (isNaN(start.getTime())) return null;

    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + Number(validityDays));

    if (isNaN(endDate.getTime())) return null;

    return endDate;
  };

  const infoCardStyle = {
    border: "1px solid #eee",
    borderRadius: 2,
    p: 1.5,
    fontSize: 13,
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    background: "#fafafa",
  };

  return (
    <div className="max-w-7xl mx-auto">
      <StudentNavMUI />
      <Hero heading="Plans" />

      <div className="mx-auto max-w-7xl">
        {planId === -1 ? (
          <Alert variant="outlined" severity="info">
            Please purchase a subscription to unlock all features!
          </Alert>
        ) : (
          <Alert variant="outlined" severity="info">
            Plan is currently active.
          </Alert>
        )}
      </div>
      {myPlans && myPlans.length > 0 && (
        <div className="mx-auto max-w-7xl">
          <h4>Plan History</h4>
          <TableContainer component={Paper} sx={{ margin: "2rem 0" }}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead
                sx={{
                  bgcolor: "linear-gradient(#033363, #021F3B)",
                }}
              >
                <TableRow>
                  <TableCell>Plan Name</TableCell>
                  <TableCell>Validity From</TableCell>
                  <TableCell>Validity To</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              {/* customPlansForUser */}
              <TableBody>
                {myPlans?.map((row) => (
                  <TableRow
                    key={row?.id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row?.plan.name}
                    </TableCell>
                    <TableCell>
                      {row?.validity_from
                        ? new Date(row?.validity_from).toDateString()
                        : ""}
                    </TableCell>
                    <TableCell>
                      {row?.validity_to
                        ? new Date(row?.validity_to).toDateString()
                        : ""}
                    </TableCell>
                    <TableCell>{row?.current_status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      {activating && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Activating your plan… please wait ⏳
        </Alert>
      )}

      {activated && (
        <Alert severity="success" sx={{ mt: 2 }}>
          Plan activated! Refreshing… 🎉
        </Alert>
      )}

      <div className="flex flex-col items-center justify-center pt-4">
        {invalidCountry ? (
          <Alert variant="outlined" severity="warning">
            6AM Yoga is unavailable in your country right now! We are working on
            making it available soon!
          </Alert>
        ) : (
          <>
            <Divider />

            <InstitutePlansAccordion
              allInstitutePlans={allInstitutePlans}
              subscribePlan={subscribePlan}
              selectedCurrency={selectedCurrency}
            />
            <Divider />

            <Pricing
              heading="Standard Subscriptions"
              allPlans={filteredPlans}
              subscribePlan={subscribePlan}
              selectedCurrency={selectedCurrency}
              trialPlanAvailed={false}
            />
          </>
        )}
        <Modal open={showCard} onClose={() => setShowCard(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              borderRadius: 3,
              width: { xs: "90%", sm: 420 },
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: 24,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #eee" }}>
              <h3 style={{ margin: 0 }}>{cardData?.name}</h3>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
              {/* Price */}
              <Box sx={{ mb: 2 }}>
                <strong>Price</strong>
                <Box sx={{ mt: 1 }}>
                  <span>{selectedCurrency}</span>{" "}
                  <span style={{ fontWeight: 600 }}>{price}</span>{" "}
                  {discountCouponApplied && (
                    <span style={{ color: "green", marginLeft: 6 }}>
                      - {(price * discountCoupon.discount_percentage) / 100}
                    </span>
                  )}
                </Box>

                {/* GST hint */}
                <Box sx={{ mt: 0.5, fontSize: 13, color: "#555" }}>
                  {selectedCurrency === "INR" && "Excludes 5% GST"}
                </Box>

                {/* After GST amount */}
                {selectedCurrency === "INR" && (
                  <Box sx={{ mt: 0.5, fontSize: 13, color: "#888" }}>
                    After GST: ₹
                    {(
                      (price -
                        (discountCouponApplied
                          ? (price * discountCoupon.discount_percentage) / 100
                          : 0)) *
                      1.05
                    ).toFixed(2)}
                  </Box>
                )}

                {discountCouponApplied && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      borderRadius: 1,
                      background: "#E8F5E9",
                      fontSize: 13,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>
                      Coupon: {discountCoupon.coupon_name} (
                      {discountCoupon.discount_percentage}% OFF)
                    </span>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setDiscountCouponApplied(false);
                        setDiscountCoupon(null);
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Coupon */}
              <DiscountCouponForm
                handleDiscountCouponFormSubmit={handleDiscountCouponFormSubmit}
              />

              <Divider sx={{ my: 2 }} />

              {/* Validity */}
              <Box>
                <strong>Validity</strong>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5,
                    mt: 1.5,
                  }}
                >
                  <Box sx={infoCardStyle}>
                    <span>Start</span>
                    <strong>
                      {validityFromDate &&
                      !isNaN(new Date(validityFromDate).getTime())
                        ? new Date(validityFromDate).toLocaleDateString()
                        : "--"}
                    </strong>
                  </Box>

                  <Box sx={infoCardStyle}>
                    <span>End</span>
                    <strong>
                      {calculateEndDate(cardData?.plan_validity_days)
                        ? calculateEndDate(
                            cardData?.plan_validity_days,
                          ).toLocaleDateString()
                        : "--"}
                    </strong>
                  </Box>
                </Box>

                <Box sx={{ ...infoCardStyle, mt: 1.5 }}>
                  <span>Watch Limit</span>
                  <strong>
                    {cardData?.watch_time_limit < 3600
                      ? `${cardData?.watch_time_limit / 60} Minutes`
                      : `${cardData?.watch_time_limit / 3600} Hours`}
                  </strong>
                </Box>
              </Box>
            </Box>

            {/* Footer */}
            <Box
              sx={{
                p: 2,
                borderTop: "1px solid #eee",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <Button
                onClick={handleSubmit}
                fullWidth
                variant="contained"
                disabled={loading}
              >
                {loading ? "Processing..." : "Purchase"}
              </Button>

              <Button
                fullWidth
                color="inherit"
                onClick={() => {
                  setShowCard(false);
                  setCardData(null);
                  setDisplayRazorpay(false);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>

        <RazorpayCheckout
          keyId={import.meta.env.VITE_RAZORPAY_KEY_ID}
          orderId={orderDetails.orderId}
          currency={orderDetails.currency}
          amount={orderDetails.amount}
          displayRazorpay={displayRazorpay}
          setDisplayRazorpay={setDisplayRazorpay}
          onSuccess={onPaymentSuccess}
          onFailure={() => toast("Payment cancelled")}
        />
      </div>
    </div>
  );
}

export default withAuth(StudentPlan, ROLE_STUDENT);
