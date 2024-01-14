import PhoneInput from "react-phone-number-input";
import { Button, Input } from "@geist-ui/core";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../utils/firebase";
export default function Otp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
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

  /*
  MESSAGE : 
    ive to go out ill come back and do it 
    I will finish it today dw
    pls push it off

    Im sorry today I tried my best to work during my travel and I did a bunch but ya ill finish when I come

    Video is coming in student free videos, controls for play pause are working

    Need to fix : next/previous video && seek 15seconds forward backward
    these are pretty chill so ill do them whne i come
  */

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

  const verifyOtp = async () => {
    const otp_entered = document.querySelector("#otp").value;
    try {
      await confirmObj
        .confirm(otp_entered)
        .then((res) => {
          console.log("THIS IS RES : ", res);
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
          <form className="flex flex-col gap-4 w-full">
            <Input width="100%" id="otp" placeholder="Enter OTP here">
              Name
            </Input>
            <Button onClick={verifyOtp}>Verify OTP</Button>
          </form>
        </div>
      )}
    </div>
  );
}
