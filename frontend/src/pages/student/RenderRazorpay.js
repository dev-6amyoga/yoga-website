import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FetchRetry } from "../../utils/Fetch";
import { paymentMethodConfig } from "../../utils/razorpayUtils";
// import PropTypes from "prop-types";
// import Axios from "axios";
// import crypto from "crypto";
import HmacSHA256 from "crypto-js/hmac-sha256";
import {
	TRANSACTION_CANCELLED,
	TRANSACTION_FAILED,
	TRANSACTION_SUCCESS,
	TRANSACTION_TIMEOUT,
} from "../../enums/transaction_status";

import { memo } from "react";

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
	currencyId,
	discount_coupon_id,
	amount,
	payment_for,
	redirectUrl,
	onErrorCallback = () => {},
	onSuccessCallback = () => {},
	displayRazorpay,
	setDisplayRazorpay,
}) => {
	const paymentId = useRef(null);
	const paymentMethod = useRef(null);
	const gateway = useRef(null);
	const razorpayRendered = useRef(false);
	const navigate = useNavigate();

	const showRazorpay = useCallback(
		async (options) => {
			if (razorpayRendered.current === false) {
				try {
					const res = await loadScript(
						"https://checkout.razorpay.com/v1/checkout.js"
					);
					if (!res) {
						toast("Razorpay SDK failed to load. Are you online?");
						return;
					}
					const rzp = new window.Razorpay(options);

					gateway.current = rzp;

					// console.log(gateway.current);

					rzp.on("payment.submit", (response) => {
						console.log("payment.submit response", response);
						paymentMethod.current = response.method;
					});

					rzp.on("payment.failed", (response) => {
						console.log("payment.failed response", response);
						paymentId.current = response.error.metadata.payment_id;
					});

					gateway.current.open();
					razorpayRendered.current = true;
				} catch (err) {
					setDisplayRazorpay(false);
				}
			}
		},
		[setDisplayRazorpay]
	);

	const handlePaymentBackendCallback = useCallback(
		async (status, orderDetails = {}) => {
			// user_id, status, payment_for, payment_method, amount, signature, order_id, payment_id,
			switch (status) {
				case TRANSACTION_SUCCESS:
					if (!currencyId) {
						toast("Pick a currency!", { type: "error" });
						return;
					}
					break;
				case TRANSACTION_CANCELLED:
				case TRANSACTION_TIMEOUT:
				case TRANSACTION_FAILED:
					break;
				default:
					break;
			}
			FetchRetry({
				url: "/payment/commit",
				method: "POST",
				token: true,
				data: {
					user_id: userId,
					status,
					payment_for: payment_for,
					payment_method: paymentMethod.current,
					amount,
					signature: orderDetails?.signature,
					order_id: orderDetails?.orderId,
					payment_id: orderDetails?.paymentId,
					currency_id: currencyId,
					discount_coupon_id: discount_coupon_id ?? null,
				},
				n: 10,
				retryDelayMs: 2000,
				onRetry: (err) => {
					console.log(err);
				},
			})
				.then((res) => {
					if (res.status === 200) {
						setDisplayRazorpay(false);

						let type =
							status === TRANSACTION_SUCCESS
								? "success"
								: "error";

						// toast(status, { type });

						if (status === TRANSACTION_SUCCESS) {
							// console.log("IT WAS A SUCCESS YAYAYAY");
							onSuccessCallback(orderDetails.orderId);
						} else {
							// console.log("IT WAS A FAILURE OOPS");
							toast(
								"Payment Failed. Any money debited will be refunded in 5-7 business days.",
								{
									type: "error",
								}
							);
							onErrorCallback();
						}
					} else {
						setDisplayRazorpay(false);
						onErrorCallback();
						// console.log("OOPS ERROR 1");

						toast(
							"Something went wrong, try again. Any money debited will be refunded in 5-7 business days.",
							{
								type: "error",
							}
						);
					}
				})
				.catch((err) => {
					setDisplayRazorpay(false);
					onErrorCallback();
					// console.log("OOPS ERROR 20", err);
					toast(
						"Something went wrong, try again. Any money debited will be refunded in 5-7 business days.",
						{ type: "error" }
					);
				});
		},
		[
			setDisplayRazorpay,
			userId,
			amount,
			payment_for,
			currencyId,
			onErrorCallback,
			onSuccessCallback,
		]
	);

	const handlePayment = useCallback(
		(response) => {
			// console.log(response);
			paymentId.current = response.razorpay_payment_id;
			const succeeded =
				HmacSHA256(
					`${orderId}|${paymentId.current}`,
					keySecret
				).toString() === response.razorpay_signature;
			if (succeeded) {
				handlePaymentBackendCallback(TRANSACTION_SUCCESS, {
					orderId,
					paymentId: paymentId.current,
					signature: response.razorpay_signature,
				});
			} else {
				handlePaymentBackendCallback(TRANSACTION_FAILED, {
					orderId,
					paymentId: paymentId.current,
				});
			}
		},
		[keySecret, orderId, handlePaymentBackendCallback]
	);

	const handleModalOnDismiss = useCallback(
		async (reason) => {
			// console.log({ reason, paymentId: paymentId.current, orderId });
			const {
				reason: paymentReason,
				field,
				step,
				code,
			} = reason && reason.error ? reason.error : {};

			if (reason === undefined) {
				console.log(TRANSACTION_CANCELLED);
				handlePaymentBackendCallback(TRANSACTION_CANCELLED, {
					orderId,
					paymentId: paymentId.current,
				});
			} else if (reason === TRANSACTION_TIMEOUT) {
				console.log(TRANSACTION_TIMEOUT);
				handlePaymentBackendCallback(TRANSACTION_TIMEOUT, {
					orderId,
					paymentId: paymentId.current,
				});
			} else {
				console.log(TRANSACTION_FAILED);
				handlePaymentBackendCallback(TRANSACTION_FAILED, {
					paymentReason,
					field,
					step,
					code,
					orderId,
					paymentId: paymentId.current,
				});
			}
		},
		[handlePaymentBackendCallback, orderId]
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
			timeout: 300,
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
			razorpayRendered.current = false;
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

export default memo(RenderRazorpay);
