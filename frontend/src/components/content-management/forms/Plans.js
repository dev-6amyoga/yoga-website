import { Button, Input, Select } from "@geist-ui/core";
import { useEffect, useState } from "react";
export default function Plan() {
  const [userType1, setUserType1] = useState("");
  const handler = (val) => {
    setUserType1(val);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneNo = document.querySelector("#phone_no").value;
    const emailId = document.querySelector("#email_id").value;
    const name = document.querySelector("#name_user").value;
  };
  return (
    <div className="bg-white p-4 rounded-lg max-w-xl mx-auto">
      <h3 className="text-center text-2xl">Form Name</h3>
      <hr />
      <div className="flex flex-col gap-1 items-center w-full mt-4">
        <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
          <Input width="100%" id="name_user" placeholder="9999999999">
            Name
          </Input>
          <Input width="100%" id="phone_no" placeholder="9999999999">
            Phone
          </Input>
          <Input width="100%" id="email_id" placeholder="9999999999">
            Email
          </Input>

          <Select
            placeholder="Choose Account Type"
            onChange={handler}
            id="user_type"
          >
            <Select.Option value="student">Student</Select.Option>
            <Select.Option value="institute">Institute</Select.Option>
          </Select>
          <Button htmlType="submit">Register</Button>
        </form>
      </div>
    </div>
  );
}
