import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
// import { Button } from "../../components/ui/button";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { navigateToDashboard } from "../../utils/navigateToDashboard";
import "./login.css";

import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import LoginGoogle from "../../components/auth/LoginGoogle";
import getFormData from "../../utils/getFormData";

export default function Login({ switchForm }) {
  const navigate = useNavigate();
  const [type, SetType] = useState("");
  const [number, setNumber] = useState("");
  const [userNow, setUserNow] = useState(null);
  const [phoneSignIn, setPhoneSignIn] = useState(false);
  const [mainVisible, setMainVisible] = useState(true);
  const [emailVerify, setEmailVerify] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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
        setForgotPassword(false);
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
      } else {
        const errorData = response.data;
        sessionStorage.removeItem("6amyoga_access_token");
        sessionStorage.removeItem("6amyoga_refresh_token");
        toast(errorData?.error, { type: "error" });
      }
    } catch (error) {
      sessionStorage.removeItem("6amyoga_access_token");
      sessionStorage.removeItem("6amyoga_refresh_token");
      // alert(import.meta.env.VITE_BACKEND_DOMAIN);
      // alert(error?.message);
      toast("Error!", { type: "error" });
    }
  };

  useEffect(() => {
    if (user && currentRole) {
      console.log("navigating to dashboard");
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
    toast("Please wait!");
    const formData = getFormData(e);
    console.log(formData.email_verify, "FORM DATAA");
    const response = await Fetch({
      url: "/user/forgot-password-email",
      method: "POST",
      data: {
        email_id: formData.email_verify,
      },
    });

    if (response.status === 200) {
      setVerifyShow(true);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      console.log("navigating based on id");
      if (type === "student") {
        navigate("/student/free-videos");
      } else if (type === "root") {
        navigate("/admin");
      } else if (type === "teacher") {
        navigate("/teacher");
      } else if (type === "institute_admin") {
        navigate("/institute");
      }
    }
  }, [user, type]);

  return (
    <main id="login-page" className="h-90 w-80 sm:w-96 lg:w-[440px]">
      <div className="mb-4 flex flex-col items-center gap-2">
        <img
          src="/logo_6am.png"
          alt="6AM Yoga"
          className="mx-auto max-h-24 my-4"
        />
        <div className="p-2 bg-blue-500 rounded-full text-white">
          <LockOutlined />
        </div>
        <h2 className="text-center">Sign In</h2>
      </div>
      {/* <hr /> */}
      {mainVisible && (
        <div className="mt-4 flex w-full flex-col items-center gap-1">
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
            <TextField name="username" label="Username" />
            {/* <TextField type="password" name="password" label="Password" /> */}
            <TextField
              label="Some label"
              variant="outlined"
              type={showPassword ? "text" : "password"} // <-- This is where the magic happens
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
            <Button variant="contained" type="submit" size="large">
              Login
            </Button>
          </form>
          <div className="my-6">
            <LoginGoogle />
          </div>

          {/* <hr /> */}
          <div className="flex justify-between w-full">
            <Button
              size="small"
              //   variant="text"
              variant="outlined"
              onClick={handleForgotPassword}
            >
              <span className="normal-case">Forgot Password</span>
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSearchParams({ register: true });
              }}
            >
              <span className="normal-case">
                Don't have an account? Sign up
              </span>
            </Button>
          </div>
        </div>
      )}

      {emailVerify && (
        <form onSubmit={emailVerifyFunc} className="flex flex-col gap-4">
          {" "}
          <Typography>Forgot Password</Typography>
          <TextField name="email_verify" label="Enter your Email ID" required />
          <Button type="submit" variant="contained">
            Send Email
          </Button>
        </form>
      )}

      {forgotPasswordVisible && userNow && (
        <form onSubmit={updateNewPassword} className="flex flex-col gap-4">
          <p>
            Setting password for user : <strong>{userNow?.username}</strong>
          </p>
          <p className={`text-sm border p-2 rounded-lg text-zinc-500`}>
            Password must be minimum 8 letters and contain atleast 1 number, 1
            alphabet, 1 special character [!@#$%^&*,?]
          </p>
          <TextField
            name="new_password"
            label="New Password"
            type="password"
            required
          />
          <TextField
            name="new_confirm_password"
            label="Confirm New Password"
            type="password"
            required
          />
          <Button type="submit" variant="contained">
            Reset Password
          </Button>
        </form>
      )}
    </main>
  );
}
