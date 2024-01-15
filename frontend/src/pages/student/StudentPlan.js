import {
    Button,
    ButtonGroup,
    Card,
    Divider,
    Grid,
    Input,
    Select,
    Table,
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
    const [selectedPlan, setSelectedPlan] = useState({});
    const [displayRazorpay, setDisplayRazorpay] = useState(false);
    const [orderDetails, setOrderDetails] = useState({
        orderId: null,
        currency: null,
        amount: null,
    });
    const [selectedValidity, setSelectedValidity] = useState(30);
    const [selectedCurrency, setSelectedCurrency] = useState(1);
    const [allCurrencies, setAllCurrencies] = useState([]);

    const formattedDate = new Date().toDateString();

    const calculateEndDate = (validityDays) => {
        const endDate = new Date();
        endDate.setUTCDate(endDate.getUTCDate() + validityDays);
        return endDate;
    };

    const handleValidityChange = (validity) => {
        setSelectedValidity(validity);
    };

    const fetchPlans = useCallback(async () => {
        try {
            const response = await fetch(
                "http://localhost:4000/plan/get-all-student-plans"
            );
            const data = await response.json();
            setAllPlans(data?.plans);
            console.log("Fetching plans");
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
        fetchCurrencies();
    }, [fetchPlans, fetchCurrencies]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userPlanData = {
            amount: 100,
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
            setSelectedPlan(rowData);
        };
        return (
            <Grid.Container gap={0.1}>
                <Grid>
                    <Button
                        type="error"
                        auto
                        scale={1 / 3}
                        font="12px"
                        onClick={subscribePlan}>
                        Purchase
                    </Button>
                </Grid>
            </Grid.Container>
        );
    };

    const registerUserPlan = () => {
        /*
        purchase_date,
        validity_from,
        validity_to,
        cancellation_date,
        auto_renewal_enabled,
        discount_coupon_id,
        referral_code_id,
        user_id,
        plan_id,
        */

        Fetch({
            url: "http://localhost:4000/user-plan/register",
            method: "POST",
            data: {
                user_id: user?.user_id,
                plan_id: selectedPlan?.plan_id,
                purchase_date: new Date(),
                validity_from: new Date(),
                validity_to: calculateEndDate,
            },
        }).then((res) => {
            if (res.status === 200) {
                notify("Plan subscribed successfully", { type: "success" });
            } else {
                notify("Error subscribing plan", { type: "error" });
            }
        });
    };

    return (
        <StudentPageWrapper heading="Plans">
            <Select
                placeholder="Choose currency"
                onChange={(val) => {
                    setSelectedCurrency(val);
                }}>
                {allCurrencies?.map((c) => {
                    return (
                        <Select.Option value={String(c.currency_id)}>
                            {c.name} | {c.short_tag}
                        </Select.Option>
                    );
                })}
            </Select>
            {/* <Button
                onClick={() => {
                    fetchPlans();
                    fetchCurrencies();
                }}>
                Refresh
            </Button> */}
            <div className="flex flex-col items-center justify-center my-20 max-w-7xl">
                <Table data={allPlans} className="bg-white ">
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
                            return data ? data : "0";
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
                        <h4>{selectedPlan.name}</h4>
                        <Divider />
                        <div className="mb-10">
                            <h4>Features:</h4>
                            <ul>
                                <li>
                                    {selectedPlan.has_basic_playlist
                                        ? "Use all yoga playlists curated by 6AM Yoga"
                                        : ""}
                                </li>
                                {selectedPlan.has_playlist_creation &&
                                selectedPlan.playlist_creation_limit ? (
                                    selectedPlan.playlist_creation_limit ===
                                    1000000 ? (
                                        <li>
                                            Create UNLIMITED yoga playlists of
                                            your own, using our asana videos
                                        </li>
                                    ) : (
                                        <li>
                                            {"Create " +
                                                selectedPlan.playlist_creation_limit +
                                                " yoga playlists of your own, using our asana videos"}
                                        </li>
                                    )
                                ) : (
                                    ""
                                )}
                            </ul>
                        </div>
                        <Divider />
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 w-full">
                            <h5>Validity : </h5>
                            {/* later fetch from db */}
                            <ButtonGroup type="warning" ghost>
                                <Button
                                    value={30}
                                    onClick={() => handleValidityChange(30)}
                                    className={
                                        selectedValidity === 30 ? "active" : ""
                                    }>
                                    30 days
                                </Button>
                                <Button
                                    value={60}
                                    onClick={() => handleValidityChange(60)}
                                    className={
                                        selectedValidity === 60 ? "active" : ""
                                    }>
                                    60 days
                                </Button>
                                <Button
                                    value={90}
                                    onClick={() => handleValidityChange(90)}
                                    className={
                                        selectedValidity === 90 ? "active" : ""
                                    }>
                                    90 days
                                </Button>
                                <Button
                                    value={180}
                                    onClick={() => handleValidityChange(180)}
                                    className={
                                        selectedValidity === 180 ? "active" : ""
                                    }>
                                    180 days
                                </Button>
                                <Button
                                    value={365}
                                    onClick={() => handleValidityChange(365)}
                                    className={
                                        selectedValidity === 365 ? "active" : ""
                                    }>
                                    365 days
                                </Button>
                            </ButtonGroup>
                            <Divider />
                            <p> Plan Start Date : {formattedDate}</p>
                            <p>
                                Plan End Date:
                                {calculateEndDate(
                                    selectedValidity
                                ).toDateString()}
                            </p>
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

// auto_renewal_enabled
// created
// updated
