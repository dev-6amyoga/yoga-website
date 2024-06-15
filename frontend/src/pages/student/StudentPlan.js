import { Input, Modal, Spacer } from "@geist-ui/core";
import { Alert } from "@mui/material";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
	USER_PLAN_ACTIVE,
	USER_PLAN_EXPIRED_BY_DATE,
	USER_PLAN_EXPIRED_BY_USAGE,
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
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import { ROLE_STUDENT } from "../../enums/roles";
import { withAuth } from "../../utils/withAuth";
import Hero from "./components/Hero";

const allowedCountriesCurrencyMap = {
	IND: "INR",
	USA: "USD",
	AUT: "EUR",
	BEL: "EUR",
	HRV: "EUR",
	CYP: "EUR",
	EST: "EUR",
	FIN: "EUR",
	FRA: "EUR",
	DEU: "EUR",
	GRC: "EUR",
	IRL: "EUR",
	ITA: "EUR",
	LVA: "EUR",
	LTU: "EUR",
	LUX: "EUR",
	MLT: "EUR",
	NLD: "EUR",
	PRT: "EUR",
	SVK: "EUR",
	SVN: "EUR",
	ESP: "EUR",
};

function DiscountCouponForm({ handleDiscountCouponFormSubmit }) {
	return (
		<form
			className="flex items-end gap-1"
			onSubmit={handleDiscountCouponFormSubmit}>
			<Input width="100%" name="discount_coupon">
				<strong>Discount Coupon</strong>
			</Input>
			<Button htmlType="submit" scale={0.8} width="35%">
				Apply
			</Button>
		</form>
	);
}

function StudentPlan() {
	let user = useUserStore((state) => state.user);
	const [allPlans, setAllPlans] = useState([]);
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

	const [myPlans, setMyPlans] = useState([]);
	const [currentStatus, setCurrentStatus] = useState("");
	const [validityFromDate, setValidityFromDate] = useState("");
	// const [selectedValidity, setSelectedValidity] = useState(30);

	const [currencies, setAllCurrencies] = useState([]);
	const [selectedCurrency, setSelectedCurrency] = useState("INR");
	const [selectedCurrencyId, setSelectedCurrencyId] = useState(1);

	const [planId, setPlanId] = useState(-1);
	const [toBeRegistered, setToBeRegistered] = useState({});

	const [invalidCountry, setInvalidCountry] = useState(false);

	const [loading, setLoading] = useState(false);

	const today = new Date();
	const formattedDate = today?.toISOString();

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
			// console.log("New plan starts from date:", updatedValidityString);
		} else if (userPlan.length === 1) {
			setCurrentStatus(USER_PLAN_STAGED);
			var validityDate = new Date(userPlan[0].validity_to);
			validityDate.setDate(validityDate.getDate() + 1);
			updatedValidityString = validityDate?.toISOString();
			// console.log("New plan validity from date:", updatedValidityString);
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
				// console.log(
				// 	"New plan validity from date:",
				// 	updatedValidityString
				// );
			} else {
				// console.log("No valid validity_to dates found.");
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

			// console.log({ planzzzzzzz: data });

			if (data?.userPlan.length !== 0) {
				const filteredPlans = data.userPlan.filter(
					(plan) => plan.institute_id === null
				);
				setMyPlans(filteredPlans);
				for (var i = 0; i !== data?.userPlan.length; i++) {
					if (data?.userPlan[i].validity_to < formattedDate) {
						if (
							data?.userPlan[i].current_status !==
								USER_PLAN_EXPIRED_BY_DATE &&
							data?.userPlan[i].current_status !==
								USER_PLAN_EXPIRED_BY_USAGE
						) {
							const updatedUserPlanData = {
								...data?.userPlan[i],
								current_status: "EXPIRED_BY_DATE",
							};
							try {
								const response = await Fetch({
									url: "/user-plan/update-user-plan",
									method: "PUT",
									data: updatedUserPlanData,
								});

								if (response.status !== 200) {
									const errorMessage = response.data;
									throw new Error(errorMessage.error);
								}
							} catch (error) {
								toast(
									error?.message || "Error updating user plan"
								);
							}
						}
					}
				}

				// set current plan id if plan is active
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
					// set current plan id if plan is active
					if (
						data["userPlan"][0].current_status === "ACTIVE" &&
						data["userPlan"][0].institute_id === null
					) {
						setPlanId(data["userPlan"][0]["plan_id"]);
					} else {
						// toast(
						// 	"You don't have a plan yet! Purchase one to continue"
						// );
					}
				}
			} else {
				// toast("You don't have a plan yet! Purchase one to continue");
			}
		} catch (error) {
			// console.log(error);
		}
	}, [user, formattedDate]);

	// get all student plans
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
			// console.log(error);
		}
	}, []);

	const fetchCurrencies = useCallback(async () => {
		try {
			const response = await Fetch({
				url: "/currency/get-all",
			});

			setAllCurrencies(response?.data?.currencies);
			// console.log("Fetching currencies");
		} catch (error) {
			toast("Error fetching plans", { type: "error" });
			// console.log(error);
		}
	}, []);

	const validateDiscountCoupon = async (discount_coupon) => {
		if (!discount_coupon) {
			return new Error("Invalid discount coupon");
		}

		// if (discountCoupon && discountCoupon.coupon_name === discount_coupon) {
		// 	toast("Coupon already applied", { type: "error" });
		// 	return null;
		// }
		// return new Error("Invalid discount coupon");
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
				// console.log(res.data);
				setDiscountCoupon(res.data.discount_coupon);
				setDiscountCouponApplied(true);
				return null;
			}
			return new Error("Invalid discount coupon");
		} catch (err) {
			// console.log(err);
			return new Error("Invalid discount coupon");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

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

			// validity will start from the end of the previous plan
			const validityTo = new Date(validityFromDate);
			validityTo.setDate(
				validityTo.getDate() + cardData.plan_validity_days
			);
			const validityToDate = validityTo?.toISOString();

			console.log({ validityFromDate, validityToDate });
			userPlanData.purchase_date = formattedDate;
			userPlanData.validity_from = validityFromDate;
			userPlanData.validity_to = validityToDate;
			userPlanData.current_status = currentStatus;

			setShowCard(false);
			setToBeRegistered(userPlanData);
		} else {
			// TODO : referral code
			userPlanData.purchase_date = formattedDate;
			userPlanData.validity_from = formattedDate;
			userPlanData.validity_to = calculateEndDate(
				cardData.plan_validity_days
			);
			userPlanData.current_status = USER_PLAN_ACTIVE;

			setToBeRegistered(userPlanData);
		}

		try {
			// console.log("BUYING : ", userPlanData);
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
			// console.log(error);
			toast("Error setting up order, try again", { type: "error" });
		}
	};

	const subscribePlan = async (data) => {
		setShowCard(true);
		setCardData(data);
		setDiscountCouponApplied(false);
		setDiscountCoupon(null);
		const pricing = data.pricing.find(
			(p) => p.currency.short_tag === selectedCurrency
		);
		setPrice(pricing.denomination);
	};

	const registerUserPlan = async (order_id) => {
		const finalUserPlan = { ...toBeRegistered };
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
				// console.log({ response });
				if (response?.status === 200) {
					toast("Plan subscribed successfully", { type: "success" });

					//invoice download here!! order_id, toBeRegistered.user_id

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
							setShowCard(false);
							setCardData(null);
							setLoading(false);
						})
						.catch((error) => {
							// console.log(error);
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
				// console.log(error);
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

	// Staging plan validity from date
	useEffect(() => {
		setValidityFromDate(getEndDate(myPlans));
	}, [myPlans]);

	// on mount get student plans & currencies
	useEffect(() => {
		fetchPlans();
		fetchCurrencies();
	}, [fetchPlans, fetchCurrencies]);

	const handleCurrencyChange = (val) => {
		setSelectedCurrency(val);
		setSelectedCurrencyId(
			currencies.find((x) => x.short_tag === val)?.currency_id || null
		);
	};

	useEffect(() => {
		fetch("https://ipapi.co/json/")
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				const cc = data.country_code_iso3;

				if (allowedCountriesCurrencyMap[cc]) {
					setSelectedCurrency(allowedCountriesCurrencyMap[cc]);
				} else {
					toast("Currency not available for your country", {
						type: "error",
					});
					setInvalidCountry(true);
				}
			})
			.catch((err) => {
				// console.log(err);
				setInvalidCountry(true);
			});
	}, []);

	return (
		<>
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

			<Spacer h={2} />

			{myPlans && myPlans.length > 0 && (
				<div className="mx-auto max-w-7xl">
					<h4>Plan History</h4>

					<TableContainer component={Paper} sx={{ margin: "2rem 0" }}>
						<Table sx={{ minWidth: 650 }} aria-label="simple table">
							<TableHead
								sx={{
									bgcolor:
										"linear-gradient(#033363, #021F3B)",
								}}>
								<TableRow>
									<TableCell>Plan Name</TableCell>
									<TableCell>Validity From</TableCell>
									<TableCell>Validity To</TableCell>
									<TableCell>Status</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{myPlans.map((row) => (
									<TableRow
										key={row?.id}
										sx={{
											"&:last-child td, &:last-child th":
												{ border: 0 },
										}}>
										<TableCell component="th" scope="row">
											{row?.plan.name}
										</TableCell>
										<TableCell>
											{row?.validity_from
												? new Date(
														row?.validity_from
													).toDateString()
												: ""}
										</TableCell>
										<TableCell>
											{row?.validity_to
												? new Date(
														row?.validity_to
													).toDateString()
												: ""}
										</TableCell>
										<TableCell>
											{row?.current_status}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</div>
			)}

			<div className="mx-auto flex max-w-7xl flex-col items-center justify-center pt-4">
				{invalidCountry ? (
					<Alert variant="outlined" severity="warning">
						6AM Yoga is unavailable in your country right now! We
						are working on making it available soon!
					</Alert>
				) : (
					<Pricing
						allPlans={allPlans}
						subscribePlan={subscribePlan}
						selectedCurrency={selectedCurrency}
					/>
				)}

				<Divider />

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
											<span>{selectedCurrency}</span>{" "}
											<span>{price}</span>{" "}
											{discountCouponApplied ? (
												<span className="text-green-600">
													-{" "}
													{(price *
														discountCoupon.discount_percentage) /
														100}
												</span>
											) : (
												<></>
											)}{" "}
											{selectedCurrency === "INR" ? (
												<span>+ 18% GST</span>
											) : (
												<></>
											)}{" "}
											{selectedCurrency === "INR" ||
											discountCouponApplied ? (
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
													Coupon Applied :{" "}
													{discountCoupon.coupon_name}{" "}
													|{" "}
													{
														discountCoupon?.discount_percentage
													}
													{"%"}
													OFF
													<button
														className="mx-2 rounded-full border-0 bg-red-500 px-1"
														onClick={() => {
															setDiscountCouponApplied(
																false
															);
															setDiscountCoupon(
																null
															);
														}}>
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
											<span className="font-medium">
												Plan Start Date
											</span>
											<span className="text-center">
												{new Date(
													validityFromDate
												).toLocaleString()}
											</span>
										</p>

										<p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
											<span className="font-medium">
												Plan End Date
											</span>
											<span className="text-center">
												{new Date(
													calculateEndDate(
														cardData.plan_validity_days
													)
												).toLocaleString()}
											</span>
										</p>
									</div>

									<p className="flex flex-1 flex-col items-center rounded-lg border p-2 text-sm">
										<span className="font-medium">
											Watch Hours Limit
										</span>
										<span className="text-center">
											{cardData?.watch_time_limit <
											3600 ? (
												<>
													{cardData?.watch_time_limit /
														60}{" "}
													Minutes
												</>
											) : (
												<>
													{cardData?.watch_time_limit /
														3600}{" "}
													Hours
												</>
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
									disabled={loading}>
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
						}}>
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
			/>
		</>
	);
}

export default withAuth(StudentPlan, ROLE_STUDENT);

// import * as React from "react";

// import CssBaseline from "@mui/material/CssBaseline";
// import { ThemeProvider, createTheme } from "@mui/material/styles";
// import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
// import Hero from "./components/Hero";
// import Pricing from "./components/Pricing";

// export default function StudentPlan() {
// 	const [mode, setMode] = React.useState("light");
// 	const defaultTheme = createTheme({ palette: { mode } });

// 	return (
// 		<ThemeProvider theme={defaultTheme}>
// 			<CssBaseline />
// 			<StudentNavMUI />
// 			<Hero heading="Plans and Pricing" />
// 			<Pricing />
// 		</ThemeProvider>
// 	);
// }
