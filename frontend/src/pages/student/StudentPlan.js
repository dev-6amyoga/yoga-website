import { Input, Modal, Spacer } from "@geist-ui/core";
import { Alert } from "@mui/material";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  USER_PLAN_ACTIVE,
  USER_PLAN_STAGED,
} from "../../enums/user_plan_status";
import useUserStore from "../../store/UserStore";
import { Fetch, FetchRetry } from "../../utils/Fetch";
import calculateTotalPrice from "../../utils/calculateTotalPrice";
import getFormData from "../../utils/getFormData";
import RenderRazorpay from "./RenderRazorpay";
import Pricing from "./components/Pricing";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import { ROLE_STUDENT } from "../../enums/roles";
import { withAuth } from "../../utils/withAuth";
import Hero from "./components/Hero";

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
  let user = useUserStore((state) => state.user);
  const [allPlans, setAllPlans] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const navigate = useNavigate();
  const [showCustomCard, setShowCustomCard] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [customCardData, setCustomCardData] = useState(null);
  const [price, setPrice] = useState(0);
  const [discountCouponApplied, setDiscountCouponApplied] = useState(false);
  const [discountCoupon, setDiscountCoupon] = useState(null);
  const [displayRazorpay, setDisplayRazorpay] = useState(false);
  const [orderDetails, setOrderDetails] = useState({
    orderId: null,
    currency: null,
    amount: null,
  });
  const [myPlans, setMyPlans] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [validityFromDate, setValidityFromDate] = useState("");
  const [currencies, setAllCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(1);
  const [planId, setPlanId] = useState(-1);
  const [toBeRegistered, setToBeRegistered] = useState({});
  const [invalidCountry, setInvalidCountry] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formattedDate, setFormattedDate] = useState(new Date().toISOString());
  const [customPlanSent, setCustomPlanSent] = useState(false);
  const [customPlansForUser, setCustomPlansForUser] = useState([]);
  const [currentCustomUserPlans, setCurrentCustomUserPlans] = useState([]);
  const [trialPlanAvailed, setTrialPlanAvailed] = useState(false);
  useEffect(() => {
    if (showCard) {
      setLoading(false);
    }
  }, [showCard]);
  const calculateEndDate = (validityDays) => {
    const endDate = new Date(validityFromDate);
    endDate.setUTCDate(endDate.getUTCDate() + validityDays);
    return endDate.toISOString();
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
  const getEndDate = (userPlan) => {
    var updatedValidityString = "";
    if (userPlan.length === 0) {
      setCurrentStatus(USER_PLAN_ACTIVE);
      var today = new Date();
      updatedValidityString = today?.toISOString();
    } else if (userPlan.length === 1) {
      setCurrentStatus(USER_PLAN_STAGED);
      var validityDate = new Date(userPlan[0].validity_to);
      validityDate.setDate(validityDate.getDate() + 1);
      updatedValidityString = validityDate?.toISOString();
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
      }
    }
    return updatedValidityString;
  };
  const fetchUserPlans = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "/user-plan/get-user-plan-by-id",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: { user_id: user?.user_id },
      });
      const data = response.data;
      console.log(data, "huhuuhuhu");
      data.userPlan.sort(
        (a, b) => new Date(a.validity_to) - new Date(b.validity_to)
      );
      for (var j = 0; j !== data["userPlan"].length; j++) {
        if (data["userPlan"][j].plan.name === "Trial Plan") {
          setTrialPlanAvailed(true);
          break;
        }
      }
      if (data?.userPlan.length !== 0) {
        const filteredPlans = data.userPlan.filter(
          (plan) => plan.institute_id === null
        );
        setMyPlans(filteredPlans);
        if (data["userPlan"].length > 1) {
          for (var j = 0; j !== data["userPlan"].length; j++) {
            if (
              data["userPlan"][j].current_status === "ACTIVE" &&
              data["userPlan"][j].institute_id === null
            ) {
              setPlanId(data["userPlan"][j]["plan_id"]);
              break;
            }
          }
        } else {
          if (
            data["userPlan"][0].current_status === "ACTIVE" &&
            data["userPlan"][0].institute_id === null
          ) {
            setPlanId(data["userPlan"][0]["plan_id"]);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [user, formattedDate]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await Fetch({
          url: `/customPlan/getCustomPlansByUser/${user.user_id}`,
          method: "GET",
        });
        if (res.status === 200) {
          if (res.data.plans?.length > 0) {
            setCustomPlansForUser(res.data.plans);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);
  const fetchCustomUserPlans = async () => {
    try {
      const res = await Fetch({
        url: `/customUserPlan/getCustomUserPlansByUser/${user.user_id}`,
        token: true,
        method: "GET",
      });
      if (res.status === 200) {
        if (res.data.plans) {
          setCurrentCustomUserPlans(
            res.data.plans.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (user) {
      fetchCustomUserPlans();
    }
  }, [user]);
  const fetchPlans = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "/plan/get-all-student-plans",
      });
      const filteredPlans = response.data?.plans?.filter(
        (plan) => plan.plan_user_type === "STUDENT"
      );
      setAllPlans(filteredPlans);
    } catch (error) {
      toast("Error fetching plans", { type: "error" });
    }
  }, []);
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
      if (showCustomCard) {
        isCustom = true;
      } else if (showCard) {
        isCustom = false;
      }
      const res = await Fetch({
        url: "/discount-coupon/check-plan-mapping",
        method: "POST",
        token: true,
        data: {
          coupon_name: discount_coupon,
          is_custom_plan: isCustom,
          plan_id: isCustom ? customCardData._id : cardData.plan_id,
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
  useEffect(() => {
    const fetchData = async () => {
      const order_id = `ord_${toBeRegistered.user_id}_${toBeRegistered.validity_from}`;
      FetchRetry({
        url: "/payment/commit",
        method: "POST",
        token: true,
        data: {
          user_id: toBeRegistered.user_id,
          status: "successful",
          payment_for: "user_plan",
          payment_method: "manual",
          amount: toBeRegistered.amount,
          signature: "n/a",
          order_id: order_id, //may be unique, check again
          payment_id: "n/a",
          currency_id: 1,
          discount_coupon_id: toBeRegistered.discount_coupon_id,
        },
        n: 10,
        retryDelayMs: 2000,
        onRetry: (err) => {
          console.log(err);
        },
      })
        .then((res) => {
          if (res.status === 200) {
            registerUserPlan(order_id);
          }
        })
        .catch((err) => {
          toast(
            "Something went wrong, try again. Any money debited will be refunded in 5-7 business days.",
            { type: "error" }
          );
        });
    };
    if (Object.keys(toBeRegistered).length !== 0) {
      if (toBeRegistered.amount === 0) {
        fetchData();
      }
    }
  }, [toBeRegistered]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    let t = false;
    if (t) {
      return;
    }
    if (!user) {
      toast("Please login to continue", { type: "error" });
      return;
    }
    if (!cardData) {
      if (!customCardData) {
        toast("Please select a plan to continue", { type: "error" });
        return;
      }
    }
    if (!selectedCurrency || !selectedCurrencyId) {
      toast("Please select a currency to continue", { type: "error" });
      return;
    }
    if (customCardData) {
      let userPlanData = {
        cancellation_date: null,
        auto_renewal_enabled: false,
        user_id: user?.user_id,
        plan_id: customCardData?._id,
        purchase_date: formattedDate,
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
        user_type: "STUDENT",
        validity_from: customCardData.validity_from,
        validity_to: customCardData.validity_to,
        custom_plan: true,
        current_status: customCardData.current_status,
      };
      setToBeRegistered(userPlanData);
      if (userPlanData.amount === 0) {
        setToBeRegistered(userPlanData);
      } else {
        try {
          const response = await Fetch({
            url: "/payment/order",
            method: "POST",
            data: userPlanData,
            token: true,
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
              setLoading(true);
            }
          } else {
            toast(response.data?.message);
          }
        } catch (error) {
          toast("Error setting up order, try again", {
            type: "error",
          });
        }
      }
    } else if (cardData) {
      let userPlanData = {
        cancellation_date: null,
        auto_renewal_enabled: false,
        user_id: user?.user_id,
        plan_id: cardData?.plan_id,
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
        user_type: "STUDENT",
      };
      if (planId !== -1) {
        if (currentStatus !== USER_PLAN_ACTIVE) {
          toast(
            "You have an active plan! If you purchase a new plan, it will be staged."
          );
        }
        const validityToDate = calculateEndDate(cardData.plan_validity_days);
        userPlanData.purchase_date = formattedDate;
        userPlanData.validity_from = validityFromDate;
        userPlanData.validity_to = validityToDate;
        userPlanData.current_status = currentStatus;
        setShowCard(false);
        setToBeRegistered(userPlanData);
      } else {
        userPlanData.purchase_date = formattedDate;
        userPlanData.validity_from = formattedDate;
        userPlanData.validity_to = calculateEndDate(
          cardData.plan_validity_days
        );
        userPlanData.current_status = USER_PLAN_ACTIVE;
        setToBeRegistered(userPlanData);
      }
      if (userPlanData.amount === 0) {
        setToBeRegistered(userPlanData);
      } else {
        try {
          const response = await Fetch({
            url: "/payment/order",
            method: "POST",
            data: userPlanData,
            token: true,
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
              setLoading(true);
            }
          } else {
            toast(response.data?.message);
          }
        } catch (error) {
          toast("Error setting up order, try again", {
            type: "error",
          });
        }
      }
    }
  };
  const subscribePlan = async (data) => {
    if (data.plan) {
      toast("Sending enquiry!");
      let finalData = {};
      const selectedNeeds = data.selectedNeeds;
      const otherNeed = data.otherNeed;
      finalData["user"] = user;
      finalData["selectedNeeds"] = selectedNeeds;
      finalData["otherNeed"] = otherNeed;
      const res = await Fetch({
        url: "/plan/custom-plan-enquiry",
        method: "POST",
        data: finalData,
      });
      if (res.status === 200) {
        toast(res.data.message);
        setCustomPlanSent(true);
      }
      return;
    }
    if (data.plan_name) {
      try {
        let finalCustomCardData = { ...data };
        const relevantPlans = currentCustomUserPlans.filter(
          (plan) =>
            plan.custom_plan_id === finalCustomCardData?._id &&
            (plan.current_status === USER_PLAN_ACTIVE ||
              plan.current_status === USER_PLAN_STAGED)
        );
        if (relevantPlans.length > 0) {
          const existingPlan = relevantPlans.reduce(
            (latestPlan, currentPlan) => {
              const latestValidityTo = new Date(latestPlan.validity_to);
              const currentValidityTo = new Date(currentPlan.validity_to);
              return currentValidityTo > latestValidityTo
                ? currentPlan
                : latestPlan;
            }
          );
          const existingValidityFrom = new Date(existingPlan.validity_to);
          finalCustomCardData.validity_from =
            existingValidityFrom.toISOString();
          const newValidityTo = new Date(existingValidityFrom);
          newValidityTo.setDate(
            newValidityTo.getDate() + (data.planValidity || 0)
          );
          finalCustomCardData.validity_to = newValidityTo.toISOString();
          finalCustomCardData.current_status = USER_PLAN_STAGED;
        } else {
          finalCustomCardData.validity_from = new Date().toISOString();
          const validityToDate = new Date(finalCustomCardData.validity_from);
          validityToDate.setDate(
            validityToDate.getDate() + (data.planValidity || 0)
          );
          finalCustomCardData.validity_to = validityToDate.toISOString();
          finalCustomCardData.current_status = USER_PLAN_ACTIVE;
        }
        setCustomCardData(finalCustomCardData);
        setShowCustomCard(true);
        setDiscountCouponApplied(false);
        setDiscountCoupon(null);
        const selectedPricing = Number(data.prices[0][selectedCurrencyId]);
        setPrice(selectedPricing);
      } catch (error) {
        console.error("Error processing plan data:", error);
      }
    } else {
      setShowCard(true);
      setCardData(data);
      setDiscountCouponApplied(false);
      setDiscountCoupon(null);
      const pricing = data.pricing.find(
        (p) => p.currency.short_tag === selectedCurrency
      );
      setPrice(pricing.denomination);
    }
  };
  const downloadInvoice = async (response) => {
    try {
      const dataBuffer = new Blob([response.data], {
        type: "text/html;charset=utf-8;",
      });
      const htmlString = await dataBuffer.text();
      var opt = {
        margin: 0.25,
        image: { type: "png", quality: 1 },
        html2canvas: { scale: 0.85 },
        jsPDF: {
          unit: "in",
          format: "A4",
          orientation: "portrait",
        },
      };
      const doc = html2pdf()
        .set(opt)
        .from(htmlString)
        .toPdf()
        .save("6AMYOGA_plan_purchase.pdf");
    } catch (err) {
      toast(err);
      console.error(err);
    }
  };
  const registerUserPlan = async (order_id) => {
    if (toBeRegistered.custom_plan) {
      let finalUserPlan = { ...toBeRegistered };
      finalUserPlan.transaction_order_id = order_id;
      finalUserPlan.user_type = "STUDENT";
      finalUserPlan.institute_id = null;
      FetchRetry({
        url: "/customUserPlan/register",
        method: "POST",
        token: true,
        data: finalUserPlan,
        n: 5,
      })
        .then((response) => {
          if (response?.status === 200) {
            toast("Plan subscribed successfully", {
              type: "success",
            });
            FetchRetry({
              url: "/invoice/student/mail-invoice",
              method: "POST",
              data: JSON.stringify({
                user_id: finalUserPlan.user_id,
                transaction_order_id: order_id,
                plan_type: "CUSTOM_PLAN",
              }),
              n: 2,
              retryDelayMs: 2000,
            })
              .then((responseInvoice) => {
                if (responseInvoice.status === 200) {
                  toast("Invoice generated successfully", {
                    type: "success",
                  });
                }
                return downloadInvoice(responseInvoice);
              })
              .then(async (res) => {
                const res1 = await Fetch({
                  url: "/invoice/student/notify-admin",
                  method: "POST",
                  token: true,
                  data: {
                    user_id: finalUserPlan.user_id,
                    transaction_order_id: order_id,
                    plan_type: "CUSTOM_PLAN",
                  },
                });
                setShowCustomCard(false);
                setCustomCardData(null);
                setLoading(false);
                navigate("/student/playlist-view");
              })
              .catch((error) => {
                setShowCustomCard(false);
                setCustomCardData(null);
                setLoading(false);
                toast(
                  "Error downloading invoice; Download invoice in Transaction History",
                  { type: "error" }
                );
              });
            setShowCustomCard(false);
            setCustomCardData(null);
            setLoading(false);
            fetchCustomUserPlans();
          } else {
            toast(response?.data?.message);
            setShowCustomCard(false);
            setCustomCardData(null);
            setLoading(false);
            fetchCustomUserPlans();
          }
        })
        .catch((err) => {
          console.log(err);
          toast(
            "Error subscribing plan; Incase money has been debited from your account, it will be refunded within 4 to 5 business days! Please try again!",
            { type: "error" }
          );
          setShowCustomCard(false);
          setCustomCardData(null);
          setLoading(false);
          fetchCustomUserPlans();
        });

      return;
    }
    let finalUserPlan = { ...toBeRegistered };
    finalUserPlan.transaction_order_id = order_id;
    finalUserPlan.user_type = "STUDENT";
    finalUserPlan.institute_id = null;
    FetchRetry({
      url: "/user-plan/register",
      method: "POST",
      token: true,
      data: finalUserPlan,
      n: 5,
      retryDelayMs: 2000,
    })
      .then((response) => {
        if (response?.status === 200) {
          toast("Plan subscribed successfully", { type: "success" });
          FetchRetry({
            url: "/invoice/student/mail-invoice",
            method: "POST",
            data: JSON.stringify({
              user_id: finalUserPlan.user_id,
              transaction_order_id: order_id,
            }),
            n: 2,
            retryDelayMs: 2000,
          })
            .then((responseInvoice) => {
              if (responseInvoice.status === 200) {
                toast("Invoice mailed successfully", {
                  type: "success",
                });
              }
              return downloadInvoice(responseInvoice);
            })
            .then(async (res) => {
              const res1 = await Fetch({
                url: "/invoice/student/notify-admin",
                method: "POST",
                token: true,
                data: {
                  user_id: finalUserPlan.user_id,
                  transaction_order_id: order_id,
                },
              });
              setShowCard(false);
              setCardData(null);
              setLoading(false);
            })
            .catch((error) => {
              setShowCard(false);
              setCardData(null);
              toast(
                "Error mailing invoice; Download invoice in Transaction History",
                { type: "error" }
              );
              setLoading(false);
            });
          fetchUserPlans();
        } else {
          toast(response?.data?.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        toast(
          "Error subscribing plan; Incase money has been debited from your account, it will be refunded within 4 to 5 business days! Please try again!",
          { type: "error" }
        );
      });
  };
  const registerErrorCallback = () => {
    setShowCard(false);
    setCardData(null);
  };
  useEffect(() => {
    if (user) {
      fetchUserPlans();
    }
  }, [user, fetchUserPlans]);
  useEffect(() => {
    setValidityFromDate(getEndDate(myPlans));
  }, [myPlans]);
  useEffect(() => {
    fetchPlans();
    fetchCurrencies();
  }, [fetchPlans, fetchCurrencies]);
  const continentNames = {
    AF: "Africa",
    AN: "Antarctica",
    AS: "Asia",
    EU: "Europe",
    NA: "North America",
    OC: "Oceania",
    SA: "South America",
  };
  const continentCurrencyMap = {
    Asia: "INR",
    Africa: "USD",
    Antarctica: "USD",
    Europe: "EUR",
    Oceania: "USD",
    "South America": "USD",
    "North America": "USD",
  };
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (!continentNames[data.continent_code]) {
          toast("Currency not available for your country", {
            type: "error",
          });
          setSelectedCurrency("USD");
        } else {
          if (continentNames[data.continent_code] === "Asia") {
            const southAsia = [
              "Afghanistan",
              "Bangladesh",
              "Bhutan",
              "India",
              "Maldives",
              "Nepal",
              "Pakistan",
              "Vietnam",
              "Sri Lanka",
            ];
            if (southAsia.includes(data.country_name)) {
              setSelectedCurrency("INR");
            } else {
              setSelectedCurrency("USD");
            }
          } else {
            setSelectedCurrency(
              continentCurrencyMap[continentNames[data.continent_code]]
            );
          }
        }
      })
      .catch((err) => {
        setSelectedCurrency("USD");
      });
  }, []);
  const [filteredPlans, setFilteredPlans] = useState([]);
  useEffect(() => {
    if (trialPlanAvailed) {
      setFilteredPlans(allPlans.filter((x) => x.name !== "Trial Plan"));
    } else {
      setFilteredPlans(allPlans);
    }
  }, [trialPlanAvailed, allPlans]);
  return (
    <div className="max-w-7xl mx-auto">
      <StudentNavMUI />
      <Hero heading="Plans" />
      <div className="mx-auto max-w-7xl">
        {planId === -1 && currentCustomUserPlans.length === 0 ? (
          <Alert variant="outlined" severity="info">
            Please purchase a subscription to unlock all features!
          </Alert>
        ) : (
          <Alert variant="outlined" severity="info">
            Plan is currently active.
          </Alert>
        )}
      </div>
      <Spacer h={2} />
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

      {currentCustomUserPlans && currentCustomUserPlans.length > 0 && (
        <div className="mx-auto max-w-7xl">
          <h4>Custom Plan History</h4>

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
                  {/* <TableCell>Status</TableCell> */}
                </TableRow>
              </TableHead>
              {/* customPlansForUser */}
              <TableBody>
                {currentCustomUserPlans?.map((row) => (
                  <TableRow
                    key={row?.custom_plan_id}
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {customPlansForUser.find(
                        (obj) => obj._id === row?.custom_plan_id
                      )?.plan_name || "Plan not found"}
                    </TableCell>
                    <TableCell>
                      {row?.validity_from
                        ? new Date(row?.validity_from).toLocaleDateString(
                            "en-GB"
                          )
                        : ""}
                    </TableCell>
                    <TableCell>
                      {row?.validity_to
                        ? new Date(row?.validity_to).toLocaleDateString("en-GB")
                        : ""}
                    </TableCell>
                    {/* <TableCell>{row?.current_status}</TableCell> */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

      <div className="w-full flex flex-col items-center justify-center pt-4 ">
        {customPlansForUser.length > 0 && (
          <Pricing
            heading="Personalized Plans"
            allPlans={customPlansForUser}
            subscribePlan={subscribePlan}
            selectedCurrency={selectedCurrency}
          />
        )}
      </div>
      {customPlanSent && (
        <p
          className={
            "text-sm border p-2 rounded-lg text-zinc-500 border-red-500"
          }
        >
          Your request has been recorded! Our admin will reach out to you within
          24 hours.
        </p>
      )}

      <div className="flex flex-col items-center justify-center pt-4">
        {invalidCountry ? (
          <Alert variant="outlined" severity="warning">
            6AM Yoga is unavailable in your country right now! We are working on
            making it available soon!
          </Alert>
        ) : (
          <Pricing
            heading="Standard Subscriptions"
            allPlans={filteredPlans}
            subscribePlan={subscribePlan}
            selectedCurrency={selectedCurrency}
          />
        )}

        <Divider />

        <Modal
          visible={showCustomCard}
          onClose={() => setShowCustomCard(false)}
        >
          <Modal.Content>
            {customCardData ? (
              <>
                <h3>{customCardData.plan_name}</h3>

                <Divider />
                <Spacer />
                <p>
                  <strong>Price</strong>
                  <br />
                  {customCardData ? (
                    <>
                      <span>{selectedCurrency}</span> <span>{price}</span>{" "}
                      {discountCouponApplied ? (
                        <span className="text-green-600">
                          - {(price * discountCoupon.discount_percentage) / 100}
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
                      <span className="font-medium">Plan Start Date</span>
                      <span className="text-center">
                        {new Date(
                          customCardData.validity_from
                        ).toLocaleString()}
                      </span>
                    </p>

                    <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                      <span className="font-medium">Plan End Date</span>
                      <span className="text-center">
                        {new Date(customCardData.validity_to).toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                    <span className="font-medium">Watch Hours Limit</span>
                    <span className="text-center">
                      <>{customCardData?.watchHours} Hours</>
                    </span>
                  </p>
                </div>
                <Spacer />
                <Divider />
                <Spacer />
                <Button
                  onClick={handleSubmit}
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "..." : "Purchase"}
                </Button>
              </>
            ) : (
              <></>
            )}
          </Modal.Content>
          <Modal.Action
            onClick={() => {
              setShowCard(false);
              setCardData(null);
              setDisplayRazorpay(false);
            }}
          >
            Close
          </Modal.Action>
        </Modal>

        <Modal visible={showCard} onClose={() => setShowCard(false)}>
          <Modal.Content>
            {cardData ? (
              <>
                <h3>{cardData.name}</h3>

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
                          - {(price * discountCoupon.discount_percentage) / 100}
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
                      <span className="font-medium">Plan Start Date</span>
                      <span className="text-center">
                        {new Date(validityFromDate).toLocaleString()}
                      </span>
                    </p>

                    <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                      <span className="font-medium">Plan End Date</span>
                      <span className="text-center">
                        {new Date(
                          calculateEndDate(cardData.plan_validity_days)
                        ).toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
                    <span className="font-medium">Watch Hours Limit</span>
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
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? "..." : "Purchase"}
                </Button>
              </>
            ) : (
              <></>
            )}
          </Modal.Content>
          <Modal.Action
            onClick={() => {
              setShowCard(false);
              setCardData(null);
              setDisplayRazorpay(false);
            }}
          >
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
        redirectUrl={"/student"}
        onSuccessCallback={registerUserPlan}
        onErrorCallback={registerErrorCallback}
        displayRazorpay={displayRazorpay}
        setDisplayRazorpay={setDisplayRazorpay}
        discount_coupon_id={
          discountCouponApplied ? discountCoupon?.discount_coupon_id : null
        }
      />
    </div>
  );
}

export default withAuth(StudentPlan, ROLE_STUDENT);
