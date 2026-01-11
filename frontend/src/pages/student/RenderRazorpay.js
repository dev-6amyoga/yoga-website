import { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { FetchRetry } from "../../utils/Fetch";
import {
  TRANSACTION_SUCCESS,
  TRANSACTION_FAILED,
  TRANSACTION_CANCELLED,
  TRANSACTION_TIMEOUT,
} from "../../enums/transaction_status";

const loadScript = (src) =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function RazorpayCheckout({
  orderId,
  keyId,
  amount,
  currency,
  userId,
  payment_for,
  currency_id,
  discount_coupon_id,
  displayRazorpay,
  setDisplayRazorpay,
  onSuccessCallback = () => {},
  onErrorCallback = () => {},
}) {
  const gateway = useRef();
  const paymentId = useRef();

  const commitPayment = useCallback(
    async (status, payload = {}) => {
      try {
        const res = await FetchRetry({
          url: "/payment/commit",
          method: "POST",
          token: false,
          data: {
            user_id: userId,
            status,
            payment_for,
            amount,
            currency_id,
            discount_coupon_id: discount_coupon_id ?? null,
            order_id: payload.razorpay_order_id,
            payment_id: payload.razorpay_payment_id,
            signature: payload.razorpay_signature,
            payment_method: payload.payment_method ?? null,
          },
          n: 5,
          retryDelayMs: 2000,
        });

        if (status === TRANSACTION_SUCCESS) {
          onSuccessCallback(payload.razorpay_order_id);
        } else {
          onErrorCallback();
        }
      } catch (e) {
        toast("Payment recorded but system failed — support notified.", {
          type: "error",
        });
        onErrorCallback();
      } finally {
        setDisplayRazorpay(false);
      }
    },
    [
      userId,
      payment_for,
      amount,
      currency_id,
      discount_coupon_id,
      onSuccessCallback,
      onErrorCallback,
      setDisplayRazorpay,
    ]
  );

  const startPayment = useCallback(async () => {
    const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!ok) return toast("Failed to load Razorpay");

    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: "6AM Yoga",

      handler: async (response) => {
        await commitPayment(TRANSACTION_SUCCESS, response);
      },

      modal: {
        ondismiss: async () => {
          await commitPayment(TRANSACTION_CANCELLED, {
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId.current,
          });
        },
      },

      retry: { enabled: false },
      timeout: 300,
    });

    gateway.current = rzp;

    rzp.on("payment.submit", (data) => {
      paymentId.current = data.payment_id;
    });

    rzp.on("payment.failed", async (data) => {
      await commitPayment(TRANSACTION_FAILED, data.error.metadata);
    });

    rzp.open();
  }, [amount, currency, keyId, orderId, commitPayment]);

  useEffect(() => {
    if (displayRazorpay) startPayment();
  }, [displayRazorpay, startPayment]);

  return null;
}
