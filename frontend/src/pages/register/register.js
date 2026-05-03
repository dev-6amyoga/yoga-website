import { Assignment, East, West } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
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
import {
  SIXAMYOGA_ACCESS_TOKEN,
  SIXAMYOGA_REFRESH_TOKEN,
  accessTimeExpiry,
  refreshTimeExpiry,
} from "../../enums/cookies";
import useUserStore from "../../store/UserStore";
import { Fetch, FetchRetry } from "../../utils/Fetch";
import { getHighestPriorityRole } from "../../utils/roleUtils";
import "./register.css";

export default function Register() {
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
    ]),
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
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [checkEmailVerification, setCheckEmailVerification] = useState(false);

  useQuery({
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
            //console.log("Error verifying email; Retrying...");
          }
        } else {
          //console.log("Error verifying email; Retrying...");
        }
        return null;
      } catch (err) {
        //console.log("Error verifying email; Retrying...");
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

        //console.log(newUser);
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
        //console.log(newUser);
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

  const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");

  useEffect(() => {
    if (user?.user_id && role === "STUDENT") {
      // Route based on active plan
      if (redirectAfterLogin) {
        navigate(redirectAfterLogin);
        return;
      }
      const userPlanData = useUserStore.getState().userPlan;
      if (userPlanData?.plan_id) {
        navigate("/student/join-class");
      } else {
        navigate("/student/purchase-a-plan");
      }
    }
  }, [user, role]);

  const [, setCookie, removeCookie] = useCookies([
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
        const currRole = getHighestPriorityRole(userData.user.roles);
        const currPlan = userData.user.roles[currRole]?.[0]?.plan;
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
          <Stack
            spacing={2}
            sx={{
              border: "1px solid #dfe5ec",
              borderRadius: 2,
              p: 2.5,
              textAlign: "center",
            }}
          >
            <Typography sx={{ color: "#101828", fontWeight: 900, fontSize: 20 }}>
              Verify your email
            </Typography>
            <Typography sx={{ color: "#667085" }}>
              We will send a verification email to{" "}
              <b>{generalInfo?.email_id}</b>.
            </Typography>
            <Button
              onClick={sendEmail}
              disabled={regVerifyDisabled}
              variant="contained"
              sx={{
                bgcolor: "#1f6f5b",
                fontWeight: 900,
                textTransform: "none",
                "&:hover": { bgcolor: "#185846" },
              }}
            >
              Send verification email
            </Button>
            {checkInbox && (
              <Typography
                sx={{
                  color: "#667085",
                  border: "1px solid #f2b8b5",
                  borderRadius: 1,
                  p: 1.25,
                  fontSize: 14,
                }}
              >
                Please check your inbox and spam folders for an email from
                dev.6amyoga@gmail.com.
              </Typography>
            )}
          </Stack>
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

  const stepLabels = ["Method", "Details", "Role", "Verify"];

  return (
    <Box sx={{ width: "100%" }}>
      <GoogleOAuthProvider clientId={clientID}>
        <Stack spacing={3}>
          <Stack spacing={2} alignItems="center">
            <img src="/logo_6am.png" alt="6AM Yoga" style={{ maxHeight: 76 }} />
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "#e8f5e9",
                color: "#1f6f5b",
              }}
            >
              <Assignment />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                component="h2"
                sx={{ color: "#101828", fontSize: 28, fontWeight: 900 }}
              >
                Create account
              </Typography>
              <Typography sx={{ color: "#667085", mt: 0.5 }}>
                Complete a few quick steps to get started.
              </Typography>
            </Box>
          </Stack>

          <Box>
            <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 2 }}>
              {stepLabels.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <LinearProgress
              variant="determinate"
              value={(step / maxSteps) * 100}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "#eef2f6",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "#1f6f5b",
                  borderRadius: 999,
                },
              }}
            />
          </Box>

          {RenderStep}

          <Stack spacing={1}>
            {role === "STUDENT" && step < maxSteps && step === 1 && (
              <Button
                onClick={handleNextStep}
                disabled={loading || blockStep}
                variant="contained"
                endIcon={<East />}
                size="large"
                sx={{
                  bgcolor: "#1f6f5b",
                  fontWeight: 900,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#185846" },
                }}
              >
                Next
              </Button>
            )}

            {step > minSteps && step !== maxSteps && (
              <Button
                onClick={handlePrevStep}
                startIcon={<West />}
                disabled={loading}
                variant="outlined"
                sx={{
                  borderColor: "#1f6f5b",
                  color: "#1f6f5b",
                  fontWeight: 800,
                  textTransform: "none",
                }}
              >
                Back
              </Button>
            )}
          </Stack>

          <Box sx={{ display: "grid", placeItems: "center" }}>
            <Button
              onClick={() => setSearchParams({ login: true })}
              size="small"
              variant="text"
              sx={{ color: "#1f6f5b", fontWeight: 800, textTransform: "none" }}
            >
              Already have an account? Sign in
            </Button>
          </Box>
        </Stack>
      </GoogleOAuthProvider>

      <Dialog open={disclaimerModal} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900 }}>Disclaimer</DialogTitle>
        <DialogContent>
          <Card elevation={0} sx={{ border: "1px solid #dfe5ec" }}>
            <CardContent>
              <Stack spacing={1.5} sx={{ color: "#344054" }}>
              <Typography>
                I would like to subscribe to the yoga videos offered by 6AM
                Yoga. I understand yoga includes physical activity that may
                cause physical injury.
              </Typography>
              <Typography>
                I declare that a physician's approval has been taken for
                pre-existing health conditions if any.
              </Typography>
              <Typography>
                I recognize my physical limitations and can take rest if needed.
              </Typography>
              <Typography>
                I accept full responsibility for any injuries and release 6AM
                Yoga from liabilities.
              </Typography>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
            setDisclaimerModal(false);
            setSearchParams({
              login: true,
            });
          }}
            sx={{ color: "#667085", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={disclaimerAccepted}
            variant="contained"
            sx={{
              bgcolor: "#1f6f5b",
              textTransform: "none",
              fontWeight: 900,
              "&:hover": { bgcolor: "#185846" },
            }}
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
