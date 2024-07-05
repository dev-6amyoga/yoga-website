import { UpdateEmailForm } from "./UpdateEmailForm";
import UpdatePhoneForm from "./UpdatePhoneForm";

export default function UpdateContactDetails() {
	return (
		<div className="w-full">
			<h3>Update Email</h3>
			<UpdateEmailForm />

			<h3>Update Phone</h3>
			<UpdatePhoneForm />
		</div>
	);
}
