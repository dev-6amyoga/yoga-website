import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import calculateTotalPrice from "../../utils/calculateTotalPrice";
import getFormData from "../../utils/getFormData";
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
  Card,
  CardContent,
  Chip,
  Divider,
  Modal,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InstitutePlansAccordion from "../../components/student/InstitutePlansAccordion";

const INR = "INR";

const formatInr = (amount = 0) =>
  `₹ ${Number(amount || 0).toLocaleString("en-IN")}`;

function DiscountCouponForm({
  handleDiscountCouponFormSubmit,
  disabled = false,
}) {
  return (
    <form
      style={{ display: "flex", gap: 8, alignItems: "flex-start" }}
      onSubmit={handleDiscountCouponFormSubmit}
    >
      <TextField
        fullWidth
        size="small"
        name="discount_coupon"
        label="Discount coupon"
        placeholder="Enter coupon code"
        disabled={disabled}
      />
      <Button
        type="submit"
        variant="outlined"
        disabled={disabled}
        sx={{
          borderColor: "#1f6f5b",
          color: "#1f6f5b",
          minWidth: 92,
          fontWeight: 800,
          textTransform: "none",
          "&:hover": {
            borderColor: "#185846",
            bgcolor: "rgba(31, 111, 91, 0.08)",
          },
        }}
      >
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
  const [selectedCurrency] = useState(INR);
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

    const hasRecentInstitute = myPlans.some((plan) => {
      const from = new Date(plan.validity_from);
      const to = plan.validity_to ? new Date(plan.validity_to) : null;

      // If plan ended after 6 months ago OR is still active
      return (to && to >= sixMonthsAgo) || from >= sixMonthsAgo;
    });
    console.log("Has recent subscription:", hasRecentInstitute);
    setHasRecentInstituteSubscription(hasRecentInstitute);
  }, [myPlans]);

  const getInrPricing = (plan) =>
    plan?.pricing?.find(
      (p) => (p.currency?.short_tag || "").toUpperCase() === INR,
    ) ||
    plan?.pricing?.[0] ||
    null;

  const getDiscountAmount = () =>
    discountCouponApplied && discountCoupon
      ? (price * Number(discountCoupon.discount_percentage || 0)) / 100
      : 0;

  const getPayablePrice = () => Math.max(price - getDiscountAmount(), 0);

  useEffect(() => {
    checkRecentInstituteSubscription();
  }, [myPlans]);

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

    toast("Coupon applied", { type: "success" });
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

      // Filter out 30-day and [1/WK] plans if user doesn't have any plan within last 6 months
      if (!hasRecentInstituteSubscription) {
        filteredPlans = filteredPlans.filter(
          (plan) =>
            !plan.name.includes("1 month") && !plan.name.includes("[1/WK]"),
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
    const pricing = getInrPricing(plan);
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
    if (!cardData?.plan_id) {
      return new Error("Please select a plan before applying a coupon");
    }
    try {
      let isCustom = false;
      const res = await Fetch({
        url: "/discount-coupon/check-plan-mapping",
        method: "POST",
        token: true,
        data: {
          coupon_name: discount_coupon.trim(),
          is_custom_plan: isCustom,
          plan_id: Number(cardData.plan_id),
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

    const appliedCoupon =
      discountCouponApplied && discountCoupon ? discountCoupon : null;
    const amount = calculateTotalPrice(
      price,
      INR,
      true,
      5,
      appliedCoupon,
    );

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
      discount_coupon_id: appliedCoupon?.discount_coupon_id || null,
    };

    const payload = {
      user_id: user.user_id,
      plan_id: selectedPlan.plan_id,
      amount,
      currency: INR,
      discount_coupon_id: appliedCoupon?.discount_coupon_id || null,
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
    const pricing = getInrPricing(data);
    setPrice(pricing?.denomination || 0);
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
    <Box sx={{ bgcolor: "#f7f8fb", minHeight: "100vh" }}>
      <StudentNavMUI />
      <Hero heading="Plans" />

      <Box
        sx={{
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2.5, md: 4 },
        }}
      >
        {planId === -1 ? (
          <Alert variant="outlined" severity="info" sx={{ bgcolor: "#fff" }}>
            Please purchase a subscription to unlock all features.
          </Alert>
        ) : (
          <Alert variant="outlined" severity="success" sx={{ bgcolor: "#fff" }}>
            Plan is currently active.
          </Alert>
        )}
      </Box>
      {myPlans && myPlans.length > 0 && (
        <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, md: 3 } }}>
          <Typography
            component="h2"
            sx={{ color: "#101828", fontSize: 22, fontWeight: 900, mb: 2 }}
          >
            Plan History
          </Typography>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              mb: 3,
              border: "1px solid #dfe5ec",
              borderRadius: 2,
            }}
          >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead
                sx={{
                  bgcolor: "#f2f4f7",
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
                    <TableCell>
                      <Chip
                        label={row?.current_status}
                        size="small"
                        color={
                          row?.current_status === "ACTIVE"
                            ? "success"
                            : "default"
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
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
