import { Button, Input, Tabs } from "@geist-ui/core";
// import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginGoogle from "../../components/Auth/LoginGoogle";
import "./register.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Register({ switchForm }) {
  const notify = (x) => toast(x);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneNo = document.querySelector("#phone_no").value;
    const emailId = document.querySelector("#email_id").value;
    const name = document.querySelector("#name_user").value;
    const username = document.querySelector("#user_name").value;
    const password = document.querySelector("#pass_word").value;
    const confirm_password = document.querySelector("#confirm_password").value;
    const newUser = {
      username: username,
      password: password,
      confirm_password: confirm_password,
      email: emailId,
      phone_number: phoneNo,
      name: name,
      institute_name: "Institute 1",
      role_name: "STUDENT",
      is_google_login: "FALSE",
    };
    try {
      const response = await fetch("http://localhost:4000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        notify("New User added successfully");
        setTimeout(() => {
          navigate("/student");
        }, 2000);
      } else {
        const errorData = await response.json();
        notify(errorData.error);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
      <h3 className="text-center text-2xl">Register</h3>
      <br />
      <Tabs initialValue="student" leftSpace="150px">
        <Tabs.Item
          label={
            <span style={{ textAlign: "center" }}>Register as Institute</span>
          }
          value="institute"
        >
          Register as Institute
        </Tabs.Item>
        <Tabs.Item label="Register as Student" value="student">
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <Input width="100%" id="name_user" placeholder="John Doe">
              Name
            </Input>
            <Input width="100%" id="email_id" placeholder="abc@email.com">
              Email ID
            </Input>
            <Input width="100%" id="phone_no" placeholder="9999999999">
              Phone Number
            </Input>
            <Input width="100%" id="user_name" placeholder="johnDoe123">
              Username
            </Input>
            <Input.Password width="100%" id="pass_word">
              Password
            </Input.Password>
            <Input.Password width="100%" id="confirm_password">
              Confirm Password
            </Input.Password>
            <Button htmlType="submit">Register</Button>
          </form>
        </Tabs.Item>
      </Tabs>
      <hr />
      <div className="flex flex-col gap-1 items-center w-full mt-4">
        <p onClick={() => switchForm((s) => !s)} className="hover:pointer">
          Already have an account?{" "}
          <span className="text-blue-500">Click Here</span>
        </p>
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
