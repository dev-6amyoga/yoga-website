import { Button, Input } from "@geist-ui/core";
import React, { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useShallow } from "zustand/react/shallow";
import LoginGoogle from "../../components/Auth/LoginGoogle";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import getFormData from "../../utils/getFormData";
import "./login.css";

export default function Login({ switchForm }) {
  const navigate = useNavigate();
  const notify = (x) => toast(x);
  const [user, userType, userPlan] = useUserStore(
    useShallow((state) => [state.user, state.userType, state.userPlan])
  );

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
          // console.log('finally?');
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
    console.log("Fetching user plan for : ", user?.user_id, " ...");
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

  const fetchUserInstitutes = useCallback(async () => {
    // console.log('Fetching user institute for : ', user?.user_id, ' ...');
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
        console.log(userPlan);
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

        // console.log(userData.user);
        setUser(userData.user);
        setUserType(userData.user.role.name);
      } else {
        const errorData = response.data;
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
      <h3 className="text-center text-2xl">Login</h3>
      <hr />
      <div className="flex flex-col gap-1 items-center w-full mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <Input width="100%" name="username">
            Username
          </Input>
          <Input.Password width="100%" name="password">
            Password
          </Input.Password>
          <Button htmlType="submit">Login</Button>
        </form>
        <p onClick={() => switchForm((s) => !s)} className="hover:pointer">
          Dont have an account?{" "}
          <span className="text-blue-500">Click Here</span>
        </p>
        <p>{"( or )"}</p>
        <div>
          <ToastContainer />
        </div>
        <div>
          <LoginGoogle />
        </div>
      </div>
    </div>
  );
}
