import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";

export const AssignPlans = async (
	instituteId,
	planId,
	ownerId,
	toBeRegistered
) => {
	try {
		const response = await Fetch({
			url: "/user-plan/register",
			method: "POST",
			token: true,
			data: toBeRegistered,
		});
		if (response?.status === 200) {
			toast("Plan subscribed successfully for Institute", {
				type: "success",
			});
		} else {
		}
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};
