import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { USER_PLAN_ACTIVE } from "../../enums/user_plan_status";
import { Fetch } from "../../utils/Fetch";

export const usePlanAllocator = (teacher_id, institute_id) => {
	const [instituteOwnerId, setInstituteOwnerId] = useState(0);
	const [userPlan, setUserPlan] = useState({});

	useEffect(() => {
		const fetchData = async () => {
			console.log("hi!");
			if (institute_id > 0) {
				try {
					Fetch({
						url: "/user/get-by-instituteid",
						method: "POST",
						data: {
							institute_id: institute_id,
						},
					}).then((res) => {
						if (res.status === 200) {
							setInstituteOwnerId(res.data.users[0].user_id);
							Fetch({
								url: "/user-plan/get-active-user-plan-by-id",
								method: "POST",
								data: {
									user_id: res.data.users[0].user_id,
								},
							}).then((res) => {
								if (res.status === 200) {
									setUserPlan(res.data.userPlan[0]);
									const toBeChecked = {
										transaction_order_id:
											res.data.userPlan[0]
												.transaction_order_id,
										current_status: USER_PLAN_ACTIVE,
										user_type: "TEACHER",
										user_id: teacher_id,
										plan_id: res.data.userPlan[0].plan_id,
										institute_id: institute_id,
									};
									const toBeRegistered = {
										transaction_order_id:
											res.data.userPlan[0]
												.transaction_order_id,
										current_status: "ACTIVE",
										user_type: "TEACHER",
										user_id: teacher_id,
										plan_id: res.data.userPlan[0].plan_id,
										institute_id: institute_id,
										purchase_date:
											res.data.userPlan[0].purchase_date,
										validity_from:
											res.data.userPlan[0].validity_from,
										validity_to:
											res.data.userPlan[0].validity_to,
										cancellation_date:
											res.data.userPlan[0]
												.cancellation_date,
										auto_renewal_enabled:
											res.data.userPlan[0]
												.auto_renewal_enabled,
										discount_coupon_id:
											res.data.userPlan[0]
												.discount_coupon_id,
										referral_code_id:
											res.data.userPlan[0]
												.referral_code_id,
									};
									console.log(toBeChecked);
									Fetch({
										url: "/user-plan/get-user-plan-by-details",
										method: "POST",
										data: toBeChecked,
									}).then(async (res) => {
										if (res.status === 200) {
											if (
												res.data.userPlan.length === 0
											) {
												toast("Adding now!");
												const response = await Fetch({
													url: "/user-plan/register",
													method: "POST",
													data: toBeRegistered,
												});
												if (response?.status === 200) {
													toast(
														"Plan subscribed successfully ",
														{
															type: "success",
														}
													);
												} else {
													toast(
														"Failed to subscribe plan for teacher",
														{
															type: "error",
														}
													);
												}
											} else {
												console.log(res.data);
											}
										}
									});
									console.log(toBeChecked);
									toast("User Plan Fetched");
								}
							});
						}
					});
				} catch (error) {
					console.error("Error fetching data:", error);
				}
			}
		};

		fetchData();
	}, [institute_id]);

	return { instituteOwnerId, userPlan };
};
