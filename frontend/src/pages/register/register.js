import {
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  Modal,
  Progress,
  Spacer,
} from "@geist-ui/core";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "react-feather";
import { toast } from "react-toastify";
import GeneralInformationForm from "../../components/auth/register/GeneralInformationForm";
import InstituteDetailsForm from "../../components/auth/register/InstituteDetailsForm";
import PhoneNumberForm from "../../components/auth/register/PhoneNumberForm";
import PickRegistationMode from "../../components/auth/register/PickRegistrationMode";
import RoleSelectorForm from "../../components/auth/register/RoleSelectorForm";
import { Fetch } from "../../utils/Fetch";
import getFormData from "../../utils/getFormData";
import "./register.css";

export default function Register({ switchForm }) {
  // const { toast } = useToast();
  const notify = (x) => toast(x);

  const [step, setStep] = useState(1);
  const [blockStep, setBlockStep] = useState(false);
  const [blockPhoneStep, setBlockPhoneStep] = useState(false);
  const [disclaimerModal, setDisclaimerModal] = useState(false);
  const [disclaimerAcceptedVar, setDisclaimerAcceptedVar] = useState(false);
  const [blockBusinessPhoneStep, setBlockBusinessPhoneStep] = useState(false);
  const [token, setToken] = useState("");
  const [role, setRole] = useState("STUDENT"); // STUDENT | INSTITUTE_OWNER
  const [regMode, setRegMode] = useState("NORMAL"); // NORMAL | GOOGLE

  const [loading, setLoading] = useState(false);

  const [googleInfo, setGoogleInfo] = useState({});
  const [generalInfo, setGeneralInfo] = useState({});

  const [phoneInfo, setPhoneInfo] = useState({});
  const [personalBusinessPhoneInfoSame, setPersonalBusinessPhoneInfoSame] =
    useState(true);
  const [businessPhoneInfo, setBusinessPhoneInfo] = useState({});

  const [instituteInfo, setInstituteInfo] = useState({});

  const [clientID, setClientID] = useState("");

  useEffect(() => {
    setClientID(process.env.REACT_APP_GOOGLE_CLIENT_ID);
  }, []);

  useEffect(() => {
    console.log(generalInfo);
  }, [generalInfo]);

  useEffect(() => {
    if (role === "STUDENT") {
      setBlockStep(blockPhoneStep);
    } else if (role === "INSTITUTE_OWNER") {
      setBlockStep(blockPhoneStep && blockBusinessPhoneStep);
    }
  }, [
    personalBusinessPhoneInfoSame,
    blockPhoneStep,
    blockBusinessPhoneStep,
    role,
  ]);

  // const navigate = useNavigate();

  const [billingAddressSame, setBillingAddressSame] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (role === "STUDENT") {
        const newUser = {
          ...generalInfo,
          phone_no: phoneInfo?.phone_no,
          role_name: "STUDENT",
          is_google_login: googleInfo && googleInfo?.verified ? true : false,
        };
        let url = "/auth/register";
        if (googleInfo && googleInfo?.verified) {
          url += "-google";
          newUser.client_id = clientID;
          newUser.jwt_token = googleInfo?.jwt_token;
        }
        console.log(newUser, "TO BE REGISTERED ");
        const response = await Fetch({
          url: url,
          method: "POST",
          data: newUser,
        });
        if (response?.status === 200) {
          toast("New User added successfully! Kindly login.", {
            type: "success",
          });
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          const errorData = response.data;
          toast(errorData?.message, { type: "error" });
        }
      }
      if (role === "INSTITUTE_OWNER") {
        try {
          if (instituteInfo?.pincode)
            instituteInfo.pincode = parseInt(instituteInfo?.pincode);
        } catch (err) {
          notify("Pincode must be a number");
          return;
        }
        const addressCombination = `${instituteInfo?.address1}, ${instituteInfo?.address2}, ${instituteInfo?.city} - ${instituteInfo?.pincode}, ${instituteInfo?.state}, ${instituteInfo?.country}`;
        const user = {
          name: generalInfo?.name,
          username: generalInfo?.username,
          email_id: generalInfo?.email_id,
          phone_no: phoneInfo?.phone_no,
          password: generalInfo?.password,
          confirm_password: generalInfo?.confirm_password,
          role_name: "INSTITUTE_OWNER",
          is_google_login: googleInfo && googleInfo?.verified ? true : false,
        };
        const institute = {
          name: instituteInfo?.institute_name,
          address1: instituteInfo?.address1,
          address2: instituteInfo?.address2,
          pincode: instituteInfo?.pincode,
          billing_address: billingAddressSame
            ? addressCombination
            : instituteInfo?.billing_address,
          email: instituteInfo?.contact_email,
          phone: businessPhoneInfo.phone_no
            ? businessPhoneInfo.phone_no
            : phoneInfo?.phone_no,
          gstin: instituteInfo?.gstin,
        };
        Fetch({
          url: "/institute/register",
          method: "POST",
          data: institute,
        }).then((res) => {
          if (res && res.status === 200) {
            toast("Institute added successfully", {
              type: "success",
            });
            user.institute_name = institute.name;
            let url = "/auth/register";
            if (googleInfo && googleInfo?.verified) {
              url += "-google";
            }
            Fetch({
              url: url,
              method: "POST",
              data: user,
            })
              .then((res) => {
                if (res && res.status === 200) {
                  toast("User added successfully", {
                    type: "success",
                  });
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                } else {
                  toast("Error registering user", {
                    type: "error",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                toast("Error registering user: " + err?.response?.data?.error, {
                  type: "error",
                });
              });
          }
        });
      }
    };
    if (disclaimerAcceptedVar) {
      fetchData();
    }
  }, [disclaimerAcceptedVar]);

  const handleStudentRegistration = async () => {
    Fetch({
      url: "/invite/get-email-verification-by-token",
      method: "POST",
      data: { token: token },
    }).then(async (res) => {
      if (res.status === 200) {
        const invite = res.data.invite;
        if (invite?.is_verified) {
          setDisclaimerModal(true);
        } else {
          toast("Email has not yet been verified!");
        }
      }
    });
  };
  const handleInstituteRegistration = async () => {
    Fetch({
      url: "/invite/get-email-verification-by-token",
      method: "POST",
      data: {
        token: token,
      },
    }).then(async (res) => {
      if (res.status === 200) {
        const invite = res.data.invite;
        if (invite?.is_verified) {
          setDisclaimerModal(true);
        } else {
          toast("Email has not yet been verified!");
        }
      }
    });
  };
  const maxSteps = 5;
  const minSteps = 1;
  const handleNextStep = () => {
    if (
      (role === "STUDENT" && step < maxSteps) ||
      (role === "INSTITUTE_OWNER" && step < maxSteps + 1)
    )
      setStep((s) => s + 1);
  };
  const handlePrevStep = () => {
    if (step > minSteps) setStep((s) => s - 1);
    setBlockStep(false);
    setLoading(false);
  };

  const sendEmail = async () => {
    toast("Sending email!");
    console.log(generalInfo);
    console.log(generalInfo.email_id, generalInfo.name);
    Fetch({
      url: "/invite/create-email-verification",
      method: "POST",
      data: { email: generalInfo.email_id, name: generalInfo.name },
    })
      .then((res) => {
        toast("Email sent successfully", { type: "success" });
        setToken(res.data.token);
      })
      .catch((err) => {
        console.log(err);
        toast(`Error : ${err?.response?.data?.message}`, {
          type: "error",
        });
      });
  };
  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    setPhoneInfo({
      phone_no: formData.personal_phone_number,
      verified: true,
    });
    toast("Personal Number Saved!");
  };
  const RenderStep = useMemo(() => {
    switch (step) {
      case 1:
        return (
          <PickRegistationMode
            regMode={regMode}
            setRegMode={setRegMode}
            setGoogleInfo={setGoogleInfo}
            setGeneralInfo={setGeneralInfo}
            setLoading={setLoading}
            clientID={clientID}
            handleNextStep={handleNextStep}
          />
        );
      case 2:
        return (
          <GeneralInformationForm
            generalInfo={generalInfo}
            setGeneralInfo={setGeneralInfo}
            setBlockStep={setBlockStep}
            setLoading={setLoading}
            googleInfo={googleInfo}
            handleNextStep={handleNextStep}
          />
        );
      case 3:
        return (
          <RoleSelectorForm
            role={role}
            setRole={setRole}
            handleNextStep={handleNextStep}
          />
        );
      case 4:
        return role === "STUDENT" ? (
          <PhoneNumberForm
            phoneValue={phoneInfo}
            setPhoneInfo={setPhoneInfo}
            setBlockStep={setBlockPhoneStep}
            setLoading={setLoading}
            handleNextStep={handleNextStep}
          />
        ) : (
          <InstituteDetailsForm
            setInstituteInfo={setInstituteInfo}
            billingAddressSame={billingAddressSame}
            setBillingAddressSame={setBillingAddressSame}
            setBlockStep={setBlockStep}
            setLoading={setLoading}
            handleNextStep={handleNextStep}
          />
        );
      case 5:
        return role === "STUDENT" ? (
          <div className="border text-center rounded-lg p-4">
            <p>
              We will send an email to <b>{generalInfo?.email_id}</b>
            </p>
            <p>
              Please{" "}
              <Button onClick={sendEmail}>
                Verify
                {/* <b className="text-blue-400">verify</b> */}
              </Button>{" "}
              <br />
              your email to be able to access your account!
            </p>
          </div>
        ) : (
          <>
            <h4 className="text-center">Phone Number Verification</h4>
            <div
              className={`max-w-md border-2 flex items-center justify-center p-4 rounded-lg my-4 mx-auto ${
                personalBusinessPhoneInfoSame ? "border-blue-500" : ""
              }`}
            >
              <Checkbox
                initialChecked={personalBusinessPhoneInfoSame}
                onChange={() => setPersonalBusinessPhoneInfoSame((p) => !p)}
                scale={1}
              >
                Use same phone number for Personal information and Business
                contact information.
              </Checkbox>
            </div>
            <Divider />
            {personalBusinessPhoneInfoSame && (
              <PhoneNumberForm
                heading="Personal Phone Number"
                phoneValue={phoneInfo}
                setPhoneInfo={setPhoneInfo}
                setBlockStep={setBlockPhoneStep}
                setLoading={setLoading}
                handleNextStep={handleNextStep}
              />
            )}
            {!personalBusinessPhoneInfoSame && (
              <>
                <form
                  className="flex flex-col gap-1"
                  onSubmit={handlePhoneSubmit}
                >
                  <p className="text-center text-zinc-500">
                    Personal Phone Number
                  </p>
                  <Input width="100%" name="personal_phone_number"></Input>
                  <Button htmlType="submit" width="20%" type="secondary">
                    Save
                  </Button>
                </form>
                <Divider />
                <PhoneNumberForm
                  heading="Business Phone Number"
                  phoneValue={businessPhoneInfo}
                  setPhoneInfo={setBusinessPhoneInfo}
                  setBlockStep={setBlockBusinessPhoneStep}
                  setLoading={setLoading}
                  handleNextStep={handleNextStep}
                />
              </>
            )}
          </>
        );
      case 6:
        return role === "INSTITUTE_OWNER" && step === 6 ? (
          <div className="border text-center rounded-lg p-4">
            <p>
              We will send an email to <b>{generalInfo?.email_id}</b>
            </p>
            <p>
              Please{" "}
              <Button onClick={sendEmail}>
                {/* Verify */}
                <b className="text-blue-400">Verify</b>
              </Button>{" "}
              <br />
              your email to be able to access your account!
            </p>
          </div>
        ) : (
          <></>
        );
      default:
        return <></>;
    }
  }, [
    personalBusinessPhoneInfoSame,
    businessPhoneInfo,
    googleInfo,
    step,
    role,
    regMode,
    billingAddressSame,
    generalInfo,
    phoneInfo,
    clientID,
  ]);

  const disclaimerAccepted = async () => {
    setDisclaimerModal(false);
    setDisclaimerAcceptedVar(true);
  };

  return (
    <GoogleOAuthProvider clientId={clientID}>
      <div className="border p-4 rounded-lg max-w-xl mx-auto">
        <div className="mb-4">
          <img
            src="/logo_6am.png"
            alt="6AM Yoga"
            className="mx-auto max-h-24 my-4"
          />
          <h3 className="text-center text-2xl">Register</h3>
        </div>

        <br />
        <Progress
          type="success"
          value={step}
          max={role === "STUDENT" ? maxSteps : maxSteps + 1}
        />
        <Spacer y={4} />
        {RenderStep}
        <div className="flex flex-row justify-between my-10">
          {(role === "STUDENT" && step < maxSteps) ||
          (role === "INSTITUTE_OWNER" && step < maxSteps + 1) ? (
            <Button
              onClick={handleNextStep}
              loading={loading}
              width={step === 1 ? "100%" : null}
              iconRight={<ArrowRight />}
              //   disabled={
              //     loading || blockStep || blockPhoneStep || blockBusinessPhoneStep
              //   }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (role === "STUDENT") {
                  handleStudentRegistration();
                } else {
                  handleInstituteRegistration();
                }
              }}
            >
              Register
            </Button>
          )}

          {step > minSteps && (
            <Button
              onClick={handlePrevStep}
              loading={loading}
              icon={<ArrowLeft />}
              disabled={loading}
            >
              Back
            </Button>
          )}
        </div>

        <hr />

        <div className="flex flex-col gap-1 items-center w-full mt-4">
          <h5 onClick={() => switchForm((s) => !s)} className="hover:pointer">
            Already have an account?{" "}
            <span className="text-blue-500">Click Here</span>
          </h5>
        </div>
      </div>
      <Modal
        visible={disclaimerModal}
        onClose={() => setDisclaimerModal(() => false)}
      >
        <Modal.Title>Disclaimer</Modal.Title>
        <Modal.Content>
          <Card shadow>
            {" "}
            <div className="flex flex-col gap-3">
              <p>
                I would like to utilize in the yoga videos offered by 6AM Yoga.
                I fully understand that yoga includes physical activity that may
                or may not cause physical injury.
              </p>
              <p>
                I agree to declare any health issues and/or conditions I may
                have before signing up for the platform. I declare that a
                physician's approval has been taken before enrollment.{" "}
              </p>
              <p>
                In the event that poses might be uncomfortable, any suggested
                modifications can be discussed with me. If there's any strain or
                fatigue, I can come out of the pose to rest and understand that
                each and every one have their own physical limitations.
              </p>
              <p>
                I fully recognize that any injuries sustained from the yoga
                practice will be my responsibility. Therefore I release 6AM Yoga
                of any liabilities in this regard. I have read and fully
                understood the terms of the declaration and accept all of it.
              </p>
            </div>
          </Card>
        </Modal.Content>
        <Modal.Action onClick={() => disclaimerAccepted()}>Accept</Modal.Action>
        <Modal.Action onClick={() => setDisclaimerModal(false)}>
          Cancel
        </Modal.Action>
      </Modal>
    </GoogleOAuthProvider>
  );
}
