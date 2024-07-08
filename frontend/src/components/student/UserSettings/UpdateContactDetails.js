import { Spacer } from "@geist-ui/core";
import { UpdateEmailForm } from "./UpdateEmailForm";
import UpdatePhoneForm from "./UpdatePhoneForm";

export default function UpdateContactDetails() {
  return (
    <div className="w-full">
      <h3>Update Email</h3>
      <Spacer />
      <UpdateEmailForm />

      <h3>Update Phone</h3>
      <Spacer />
      <UpdatePhoneForm />
    </div>
  );
}
