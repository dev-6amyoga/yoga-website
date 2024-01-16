import { Button, Input } from "@geist-ui/core";
import React, { useCallback, useEffect, useState } from "react";
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
  const [forgotPassword1, setForgotPassword1] = useState(false);
  const [user, userType, userPlan] = useUserStore(
    useShallow((state) => [state.user, state.userType, state.userPlan])
  );
  const [visible, setVisible] = useState(true);
  const [forgotp, setForgotp] = useState(false);

  const [
    setUser,
    setInstitutes,
    setUserType,
    setUserPlan,
    setCurrentInstituteId,
  ] = useUserStore(
    useShallow((state) => [
      state.setUser,
      state.setInstitutes,
      state.setUserType,
      state.setUserPlan,
      state.setCurrentInstituteId,
    ])
  );

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
  }, [user]);

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

  const func1 = () => {
    console.log("hellooo!!");
    setForgotPassword1(true);
    setVisible(false);
    setForgotp(false);
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
  }, [user, setInstitutes]);

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

  const updateNewPassword = async () => {
    const password = document.querySelector("#new_password").value;
    const confirm_password = document.querySelector(
      "#new_confirm_password"
    ).value;
    console.log(password, confirm_password);
    if (password != confirm_password) {
      toast("The two passwords don't match!");
    } else {
      toast("Updated successfully!");
    }
  };

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
      } else {
        const errorData = response.data;
        notify(errorData.error);
      }
    } catch (error) {
      notify(error.response.data.error);
    }
  };

  const forgotPassword = () => {
    setVisible(false);
    setForgotp(true);
  };

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
            <h6 onClick={forgotPassword}>
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
            <Button width="50%">Login with Phone Number</Button>
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
      {forgotp && (
        <div>
          <Otp onSuccessCallback={func1} />
        </div>
      )}

      {forgotPassword1 && (
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
