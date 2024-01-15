import crypto from "crypto-js";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
import { paymentMethodConfig } from "../../utils/razorpayUtils";
// import PropTypes from "prop-types";
// import Axios from "axios";

const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            // console.log("razorpay loaded successfully");
            resolve(true);
        };
        script.onerror = () => {
            // console.log("error in loading razorpay");
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const RenderRazorpay = ({
    userId,
    keyId,
    keySecret,
    orderId,
    currency,
    amount,
    payment_for,
    redirectUrl,
    displayRazorpay,
    setDisplayRazorpay,
}) => {
    const paymentId = useRef(null);
    const paymentMethod = useRef(null);
    const gateway = useRef(null);
    const navigate = useNavigate();

    const showRazorpay = useCallback(async (options) => {
        const res = await loadScript(
            "https://checkout.razorpay.com/v1/checkout.js"
        );
        if (!res) {
            // console.log("Razorpay SDK failed to load. Are you online?");
            return;
        }
        const rzp = new window.Razorpay(options);

        gateway.current = rzp;

        gateway.current.on("payment.submit", (response) => {
            paymentMethod.current = response.method;
        });

        gateway.current.on("payment.failed", (response) => {
            paymentId.current = response.error.metadata.payment_id;
        });

        gateway.current.open();
    }, []);

    const handlePaymentBackendCallback = useCallback(
        async (status, orderDetails = {}) => {
            try {
                // user_id, status, payment_for, payment_method, amount, signature, order_id, payment_id,
                const response = await Fetch({
                    url: "http://localhost:4000/payment/commit",
                    method: "POST",
                    data: {
                        user_id: userId,
                        status,
                        payment_for: payment_for,
                        payment_method: paymentMethod.current,
                        amount,
                        signature: orderDetails.signature,
                        order_id: orderDetails.orderId,
                        payment_id: orderDetails.paymentId,
                    },
                });
                if (response.status === 200) {
                    setDisplayRazorpay(false);
                    let type = status === "succeeded" ? "success" : "error";

                    toast(status, { type });

                    if (status === "succeeded") {
                        navigate(redirectUrl);
                    }
                } else {
                    setDisplayRazorpay(false);
                    toast("Something went wrong, try again", { type: "error" });
                }
            } catch (error) {
                setDisplayRazorpay(false);
                toast("Something went wrong, try again", { type: "error" });
            }
        },
        [setDisplayRazorpay, navigate, userId, amount, payment_for, redirectUrl]
    );

    const handlePayment = useCallback(
        (response) => {
            console.log(response);
            paymentId.current = response.razorpay_payment_id;
            const succeeded =
                crypto
                    .HmacSHA256(`${orderId}|${paymentId.current}`, keySecret)
                    .toString() === response.razorpay_signature;
            if (succeeded) {
                handlePaymentBackendCallback("succeeded", {
                    orderId,
                    paymentId: paymentId.current,
                    signature: response.razorpay_signature,
                });
            } else {
                handlePaymentBackendCallback("failed", {
                    orderId,
                    paymentId: paymentId.current,
                });
            }
        },
        [keySecret, orderId, handlePaymentBackendCallback]
    );

    const handleModalOnDismiss = useCallback(
        async (reason) => {
            const {
                reason: paymentReason,
                field,
                step,
                code,
            } = reason && reason.error ? reason.error : {};

            if (reason === undefined) {
                // console.log("cancelled");
                handlePaymentBackendCallback("Cancelled");
            } else if (reason === "timeout") {
                // console.log("timedout");
                handlePaymentBackendCallback("timedout");
            } else {
                // console.log("failed");
                handlePaymentBackendCallback("failed", {
                    paymentReason,
                    field,
                    step,
                    code,
                });
            }
        },
        [handlePaymentBackendCallback]
    );

    const options = useMemo(() => {
        return {
            key: keyId,
            amount,
            currency,
            name: "6AM Yoga",
            order_id: orderId,
            config: paymentMethodConfig,
            handler: handlePayment,
            modal: {
                confirm_close: true,
                ondismiss: handleModalOnDismiss,
            },
            retry: {
                enabled: false,
            },
            timeout: 900,
            theme: {
                color: "",
            },
        };
    }, [amount, currency, keyId, orderId, handlePayment, handleModalOnDismiss]);

    useEffect(() => {
        if (displayRazorpay) {
            // console.log("in razorpay");
            showRazorpay(options);
        } else {
            // reset razorpay
            if (gateway.current) {
                window.Razorpay = null;
                gateway.current.close();
                gateway.current = null;
            }
        }
    }, [showRazorpay, options, displayRazorpay]);

    useEffect(() => {}, [displayRazorpay]);

    return <></>;
};

export default RenderRazorpay;
