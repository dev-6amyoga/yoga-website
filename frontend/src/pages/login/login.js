import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
// import { Button } from "../../components/ui/button";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { navigateToDashboard } from "../../utils/navigateToDashboard";
import { getHighestPriorityRole } from "../../utils/roleUtils";
import "./login.css";

import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { add } from "date-fns";
import { useCookies } from "react-cookie";
import LoginGoogle from "../../components/auth/LoginGoogle";
import {
  SIXAMYOGA_ACCESS_TOKEN,
  SIXAMYOGA_REFRESH_TOKEN,
  accessTimeExpiry,
  refreshTimeExpiry,
} from "../../enums/cookies";
import getFormData from "../../utils/getFormData";

export default function Login() {
  const navigate = useNavigate();
  const [userNow, setUserNow] = useState(null);
  const [mainVisible, setMainVisible] = useState(true);
  const [emailVerify, setEmailVerify] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [, setSearchParams] = useSearchParams();

  const [, setCookie, removeCookie] = useCookies([
    SIXAMYOGA_ACCESS_TOKEN,
    SIXAMYOGA_REFRESH_TOKEN,
  ]);

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
    ]),
  );

  const updateNewPassword = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);

    const password = formData?.new_password;
    const confirm_password = formData?.new_confirm_password;

    if (password !== confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await Fetch({
        url: "/user/reset-password",
        method: "POST",
        data: {
          user_id: userNow?.user_id,
          new_password: password,
          confirm_new_password: confirm_password,
        },
      });

      if (response && response?.status === 200) {
        toast.success("Password updated successfully");
        setForgotPasswordVisible(false);
        setMainVisible(true);
      } else {
        const errorData = response.data;
        toast.error(errorData?.error);
      }
    } catch (err) {
      toast(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    toast("Logging you in, please wait!");
    try {
      const response = await Fetch({
        url: "/auth/login",
        method: "POST",
        data: formData,
      });
      if (response && response?.status === 200) {
        const userData = response.data;
        console.log("userData:", userData);
        setUser(userData.user);
        setAccessToken(userData?.accessToken);
        setRefreshToken(userData?.refreshToken);
        setRoles(userData?.user?.roles);
        const currRole = getHighestPriorityRole(userData?.user?.roles);
        const currPlan = userData?.userPlan;
        console.log("userPlan:", currPlan);
        setUserPlan(currPlan);
        const ins =
          userData?.user?.roles[currRole]?.map((r) => r?.institute) ?? [];
        setInstitutes(ins);
        setCurrentInstituteId(ins[0]?.institute_id);

        const access_token = userData?.accessToken;
        const refresh_token = userData?.refreshToken;

        setCookie(SIXAMYOGA_ACCESS_TOKEN, access_token, {
          expires: add(new Date(), accessTimeExpiry),
        });

        setCookie(SIXAMYOGA_REFRESH_TOKEN, refresh_token, {
          expires: add(new Date(), refreshTimeExpiry),
        });

        setCurrentRole(currRole);
      } else {
        const errorData = response.data;
        removeCookie(SIXAMYOGA_ACCESS_TOKEN);
        removeCookie(SIXAMYOGA_REFRESH_TOKEN);

        toast(errorData?.error, { type: "error" });
      }
    } catch (error) {
      removeCookie(SIXAMYOGA_ACCESS_TOKEN);
      removeCookie(SIXAMYOGA_REFRESH_TOKEN);
      // alert(import.meta.env.VITE_BACKEND_DOMAIN);
      // alert(error?.message);
      //console.log(error);
      toast(
        error?.response?.data?.error
          ? `${error?.response?.data?.error}`
          : "Error!",
        { type: "error" },
      );
    }
  };

  useEffect(() => {
    if (user && currentRole) {
      console.log("ohohoo", user);
      console.log("ohohoo", userPlan);
      navigateToDashboard(currentRole, userPlan, navigate);
    }
  }, [user, currentRole, navigate, userPlan]);

  const handleForgotPassword = () => {
    setMainVisible(false);
    setEmailVerify(true);
  };
  const [verifyShow, setVerifyShow] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const [showPassword, setShowPassword] = useState(false);

  const emailVerifyFunc = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    const response = await Fetch({
      url: "/user/forgot-password-email",
      method: "POST",
      data: {
        email_id: formData.email_verify,
      },
    });

    if (response.status === 200) {
      if (response.data.error) {
        toast("User does not exist with the provided email id!");
        return;
      }
      setVerifyShow(true);
    }
  };

  //   useEffect(() => {
  //     if (user?.user_id) {
  //       //console.log("navigating based on id");
  //       //console.log(currentRole);
  //       if (currentRole === "STUDENT") {
  //         navigate("/student/free-videos");
  //       } else if (currentRole === "ROOT") {
  //         navigate("/admin");
  //       } else if (currentRole === "TEACHER") {
  //         navigate("/teacher");
  //       } else if (currentRole === "INSTITUTE_ADMIN") {
  //         navigate("/institute");
  //       } else {
  //         navigate("/auth");
  //       }
  //     }
  //   }, [user, type]);

  const handleDisable = (e) => {
    e.preventDefault();
  };

  return (
    <Box id="login-page" sx={{ width: "100%" }}>
      <Stack spacing={3} alignItems="center" sx={{ mb: 3 }}>
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
          <LockOutlined />
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            component="h2"
            sx={{ color: "#101828", fontSize: 28, fontWeight: 900 }}
          >
            Sign in
          </Typography>
          <Typography sx={{ color: "#667085", mt: 0.5 }}>
            Use your username and password to continue.
          </Typography>
        </Box>
      </Stack>

      {mainVisible && (
        <Stack spacing={2.25}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                name="username"
                label="Username"
                autoComplete="username"
                fullWidth
                required
              />
            <TextField
              label="Password"
              variant="outlined"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              fullWidth
              required
              onCut={handleDisable}
              onCopy={handleDisable}
              onPaste={handleDisable}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
              <Button
                variant="contained"
                type="submit"
                size="large"
                fullWidth
                sx={{
                  bgcolor: "#1f6f5b",
                  py: 1.2,
                  fontWeight: 900,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#185846" },
                }}
              >
                Sign in
              </Button>
            </Stack>
          </form>

          <Box sx={{ display: "grid", placeItems: "center" }}>
            <LoginGoogle />
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            justifyContent="space-between"
          >
            <Button
              size="small"
              variant="text"
              onClick={handleForgotPassword}
              sx={{ color: "#1f6f5b", textTransform: "none", fontWeight: 800 }}
            >
              Forgot password?
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSearchParams({ register: true });
              }}
              sx={{
                borderColor: "#1f6f5b",
                color: "#1f6f5b",
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              Create an account
            </Button>
          </Stack>
        </Stack>
      )}

      {emailVerify && (
        <form onSubmit={emailVerifyFunc}>
          <Stack spacing={2}>
            <Typography
              component="h3"
              sx={{ color: "#101828", fontSize: 22, fontWeight: 900 }}
            >
              Reset password
            </Typography>
            <Typography sx={{ color: "#667085" }}>
              Enter your email and we will send a verification link.
            </Typography>
            <TextField
              name="email_verify"
              label="Email ID"
              type="email"
              required
              fullWidth
            />
            {verifyShow && (
              <Alert severity="success">
                Verification email sent. Please check your inbox and spam
                folder.
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: "#1f6f5b",
                textTransform: "none",
                fontWeight: 900,
                "&:hover": { bgcolor: "#185846" },
              }}
            >
              Send email
            </Button>
            <Button
              onClick={() => {
                setEmailVerify(false);
                setMainVisible(true);
              }}
              sx={{ color: "#1f6f5b", textTransform: "none" }}
            >
              Back to sign in
            </Button>
          </Stack>
        </form>
      )}

      {forgotPasswordVisible && userNow && (
        <form onSubmit={updateNewPassword}>
          <Stack spacing={2}>
          <Typography>
            Setting password for <strong>{userNow?.username}</strong>
          </Typography>
          <Alert severity="info">
            Password must be minimum 8 letters and contain at least 1 number, 1
            alphabet, and 1 special character.
          </Alert>
          <TextField
            name="new_password"
            label="New Password"
            type="password"
            required
            fullWidth
          />
          <TextField
            name="new_confirm_password"
            label="Confirm New Password"
            type="password"
            required
            fullWidth
          />
          <Button type="submit" variant="contained">
            Reset password
          </Button>
          </Stack>
        </form>
      )}
    </Box>
  );
}
