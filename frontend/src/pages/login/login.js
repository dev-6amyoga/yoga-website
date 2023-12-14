import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "@geist-ui/core";
import LoginGoogle from "../../components/Auth/LoginGoogle";
import useUserStore from "../../store/UserStore";
import "./login.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login({ switchForm }) {
  const navigate = useNavigate();
  const notify = (x) => toast(x);
  const [loginStatus, setLogInStatus] = useState(false);
  const [userType, setUserType] = useState("");
  const [userPlan, setUserPlan] = useState({});
  const [planId, setPlanId] = useState(0);

  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = document.querySelector("#user_name").value;
    const password = document.querySelector("#pass_word").value;
    const existingUser = {
      username: username,
      password: password,
    };
    try {
      const response = await fetch("http://localhost:4000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(existingUser),
      });
      if (response.ok) {
        notify("Logged in successfully");
        setLogInStatus(true);
        const userData = await response.json();
        setUser(userData.user);
        try {
          const response = await fetch(
            "http://localhost:4000/user-plan/get-user-plan-by-id",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ user_id: userData.user.user_id }),
            }
          );
          const data = await response.json();
          if (data["userPlan"]) {
            setUserPlan(data["userPlan"]);
            setPlanId(data["userPlan"]["plan_id"]);
          } else {
            setPlanId(0);
          }
        } catch (error) {
          console.log(error);
        }
        //check if user has a plan and set some var as true or false
        setUserType(userData.user.role.name);
      } else {
        const errorData = await response.json();
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (loginStatus === true && userType === "STUDENT") {
      if (planId === 0) {
        const navigateTimeout = setTimeout(
          () => navigate("/student/free-videos"),
          1500
        );
      } else {
        const navigateTimeout = setTimeout(
          () => navigate("/student/playlist-view"),
          1500
        );
      }
    } else if (loginStatus === true && userType === "ROOT") {
      const navigateTimeout = setTimeout(() => navigate("/admin"), 1500);
      return () => clearTimeout(navigateTimeout);
    } else if (loginStatus === true && userType === "TEACHER") {
      const navigateTimeout = setTimeout(() => navigate("/teacher"), 1500);
      return () => clearTimeout(navigateTimeout);
    }
  }, [loginStatus, userType, navigate]);

  return (
    <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
      <h3 className="text-center text-2xl">Login</h3>
      <hr />
      <div className="flex flex-col gap-1 items-center w-full mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <Input width="100%" id="user_name">
            Username
          </Input>
          <Input.Password width="100%" id="pass_word">
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
