import { Button, Input, Modal } from "@geist-ui/core";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";

export default function EditCouponForm({ visible, setVisible, coupon }) {
	console.log(coupon);
	const formDate = (timestampString) => {
		const d = new Date(timestampString);

		const l = new Date(
			d.toLocaleString("en-US", {
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			})
		);

		//YYYY-mm-ddTHH:MM:SS
	};

	return (
		<Modal visible={visible} onClose={() => setVisible(() => false)}>
			<Modal.Title>Edit Discount Coupon</Modal.Title>
			<Modal.Content>
				{coupon ? (
					<form
						className="flex flex-col gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							const formData = getFormData(e);

							if (!formData.validity_from) return;

							formData.validity_from = new Date(
								formData.validity_from
							).toISOString();

							if (!formData.validity_to) return;

							formData.validity_to = new Date(
								formData.validity_to
							).toISOString();
							Fetch({
								url: "/discount-coupon/update",
								method: "POST",
								data: {
									...formData,
									discount_coupon_id:
										coupon?.discount_coupon_id,
								},
							})
								.then((res) => {
									toast(res?.data?.message, {
										type: "success",
									});
									setVisible(false);
								})
								.catch((err) => {
									console.log(err);
									toast(err.response?.data?.message, {
										type: "error",
									});
								});
						}}>
						<Input
							name="coupon_name"
							w={"100%"}
							initialValue={coupon?.coupon_name}>
							Name
						</Input>

						<Input
							name="coupon_description"
							w={"100%"}
							initialValue={coupon?.coupon_description}>
							Description
						</Input>

						<Input
							name="discount_percentage"
							w={"100%"}
							initialValue={coupon?.discount_percentage}>
							Discount Percentage (%)
						</Input>

						<Input
							name="validity_from"
							htmlType="datetime-local"
							w={"100%"}
							initialValue={formDate(coupon?.validity_from)}>
							Validity From
						</Input>

						<Input
							name="validity_to"
							htmlType="datetime-local"
							w={"100%"}
							initialValue={formDate(coupon?.validity_to)}>
							Validity To
						</Input>

						<div className="flex flex-row gap-2 justify-between mt-5">
							<Button
								onClick={(e) => {
									e.preventDefault();
									setVisible(false);
								}}>
								Cancel
							</Button>
							<Button htmlType="submit">Submit</Button>
						</div>
					</form>
				) : (
					<></>
				)}
			</Modal.Content>
		</Modal>
	);
}
