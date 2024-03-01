import { Button, Table, Tag, useToasts } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import AddCouponForm from "../../../components/admin/discount-management/AddCouponForm";
import ApplicablePlansForm from "../../../components/admin/discount-management/ApplicablePlansForm";
import EditCouponForm from "../../../components/admin/discount-management/EditCouponForm";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function DiscountManagement() {
	const [coupons, setCoupons] = useState([]);
	const [usageHistory, setUsageHistory] = useState([]);
	const [addCouponModal, setAddCouponModal] = useState(false);
	const [editCouponModal, setEditCouponModal] = useState(false);
	const [applicablePlansModal, setApplicablePlansModal] = useState(false);
	const [editCoupon, setEditCoupon] = useState({});
	const { setToast } = useToasts();

	const displayDate = (val) => {
		return new Date(val).toLocaleString();
	};

	const displayValidity = (val, row, idx) => {
		return (
			<div key={"validity-" + idx} className="m-2">
				<Tag>{displayDate(row.validity_from)}</Tag> {"To"}
				<Tag>{displayDate(row.validity_to)}</Tag>
			</div>
		);
	};

	const fetchCoupons = () => {
		Fetch({
			url: "/discount-coupon/get-all",
			method: "POST",
		})
			.then((res) => {
				// console.log(res.data);
				setCoupons(res.data.discount_coupons);
			})
			.catch((err) => {
				toast("Something went wrong", { type: "error" });
			});
	};

	const fetchCoupon = (discount_coupon_id) => {
		Fetch({
			url: "/discount-coupon/get-by-id",
			method: "POST",
			data: { discount_coupon_id },
		})
			.then((res) => {
				console.log(res.data);
				setEditCoupon(res.data.discount_coupon);
				setCoupons((p) => {
					const idx = p.findIndex(
						(coupon) =>
							coupon.discount_coupon_id === discount_coupon_id
					);
					if (idx === -1) return p;
					p[idx] = res.data.discount_coupon;
					return p;
				});
				toast("Coupon updated", { type: "success" });
			})
			.catch((err) => {
				toast("Error fetching coupon", { type: "error" });
			});
	};

	const handleCouponDelete = (id) => {
		Fetch({
			url: "/discount-coupon/delete",
			method: "DELETE",
			data: { discount_coupon_id: id },
		})
			.then((res) => {
				toast(res.data.message, { type: "success" });
				fetchCoupons();
			})
			.catch((err) => {
				toast(err.response?.data?.message, { type: "error" });
			});
	};

	useEffect(() => {
		if (!addCouponModal || !editCouponModal || !applicablePlansModal) {
			fetchCoupons();
		}
	}, [addCouponModal, editCouponModal, applicablePlansModal]);

	// useEffect(() => {
	//     if (!applicablePlansModal) {
	//         setEditCoupon({});
	//     }
	// }, [applicablePlansModal]);

	return (
		<AdminPageWrapper heading="Discount Management">
			<div>
				<div className="my-20">
					<div className="flex justify-between items-center my-5">
						<h2>Coupons</h2>
						<div className="flex flex-row gap-2">
							<Button
								onClick={() => setAddCouponModal((p) => true)}>
								Add
							</Button>

							<Button onClick={fetchCoupons}>Refresh</Button>

							<AddCouponForm
								visible={addCouponModal}
								setVisible={setAddCouponModal}
							/>

							<EditCouponForm
								visible={editCouponModal}
								setVisible={setEditCouponModal}
								coupon={editCoupon}
							/>

							<ApplicablePlansForm
								visible={applicablePlansModal}
								setVisible={setApplicablePlansModal}
								coupon={editCoupon}
								getUpdatedCoupon={fetchCoupon}
							/>
						</div>
					</div>

					<Table data={coupons}>
						<Table.Column prop="coupon_name" label="Coupon Name" />
						<Table.Column
							prop="coupon_description"
							label="Coupon Description"
							className="max-w-xs break-words break-all"
						/>
						<Table.Column
							prop="discount_percentage"
							label="Discount Percentage"
						/>
						<Table.Column
							prop="created"
							label="Created"
							render={displayDate}
						/>
						<Table.Column
							prop="validity"
							label="Validity"
							render={displayValidity}
						/>
						<Table.Column
							label="Actions"
							render={(val, row, idx) => {
								return (
									<div
										className="flex flex-row gap-2"
										key={"coupon-action-" + idx}>
										<Button
											scale={0.7}
											width={0.7}
											onClick={() => {
												setEditCoupon(row);
												setApplicablePlansModal(true);
											}}>
											View Plans
										</Button>
										<Button
											scale={0.7}
											width={0.7}
											onClick={() => {
												setEditCoupon(row);
												setEditCouponModal(true);
											}}>
											Edit
										</Button>
										<Button
											type="error"
											scale={0.7}
											width={0.7}
											onClick={() => {
												setToast({
													id: `delete-${row.discount_coupon_id}`,
													text: `Are you sure you want to delete discount coupon : ${row.coupon_name}?`,
													actions: [
														{
															name: "Delete",
															handler: () => {
																handleCouponDelete(
																	row.discount_coupon_id
																);
															},
														},
													],
												});
											}}>
											Delete
										</Button>
									</div>
								);
							}}
						/>
					</Table>
				</div>

				<div className="my-20">
					<div className="flex justify-between items-center my-5">
						<h2>Coupon Usage History</h2>
						<div className="flex flex-row gap-2">
							<Button>Export</Button>
							<Button>Refresh</Button>
						</div>
					</div>

					<Table data={usageHistory}>
						<Table.Column
							label="Transaction ID"
							render={(val, row, idx) => {}}
						/>
						<Table.Column
							label="Coupon"
							render={(val, row, idx) => {}}
						/>
						<Table.Column
							label="Plan"
							render={(val, row, idx) => {}}
						/>
						<Table.Column
							label="User"
							render={(val, row, idx) => {}}
						/>
						<Table.Column
							label="Transaction Date"
							render={(val, row, idx) => {}}
						/>
					</Table>
				</div>
			</div>
		</AdminPageWrapper>
	);
}

export default withAuth(DiscountManagement, ROLE_ROOT);
