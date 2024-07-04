import { Checkbox, Divider, Input, Modal } from "@geist-ui/core";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, LinearProgress } from "@mui/material";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "react-feather";
import { toast } from "react-toastify";
import GeneralInformationForm from "../../components/auth/register/GeneralInformationForm";
import InstituteDetailsForm from "../../components/auth/register/InstituteDetailsForm";
import PhoneNumberForm from "../../components/auth/register/PhoneNumberForm";
import PickRegistationMode from "../../components/auth/register/PickRegistrationMode";
import RoleSelectorForm from "../../components/auth/register/RoleSelectorForm";
import { Card } from "../../components/ui/card";
import { Fetch } from "../../utils/Fetch";
import { Assignment, East, West } from "@mui/icons-material";
import getFormData from "../../utils/getFormData";
import "./register.css";
import useUserStore from "../../store/UserStore";
import { useShallow } from "zustand/react/shallow";

export default function Register({ switchForm }) {
  const notify = (x) => toast(x);
  const location = useLocation();
  const [
    user,
    setUser,
    userPlan,
    setUserPlan,
    setAccessToken,
    setRefreshToken,
    setCurrentInstituteId,
    setInstitutes,
    currentRole,
    setCurrentRole,
    setRoles,
  ] = useUserStore(
    useShallow((state) => [
      state.user,
      state.setUser,
      state.userPlan,
      state.setUserPlan,
      state.setAccessToken,
      state.setRefreshToken,
      state.setCurrentInstituteId,
      state.setInstitutes,
      state.currentRole,
      state.setCurrentRole,
      state.setRoles,
    ])
  );
  const [step, setStep] = useState(1);
  const [loggingIn, setLoggingIn] = useState(false);
  const [blockStep, setBlockStep] = useState(false);
  const [blockPhoneStep, setBlockPhoneStep] = useState(false);
  const [disclaimerModal, setDisclaimerModal] = useState(false);
  const [disclaimerAcceptedVar, setDisclaimerAcceptedVar] = useState(false);
  const [blockBusinessPhoneStep, setBlockBusinessPhoneStep] = useState(false);
  const [token, setToken] = useState("");
  const [regVerifyDisabled, setRegVerifyDisabled] = useState(false);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    setClientID(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const register = params.get("register");
    const googleName = params.get("googleName");
    const googleEmail = params.get("googleEmail");
    if (register === "true" && googleName && googleEmail) {
      setGeneralInfo({ name: googleName, email_id: googleEmail });
      setStep(2);
    }
  }, [location]);

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

  const [billingAddressSame, setBillingAddressSame] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (role === "STUDENT") {
        const newUser = {
          ...generalInfo,
          role_name: "STUDENT",
          is_google_login: googleInfo && googleInfo?.verified ? true : false,
        };
        let url = "/auth/register";
        if (googleInfo && googleInfo?.verified) {
          url += "-google";
          newUser.client_id = clientID;
          newUser.jwt_token = googleInfo?.jwt_token;
        }
        const response = await Fetch({
          url: url,
          method: "POST",
          data: newUser,
        });
        if (response?.status === 200) {
          handleLogin(newUser.username, newUser.password);
          // toast("New User added successfully! Kindly login.", {
          //   type: "success",
          // });
          // setTimeout(() => {
          //   window.location.reload();
          // }, 2000);
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
  }, [
    disclaimerAcceptedVar,
    generalInfo,
    phoneInfo,
    role,
    instituteInfo,
    businessPhoneInfo,
    billingAddressSame,
    googleInfo,
    clientID,
  ]);

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

  useEffect(() => {
    if (user?.user_id) {
      if (role === "STUDENT") {
        navigate("/student/free-videos");
      }
      // else if (type === "root") {
      //   navigate("/admin");
      // }
      // else if (type === "teacher")
      //   {
      //   navigate("/teacher");
      // }
      else if (role === "INSTITUTE_OWNER") {
        navigate("/institute");
      }
    }
  }, [user, role]);

  const handleLogin = async (username, password) => {
    const loginData = {
      username: username,
      password: password,
    };
    toast("Logging you in, please wait!");
    try {
      const response = await Fetch({
        url: "/auth/login",
        method: "POST",
        data: loginData,
      });
      if (response && response?.status === 200) {
        const userData = response.data;
        setUser(userData.user);
        setAccessToken(userData?.accessToken);
        setRefreshToken(userData?.refreshToken);
        setRoles(userData?.user?.roles);
        const currRole = Object.keys(userData?.user?.roles)[0];
        const currPlan = userData?.user?.roles[currRole][0]?.plan;
        setUserPlan(currPlan);
        const ins = userData?.user?.roles[currRole].map((r) => r?.institute);
        setInstitutes(ins);
        setCurrentInstituteId(ins[0]?.institute_id);
        sessionStorage.setItem("6amyoga_access_token", userData?.accessToken);
        sessionStorage.setItem("6amyoga_refresh_token", userData?.refreshToken);
        setCurrentRole(currRole);
        setLoggingIn(true);
      } else {
        const errorData = response.data;
        // removeCookie("6amyoga_access_token");
        // removeCookie("6amyoga_refresh_token");
        sessionStorage.removeItem("6amyoga_access_token");
        sessionStorage.removeItem("6amyoga_refresh_token");
        toast(errorData?.error, { type: "error" });
      }
    } catch (error) {
      // removeCookie("6amyoga_access_token");
      // removeCookie("6amyoga_refresh_token");
      sessionStorage.removeItem("6amyoga_access_token");
      sessionStorage.removeItem("6amyoga_refresh_token");
      toast("Error logging in, try again", { type: "error" });
    }
  };

  const maxSteps = 4;
  const minSteps = 1;

  const handleNextStep = useCallback(() => {
    if (
      (role === "STUDENT" && step < maxSteps) ||
      (role === "INSTITUTE_OWNER" && step < maxSteps + 1)
    )
      setStep((s) => s + 1);
  }, [step, role]);

  const handlePrevStep = useCallback(() => {
    if (step > minSteps) setStep((s) => s - 1);
    setBlockStep(false);
    setLoading(false);
  }, [step]);

  const sendEmail = useCallback(async () => {
    toast("Sending email!");
    Fetch({
      url: "/invite/create-email-verification",
      method: "POST",
      data: { email: generalInfo.email_id, name: generalInfo.name },
    })
      .then((res) => {
        toast("Email sent successfully", { type: "success" });
        setToken(res.data.token);
        setRegVerifyDisabled(true);
      })
      .catch((err) => {
        toast(`Error : ${err?.response?.data?.message}`, {
          type: "error",
        });
      });
  }, [generalInfo]);

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
          <div className="border text-center rounded-lg p-4">
            <p>
              We will send an email to <b>{generalInfo?.email_id}</b>
            </p>
            <p>
              To access your account, please click on{" "}
              <Button onClick={sendEmail} disabled={regVerifyDisabled}>
                Verify
              </Button>{" "}
              <br />
            </p>
          </div>
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
        return role === "INSTITUTE_OWNER" ? (
          // <div className="border text-center rounded-lg p-4">
          // 	<p>
          // 		We will send an email to{" "}
          // 		<b>{generalInfo?.email_id}</b>
          // 	</p>
          // 	<p>
          // 		Please{" "}
          // 		<Button
          // 			onClick={sendEmail}
          // 			disabled={regVerifyDisabled}>
          // 			Verify
          // 		</Button>{" "}
          // 		<br />
          // 		your email to be able to access your account!
          // 	</p>
          // </div>
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
                {/* <PhoneNumberForm
                  heading="Business Phone Number"
                  phoneValue={businessPhoneInfo}
                  setPhoneInfo={setBusinessPhoneInfo}
                  setBlockStep={setBlockBusinessPhoneStep}
                  setLoading={setLoading}
                  handleNextStep={handleNextStep}
                /> */}
              </>
            )}
          </>
        ) : (
          <></>
        );
      case 6:
        return role === "INSTITUTE_OWNER" && step === 6 ? (
          <div className="border text-center rounded-lg p-4">
            <p>
              We will send an email to <b>{generalInfo?.email_id}</b>
            </p>
            <p>
              Please{" "}
              <Button onClick={sendEmail} variant="outlined">
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
    handleNextStep,
    regVerifyDisabled,
    sendEmail,
  ]);

  // useEffect(() => {
  //   if (regVerifyDisabled) {
  //     if (role === "STUDENT") {
  //       // call this continuously for 3 minutes till a status 200 is obtained
  //       handleStudentRegistration();
  //     } else {
  //       handleInstituteRegistration();
  //     }
  //   }
  // }, [regVerifyDisabled]);

  const disclaimerAccepted = async () => {
    setDisclaimerModal(false);
    setDisclaimerAcceptedVar(true);
  };

  return (
    <div class="scale-70 !important">
      <GoogleOAuthProvider clientId={clientID}>
        <div className="w-80 sm:w-96 lg:w-[440px]">
          <div className="mb-4 flex flex-col items-center gap-2">
            <img
              src="/logo_6am.png"
              alt="6AM Yoga"
              className="mx-auto max-h-24 my-4"
            />
            <div className="p-2 bg-blue-500 rounded-full text-white">
              <Assignment />
            </div>
            <h2 className="text-center">Sign Up</h2>
          </div>

          <LinearProgress
            className="accent-blue-500 my-6"
            variant="determinate"
            value={
              (step / (role === "STUDENT" ? maxSteps : maxSteps + 1)) * 100
            }
          />

          {/* <Spacer y={4} /> */}
          {RenderStep}
          <div className="flex justify-between my-10 sm:flex flex-col py-2 gap-y-2">
            {(role === "STUDENT" && step < maxSteps) ||
            (role === "INSTITUTE_OWNER" && step < maxSteps + 1) ? (
              step === 1 ? (
                <Button
                  onClick={handleNextStep}
                  loading={loading}
                  iconRight={<ArrowRight />}
                  disabled={
                    loading ||
                    blockStep ||
                    blockPhoneStep ||
                    blockBusinessPhoneStep
                  }
                  variant="contained"
                  endIcon={<East />}
                >
                  Next
                </Button>
              ) : (
                <></>
              )
            ) : (
              <Button
                onClick={() => {
                  if (role === "STUDENT") {
                    handleStudentRegistration();
                  } else {
                    handleInstituteRegistration();
                  }
                }}
                disabled={!regVerifyDisabled}
              >
                Register
              </Button>
            )}

            {step > minSteps && (
              <Button
                onClick={handlePrevStep}
                loading={loading}
                startIcon={<West />}
                disabled={loading}
                variant="contained"
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-1 items-center w-full mt-4">
            <Button
              onClick={() => {
                setSearchParams({
                  login: true,
                });
              }}
              size="small"
              variant="outlined"
            >
              Have an account already? Sign in.
            </Button>
          </div>
        </div>
      </GoogleOAuthProvider>

      {/* T&C Modal */}
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
    </div>
  );
}
