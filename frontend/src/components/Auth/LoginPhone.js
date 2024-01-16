import { Button, Input } from "@geist-ui/core";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { toast } from "react-toastify";
import { auth } from "../../utils/firebase";
import { ErrorBoundary } from "react-error-boundary";

export default function LoginPhone({ onSuccessCallback }) {
  const [otp, setOtp] = useState("");
  const [number, setNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const recaptchaVerifier = useRef(null);
  const recaptchaDivRef = useRef(null);

  function setUpReCaptcha() {
    const rv = new RecaptchaVerifier(auth, "recaptcha-container", {
      //   size: "invisible",
      callback: () => {
        console.log("recaptcha resolved..");
        setVerified(true);
      },
      "expired-callback": () => {
        console.log("in expired callback");
        setVerified(false);
      },
    });
    recaptchaVerifier.current = rv;
    recaptchaVerifier.current.render();
  }

  useEffect(() => {
    setUpReCaptcha();
    // to avoid 2 renders in dev mode
    // if (!recaptchaVerifier.current) {
    // }
    return () => {
      // destroy instance when exiting
      // if (recaptchaVerifier.current) {
      //   recaptchaVerifier.current.clear();
      // }
    };
  }, []);

  const sendOTP = async () => {
    if (number === "" || number === undefined) {
      return;
    }

    try {
      console.log("in try");
      await recaptchaVerifier.current.verify();
      setVerified(true);
      console.log("SENDING OTP TO : ", number);
      // hii
      signInWithPhoneNumber(auth, number, recaptchaVerifier.current)
        .then((confResult) => {
          console.log({ confirmationResult: confResult });
          setConfirmationResult(confResult);
        })
        .catch((error) => {
          console.log("HERE IS THE ERROR:", error);
        });
    } catch (err) {
      toast("Error with recaptcha, try again", { type: "error" });
    }
  };

  const verifyOtp = async () => {
    console.log("otp", otp);
    confirmationResult
      .confirm(otp)
      .then((result) => {
        console.log({ result });
        toast("Verified!", { type: "success" });
        onSuccessCallback();
      })
      .catch((err) => {
        toast(err, { type: "error" });
      });
  };

  return (
    <div className="flex flex-col gap-1 items-center w-full mt-4">
      <div>
        <PhoneInput
          defaultCountry="IN"
          value={number}
          onChange={setNumber}
          placeholder="Enter Phone Number"
        ></PhoneInput>
      </div>
      {/* <ReCAPTCHA sitekey={process.env?.REACT_APP_} /> */}
      <div id="recaptcha-container"></div>
      <div>
        <Button>Cancel</Button>
        <Button onClick={() => sendOTP()} disabled={!verified}>
          Get OTP
        </Button>
      </div>
      <br />
      {/* verify otp */}
      <div>
        <Input
          htmlType="number"
          placeholder="Enter OTP here"
          onChange={(e) => {
            setOtp(e.target.value);
          }}
        ></Input>
        <Button onClick={verifyOtp}>Verify</Button>
      </div>
    </div>
  );
}
