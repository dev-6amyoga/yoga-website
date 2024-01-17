import { Button, Input } from "@geist-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useShallow } from "zustand/react/shallow";
import LoginGoogle from "../../components/auth/LoginGoogle";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import getFormData from "../../utils/getFormData";
import Otp from "../otp/Otp";
import "./login.css";

export default function Login({ switchForm }) {
  const navigate = useNavigate();
  const notify = (x) => toast(x);
  const [number, setNumber] = useState("");
  const [userNow, setUserNow] = useState({});
  const [forgotPassword, setForgotPassword] = useState(false);
  const [phoneSignIn, setPhoneSignIn] = useState(false);
  // const [user, userType, userPlan] = useUserStore(
  //   useShallow((state) => [state.user, state.userType, state.userPlan])
  // );
  const [visible, setVisible] = useState(true);
  const [forgotp, setForgotp] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([
    "6amyoga_access_token",
    "6amyoga_refresh_token",
  ]);

  const [
    user,
    setUser,
    userType,
    userPlan,
    setUserPlan,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    currentInstituteId,
    setCurrentInstituteId,
    institutes,
    setInstitutes,
    currentRole,
    setCurrentRole,
    roles,
    setRoles,
  ] = useUserStore(
    useShallow((state) => [
      state.user,
      state.setUser,
      state.userType,
      state.userPlan,
      state.setUserPlan,
      state.accessToken,
      state.setAccessToken,
      state.refreshToken,
      state.setRefreshToken,
      state.currentInstituteId,
      state.setCurrentInstituteId,
      state.institutes,
      state.setInstitutes,
      state.currentRole,
      state.setCurrentRole,
      state.roles,
      state.setRoles,
    ])
  );

  useEffect(() => {
    if (number.length > 0) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            "http://localhost:4000/user/get-by-phone",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ phone: number }),
            }
          );
          const data = await response.json();
          console.log(phoneSignIn);
          if (data["user"]) {
            setUserNow(data["user"]);
            if (phoneSignIn) {
              setUser(data["user"]);
              setUserType(data["user"]["role"]["name"]);
            }
          }
          console.log(data);
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }
  }, [number]);

  useEffect(() => {
    if (user) {
      console.log(user);
      fetchUserPlan()
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          fetchUserInstitutes()
            .then(() => {})
            .catch(() => {})
            .finally(() => {
              notify("Logged in successfully");
              navigateToDashboard();
            });
        });
    }
  }, [user]);

  const phoneSignInFunction = () => {
    setVisible(false);
    setPhoneSignIn(true);
  };

  const fetchUserPlan = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "http://localhost:4000/user-plan/get-user-plan-by-id",
        method: "POST",
        data: {
          user_id: user?.user_id,
        },
      });
      if (response.data["userPlan"]) {
        setUserPlan(response.data["userPlan"]);
      } else {
        setUserPlan(null);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [user, setUserPlan]);

  const signWithPhone = () => {
    setPhoneSignIn(false);
    setUser(userNow.user);
    setUserType(userNow.user.role.name);
  };
  const func1 = (number) => {
    setNumber(number);
    setVisible(false);
    if (phoneSignIn) {
      console.log("phone sign in !!!!");
      signWithPhone();
    } else {
      setForgotPassword(true);
      setForgotp(false);
    }
  };
  const fetchUserInstitutes = useCallback(async () => {
    try {
      const response = await Fetch({
        url: "http://localhost:4000/institute/get-all-by-userid",
        method: "POST",
        data: {
          user_id: user?.user_id,
        },
      });

      if (response.data["institutes"]) {
        setInstitutes(response.data["institutes"]);
        if (
          response.data["institutes"] != null &&
          response.data["institutes"].length > 0
        ) {
          setCurrentInstituteId(response.data["institutes"][0].institute_id);
        }
      } else {
        setInstitutes([]);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }, [user, setInstitutes, setCurrentInstituteId]);

  const navigateToDashboard = useCallback(() => {
    const type = userType || user?.role?.name;

    switch (type) {
      case "ROOT":
        navigate("/admin");
        break;
      case "TEACHER":
        navigate("/teacher");
        break;
      case "INSTITUTE_OWNER":
        navigate("/institute");
        break;
      case "STUDENT":
        if (userPlan === null || userPlan.plan_id === 0) {
          navigate("/student/free-videos");
        } else {
          navigate("/student/playlist-view");
        }
        break;
      default:
        navigate("/");
        break;
    }
  }, [user, userType, userPlan, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    try {
      const response = await Fetch({
        url: "http://localhost:4000/auth/login",
        method: "POST",
        data: formData,
      });

      if (response && response.status === 200) {
        const userData = response.data;
        setUser(userData.user);
        setUserType(userData.user.role.name);
        setAccessToken(userData?.accessToken);
        setRefreshToken(userData?.refreshToken);

        // set token cookies
        setCookie("6amyoga_access_token", userData?.accessToken);
        setCookie("6amyoga_refresh_token", userData?.refreshToken);

        // console.log(userData);
      } else {
        const errorData = response.data;
        removeCookie("6amyoga_access_token");
        removeCookie("6amyoga_refresh_token");
        notify(errorData.error);
      }
    } catch (error) {
      removeCookie("6amyoga_access_token");
      removeCookie("6amyoga_refresh_token");
      notify(error.response.data.error);
    }
  };

  const handleForgotPassword = () => {
    setVisible(false);
    setForgotp(true);
  };

  useEffect(() => {
    if (user) {
      fetchUserPlan()
        .then(() => {})
        .catch(() => {})
        .finally(() => {
          fetchUserInstitutes()
            .then(() => {})
            .catch(() => {})
            .finally(() => {
              notify("Logged in successfully");
              navigateToDashboard();
            });
        });
    }
  }, [user, fetchUserPlan, fetchUserInstitutes, navigateToDashboard]);

  return (
    <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
      <h3 className="text-center text-2xl">Login</h3>
      <hr />
      {visible && (
        <div className="flex flex-col gap-1 items-center w-full mt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <Input width="100%" name="username">
              Username
            </Input>
            <Input.Password width="100%" name="password">
              Password
            </Input.Password>
            <h6 onClick={handleForgotPassword}>
              Forgot Password? <span className="text-blue-500">Click Here</span>
            </h6>
            <Button type="warning" htmlType="submit">
              Login
            </Button>
          </form>
          <p>{"( or )"}</p>
          <div className="flex flex-row	">
            <LoginGoogle />
            &nbsp; &nbsp;
            <Button width="50%" onClick={phoneSignInFunction}>
              Login with Phone Number
            </Button>
          </div>
          <br />
          <h5 onClick={() => switchForm((s) => !s)} className="hover:pointer">
            Dont have an account?{" "}
            <span className="text-blue-500">Click Here</span>
          </h5>
          <div>
            <ToastContainer />
          </div>
        </div>
      )}
      {(forgotp || phoneSignInVisible) && (
        <div>
          <Otp onSuccessCallback={func1} />
        </div>
      )}

      {forgotPassword && (
        <div>
          <Input.Password width="100%" id="new_password">
            Password
          </Input.Password>
          <Input.Password width="100%" id="new_confirm_password">
            Confirm Password
          </Input.Password>
          <Button onClick={updateNewPassword}>Reset Password</Button>
        </div>
      )}
    </div>
  );
}
