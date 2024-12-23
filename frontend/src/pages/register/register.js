import { Modal } from "@geist-ui/core";
import { Assignment, East, West } from "@mui/icons-material";
import {
  Button,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
} from "@mui/material";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useQuery } from "@tanstack/react-query";
import { add } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCookies } from "react-cookie";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import GeneralInformationForm from "../../components/auth/register/GeneralInformationForm";
import PickRegistationMode from "../../components/auth/register/PickRegistrationMode";
import RoleSelectorForm from "../../components/auth/register/RoleSelectorForm";
import { Card } from "../../components/ui/card";
import {
  SIXAMYOGA_ACCESS_TOKEN,
  SIXAMYOGA_REFRESH_TOKEN,
  accessTimeExpiry,
  refreshTimeExpiry,
} from "../../enums/cookies";
import useUserStore from "../../store/UserStore";
import { Fetch, FetchRetry } from "../../utils/Fetch";
import "./register.css";

export default function Register({ switchForm }) {
  const location = useLocation();
  const [
    user,
    setUser,
    setUserPlan,
    setAccessToken,
    setRefreshToken,
    setCurrentRole,
    setRoles,
  ] = useUserStore(
    useShallow((state) => [
      state.user,
      state.setUser,
      state.setUserPlan,
      state.setAccessToken,
      state.setRefreshToken,
      state.setCurrentRole,
      state.setRoles,
    ])
  );

  const [step, setStep] = useState(1);
  const [blockStep, setBlockStep] = useState(false);
  const [disclaimerModal, setDisclaimerModal] = useState(false);
  const [disclaimerAcceptedVar, setDisclaimerAcceptedVar] = useState(false);
  const [token, setToken] = useState("");
  const [regVerifyDisabled, setRegVerifyDisabled] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const [regMode, setRegMode] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [googleInfo, setGoogleInfo] = useState({});
  const [generalInfo, setGeneralInfo] = useState({});
  const [clientID, setClientID] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkEmailVerification, setCheckEmailVerification] = useState(false);

  const { isError, isLoading } = useQuery({
    queryKey: ["get-email-verification-by-token"],
    queryFn: async () => {
      try {
        const res = await Fetch({
          url: "/invite/get-email-verification-by-token",
          method: "POST",
          data: { token },
        });

        if (res.status === 200) {
          const invite = res.data.invite;
          if (invite?.is_verified) {
            setDisclaimerModal(true);
            toast.success("Email verified successfully!");
            setCheckEmailVerification(false);
          } else {
            toast.error("Error verifying email; Retrying...");
          }
        } else {
          toast.error("Error verifying email; Retrying...");
        }

        return null;
      } catch (err) {
        toast.error("Error verifying email; Retrying...");
        return null;
      }
    },
    refetchInterval: 2000,
    retry: 10,
    enabled: checkEmailVerification,
  });

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
    const fetchData = async () => {
      if (role === "STUDENT") {
        const newUser = {
          ...generalInfo,
          role_name: "STUDENT",
          is_google_login: !!googleInfo?.verified,
        };

        let url = "/auth/register";
        if (googleInfo?.verified) {
          url += "-google";
          newUser.client_id = clientID;
          newUser.jwt_token = googleInfo?.jwt_token;
        }

        const response = await FetchRetry({
          url,
          method: "POST",
          data: newUser,
          retryDelayMs: 1000,
          n: 10,
        });

        if (response?.status === 200) {
          handleLogin(newUser.username, newUser.password);
          toast.success("New User added successfully!");
        } else {
          toast.error(response.data?.message);
        }
      } else {
        // register as teacher

        const newUser = {
          ...generalInfo,
          role_name: "TEACHER",
          is_google_login: !!googleInfo?.verified,
        };

        let url = "/auth/register";
        if (googleInfo?.verified) {
          url += "-google";
          newUser.client_id = clientID;
          newUser.jwt_token = googleInfo?.jwt_token;
        }

        const response = await FetchRetry({
          url,
          method: "POST",
          data: newUser,
          retryDelayMs: 1000,
          n: 10,
        });

        if (response?.status === 200) {
          handleLogin(newUser.username, newUser.password);
          toast.success("New User added successfully!");
          navigate("/auth");
        } else {
          toast.error(response.data?.message);
        }
      }
    };

    if (disclaimerAcceptedVar) {
      fetchData();
    }
  }, [disclaimerAcceptedVar, generalInfo, role, googleInfo, clientID]);

  useEffect(() => {
    if (user?.user_id && role === "STUDENT") {
      navigate("/student/free-videos");
    }
  }, [user, role]);

  const [cookies, setCookie, removeCookie] = useCookies([
    SIXAMYOGA_ACCESS_TOKEN,
    SIXAMYOGA_REFRESH_TOKEN,
  ]);

  const handleLogin = async (username, password) => {
    const loginData = { username, password };
    toast("Logging you in, please wait!");
    try {
      const response = await Fetch({
        url: "/auth/login",
        method: "POST",
        data: loginData,
      });
      if (response?.status === 200) {
        const userData = response.data;
        setUser(userData.user);
        setAccessToken(userData.accessToken);
        setRefreshToken(userData.refreshToken);
        setRoles(userData.user.roles);
        const currRole = Object.keys(userData.user.roles)[0];
        const currPlan = userData.user.roles[currRole][0]?.plan;
        setUserPlan(currPlan);

        setCookie(SIXAMYOGA_ACCESS_TOKEN, userData.accessToken, {
          expires: add(new Date(), accessTimeExpiry),
        });

        setCookie(SIXAMYOGA_REFRESH_TOKEN, userData.refreshToken, {
          expires: add(new Date(), refreshTimeExpiry),
        });

        setCurrentRole(currRole);
      } else {
        removeCookie(SIXAMYOGA_ACCESS_TOKEN);
        removeCookie(SIXAMYOGA_REFRESH_TOKEN);
        toast.error(response.data?.error);
      }
    } catch (error) {
      removeCookie(SIXAMYOGA_ACCESS_TOKEN);
      removeCookie(SIXAMYOGA_REFRESH_TOKEN);
      toast.error("Error logging in, try again");
    }
  };

  const maxSteps = 4;
  const minSteps = 1;

  const handleNextStep = useCallback(() => {
    if (role === "STUDENT" && step < maxSteps) setStep((s) => s + 1);
  }, [step, role]);

  const handlePrevStep = useCallback(() => {
    if (step > minSteps) setStep((s) => s - 1);
    setBlockStep(false);
    setLoading(false);
  }, [step]);

  const [checkInbox, setCheckInbox] = useState(false);
  const sendEmail = useCallback(async () => {
    setCheckInbox(true);
    try {
      const res = await Fetch({
        url: "/invite/create-email-verification",
        method: "POST",
        data: { email: generalInfo.email_id, name: generalInfo.name },
      });
      toast.success("Email sent successfully");
      setToken(res.data.token);
      setRegVerifyDisabled(true);
      setCheckEmailVerification(true);
    } catch (err) {
      toast.error(`Error: ${err?.response?.data?.message}`);
    }
  }, [generalInfo]);

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
        return (
          <div className="border text-center rounded-lg p-4">
            <p>
              We will send an email to <b>{generalInfo?.email_id}</b>
            </p>
            <p>
              To access your account, please click on
              <Button onClick={sendEmail} disabled={regVerifyDisabled}>
                Verify
              </Button>
            </p>
            {checkInbox && (
              <p className="text-sm border p-2 rounded-lg text-zinc-500 border-red-500">
                Please check your inbox and spam folders for an email from
                dev.6amyoga@gmail.com!
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  }, [
    googleInfo,
    step,
    role,
    regMode,
    generalInfo,
    clientID,
    handleNextStep,
    regVerifyDisabled,
    sendEmail,
  ]);

  const disclaimerAccepted = () => {
    setDisclaimerModal(false);
    setDisclaimerAcceptedVar(true);
  };

  return (
    <div className="scale-70">
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
            value={(step / maxSteps) * 100}
          />

          {RenderStep}

          <div className="flex justify-between my-10 sm:flex flex-col py-2 gap-y-2">
            {role === "STUDENT" && step < maxSteps && step === 1 && (
              <Button
                onClick={handleNextStep}
                loading={loading}
                disabled={loading || blockStep}
                variant="contained"
                endIcon={<East />}
              >
                Next
              </Button>
            )}

            {step > minSteps && step !== maxSteps && (
              <Button
                onClick={handlePrevStep}
                loading={loading}
                startIcon={<West />}
                disabled={loading}
                variant="outlined"
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-1 items-center w-full mt-4">
            <Button
              onClick={() => setSearchParams({ login: true })}
              size="small"
              variant="outlined"
            >
              Have an account already? Sign in.
            </Button>
          </div>
        </div>
      </GoogleOAuthProvider>

      <Modal visible={disclaimerModal} disableBackdropClick>
        <Modal.Title>Disclaimer</Modal.Title>
        <Modal.Content>
          <Card shadow>
            <div className="flex flex-col gap-3">
              <p>
                I would like to subscribe to the yoga videos offered by 6AM
                Yoga. I understand yoga includes physical activity that may
                cause physical injury.
              </p>
              <p>
                I declare that a physician's approval has been taken for
                pre-existing health conditions if any.
              </p>
              <p>
                I recognize my physical limitations and can take rest if needed.
              </p>
              <p>
                I accept full responsibility for any injuries and release 6AM
                Yoga from liabilities.
              </p>
            </div>
          </Card>
        </Modal.Content>
        <Modal.Action onClick={disclaimerAccepted}>Accept</Modal.Action>
        <Modal.Action
          onClick={() => {
            setDisclaimerModal(false);
            setSearchParams({
              login: true,
            });
          }}
        >
          Cancel
        </Modal.Action>
      </Modal>
    </div>
  );
}
