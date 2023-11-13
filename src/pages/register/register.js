import { Input, Text, Button, Radio, ButtonDropdown } from "@geist-ui/core";
import "./register.css";

export default function Register() {
  return (
    <div className="register">
      <h3>Register</h3>
      {/* <form onSubmit={handleSubmit}> */}
      <form>
        <Input width="100%" id="emailId">
          Email ID
        </Input>
        <Input width="100%" id="username">
          Username
        </Input>
        <Input width="100%" id="password">
          Password
        </Input>
        <Button htmlType="submit">Register</Button>
      </form>
    </div>
  );
}
