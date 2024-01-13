import PhoneInput from "react-phone-number-input";
import { Button, Input } from "@geist-ui/core";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utils/firebase";
export default function Otp() {
  const [otp, setOtp] = useState("");
  const [number, setNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [enter, setEnter] = useState(false);
  const [confirmObj, setConfirmObj] = useState("");
  const recaptchaVerifier = useRef(null);
  function setUpReCaptcha() {
    const rv = new RecaptchaVerifier(auth, "recaptcha-container", {
      callback: () => {
        console.log("recaptcha resolved..");
        setVerified(true);
      },
      "expired-callback": () => {
        setVerified(false);
      },
    });
    recaptchaVerifier.current = rv;
    recaptchaVerifier.current.render();
  }

  useEffect(() => {
    setUpReCaptcha();
    return () => {
      if (recaptchaVerifier.current) {
        recaptchaVerifier.current.clear();
      }
    };
  }, []);

  const sendOTP = async () => {
    if (number === "" || number === undefined) {
      return;
    }
    if (!verified) {
      try {
        await recaptchaVerifier.current.verify();
        setVerified(true);
      } catch (err) {
        toast("Error with recaptcha, try again", { type: "error" });
        return;
      }
    }

    console.log("SENDING OTP TO : ", number);
    signInWithPhoneNumber(auth, number, recaptchaVerifier.current)
      .then((confirmationResult) => {
        toast("OTP Sent!");
        console.log({ confirmationResult });
        setEnter(true);
        setConfirmObj(confirmationResult);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp_entered = document.querySelector("#otp").value;
    console.log(otp_entered);
    try {
      await confirmObj
        .confirm(otp_entered)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    }
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
      <div id="recaptcha-container" />
      <div>
        <Button>Cancel</Button>
        <Button onClick={() => sendOTP()} disabled={!verified}>
          Get OTP
        </Button>
      </div>
      <br />
      {/* verify otp */}
      {enter && (
        <div>
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <Input width="100%" id="otp" placeholder="Enter OTP here">
              Name
            </Input>
            <Button htmlType="submit">Verify OTP</Button>
          </form>
        </div>
      )}
    </div>
  );
}
