import { toast } from "react-toastify";
import { FetchRetry } from "../../../utils/Fetch";

export const AssignPlans = async (
	instituteId,
	planId,
	ownerId,
	toBeRegistered
) => {
	try {
		const response = await FetchRetry({
			url: "/user-plan/register",
			method: "POST",
			token: true,
			data: {
				...toBeRegistered,
				user_id: ownerId,
				institute_id: instituteId,
				plan_id: planId,
			},
			n: 3,
		});

		if (response?.status === 200) {
			toast("Plan subscribed successfully for Institute", {
				type: "success",
			});
		} else {
		}
	} catch (error) {
		console.error("Error fetching data:", error);
		toast(
			"Error subscribing plan for Institute; Any amount debited from your account will be refunded in 3 to 5 business days.",
			{ type: "error" }
		);
	}
};
