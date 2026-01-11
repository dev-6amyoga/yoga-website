import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";

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
  displayRazorpay,
  setDisplayRazorpay,
  onSuccess = () => {},
  onFailure = () => {},
}) {
  const startPayment = useCallback(async () => {
    const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!ok) {
      toast("Failed to load Razorpay");
      onFailure();
      return;
    }

    const rzp = new window.Razorpay({
      key: keyId,
      amount,
      currency,
      order_id: orderId,
      name: "6AM Yoga",

      handler: () => {
        toast("Payment successful! Activating your plan...");
        onSuccess(); // UX only
      },

      modal: {
        ondismiss: () => {
          toast("Payment cancelled");
          onFailure();
        },
      },

      retry: { enabled: false },
    });

    rzp.on("payment.failed", () => {
      toast("Payment failed");
      onFailure();
    });

    rzp.open();
  }, [orderId, amount, currency, keyId, onSuccess, onFailure]);

  useEffect(() => {
    if (displayRazorpay) startPayment();
  }, [displayRazorpay, startPayment]);

  return null;
}
