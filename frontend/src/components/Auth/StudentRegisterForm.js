import { Button, Input } from "@geist-ui/core";
import PhoneInput from "react-phone-number-input";
import { useState } from "react";
export default function StudentRegisterForm({ handleSubmit }) {
  const [phoneValue, setPhoneValue] = useState(""); // State to store phone number input value

  const handlePhoneChange = (value) => {
    setPhoneValue(value);
  };
  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      <Input width="100%" name="name" placeholder="John Doe">
        Name
      </Input>
      <Input width="100%" name="email_id" placeholder="abc@email.com">
        Email ID
      </Input>
      {/* <Input width="100%" name="phone_no" placeholder="9999999999">
        Phone Number
      </Input> */}
      <PhoneInput
        defaultCountry="IN"
        name="phone_no"
        placeholder="Enter Phone Number"
        value={phoneValue}
        onChange={handlePhoneChange}
      />

      <Input width="100%" name="username" placeholder="johnDoe123">
        Username
      </Input>
      <Input.Password width="100%" name="password">
        Password
      </Input.Password>
      <Input.Password width="100%" name="confirm_password">
        Confirm Password
      </Input.Password>
      <Button htmlType="submit">Register</Button>
    </form>
  );
}
