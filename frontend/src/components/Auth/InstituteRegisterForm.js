import { Button, Input, Spacer } from "@geist-ui/core";

export default function InstituteRegisterForm({ handleSubmit }) {
  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      <Spacer y={4} />
      <p>Institute Owner Details</p>
      <div className="flex flex-col gap-4 w-full">
        <Input width="100%" name="name" placeholder="John Doe" required>
          Name
        </Input>
        <Input
          width="100%"
          name="user_email"
          placeholder="abc@email.com"
          required
        >
          Email ID
        </Input>
        <Input width="100%" name="phone" placeholder="9999999999" required>
          Phone Number
        </Input>
        <Input width="100%" name="username" placeholder="johnDoe123" required>
          Username
        </Input>
        <Input.Password width="100%" name="password" required>
          Password
        </Input.Password>
        <Input.Password width="100%" name="confirm_password" required>
          Confirm Password
        </Input.Password>
      </div>

      <Spacer y={4} />

      <p>Institute Details</p>
      <div className="flex flex-col gap-4 w-full">
        <Input width="100%" name="institute_name" required>
          Institute Name
        </Input>
        <Input
          width="100%"
          name="address1"
          placeholder="No.XXX, XZY Road, XX Cross"
          required
        >
          Address 1
        </Input>
        <Input
          width="100%"
          id="address2"
          placeholder="XX Block, XXX Layout, City, State"
          required
        >
          Address 2
        </Input>
        <Input width="100%" name="pincode" required>
          Pincode
        </Input>
        <Input width="100%" name="billing_address" required>
          Billing Address
        </Input>
        <Input width="100%" name="contact_email" required>
          Contact Email
        </Input>
        <Input
          width="100%"
          name="contact_phone"
          placeholder="9999999999"
          required
        >
          Contact Phone Number
        </Input>
      </div>
      <Button htmlType="submit">Register</Button>
    </form>
  );
}
