import { Button, Input } from "@geist-ui/core";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import PhoneInput from "react-phone-number-input";
import { toast } from "react-toastify";
import { auth } from "../../utils/firebase";

export default function Otp() {
    const [otp, setOtp] = useState("");
    const [number, setNumber] = useState("");
    const [verified, setVerified] = useState(false);

    const recaptchaVerifier = useRef(null);

    // useEffect(() => {}, [verified]);

    function setUpReCaptcha() {
        // first setup recaptcha verifier
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
            // destroy instance when exiting
            if (recaptchaVerifier.current) {
                recaptchaVerifier.current.clear();
            }
        };
    }, []);

    const sendOTP = async () => {
        if (number === "" || number === undefined) {
            return;
        }
        console.log(number);

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
                console.log({ confirmationResult });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div className="flex flex-col gap-1 items-center w-full mt-4">
            <div>
                <PhoneInput
                    defaultCountry="IN"
                    value={number}
                    onChange={setNumber}
                    placeholder="Enter Phone Number"></PhoneInput>
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
            <div>
                <Input placeholder="Enter OTP here"></Input>
            </div>
        </div>
    );
}
