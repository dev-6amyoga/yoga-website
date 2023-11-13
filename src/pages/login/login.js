import { GoogleOAuthProvider } from "@react-oauth/google";
import Login_page from "./login_page";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Input, Text, Button, Radio, ButtonDropdown } from "@geist-ui/core";
import axios from "axios";
import "./login.css";

export default function Login() {
  const [loginStatus, setLoginStatus] = useState(null);
  const navigate = useNavigate();
  const [type, SetType] = useState("");
  async function verify_login(username, password) {
    try {
      const baseURL = "http://localhost:4000";
      const response = await axios.get(`${baseURL}/allUsers`);
      var userExists = false;
      for (const entry of response.data) {
        if (entry.username === username && entry.password === password) {
          userExists = true;
          SetType(entry.user_type);
          break;
        }
      }
      setLoginStatus(userExists ? "Login successful" : "Invalid credentials");
    } catch (error) {
      console.error(error);
      setLoginStatus("Failed to verify login");
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const username = document.querySelector("#user_name").value;
    const password = document.querySelector("#pass_word").value;
    verify_login(username, password);
  };

  useEffect(() => {
    if (loginStatus === "Login successful" && type === "student") {
      navigate("/student");
    } else if (loginStatus === "Login successful" && type === "admin") {
      navigate("/admin");
    } else if (loginStatus === "Login successful" && type === "teacher") {
      navigate("/teacher");
    }
  }, [loginStatus, navigate]);

  return (
    <div className="outer">
      <h3>Login</h3>
      <div className="login_normal">
        <form onSubmit={handleSubmit}>
          <Input width="100%" id="user_name">
            Username
          </Input>
          <Input width="100%" id="pass_word">
            Password
          </Input>
          <Button htmlType="submit">Login</Button>
        </form>
      </div>
    </div>
  );
}
