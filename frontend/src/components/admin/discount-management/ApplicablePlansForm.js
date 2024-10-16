import { Button, Divider, Modal, Select, Table } from "@geist-ui/core";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";

export default function ApplicablePlansForm({
  coupon,
  visible,
  setVisible,
  getUpdatedCoupon,
}) {
  const [plans, setPlans] = useState([]);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [selectedCustomPlans, setSelectedCustomPlans] = useState([]);
  const [customPlans, setCustomPlans] = useState([]);
  // FULLDISCOUNT100;

  useEffect(() => {
    const fetchPlans = () => {
      Fetch({
        url: "/plan/get-all",
      })
        .then((res) => {
          setPlans(res.data?.plans ?? []);
        })
        .catch((err) => {
          toast("Error fetching plans", { type: "error" });
        });
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    // get all custom plans
    const fetchCustomPlans = () => {
      Fetch({
        url: "/customPlan/getAllCustomPlans",
      })
        .then((res) => {
          setCustomPlans(res.data?.custom_plans ?? []);
        })
        .catch((err) => {
          toast("Error fetching custom plans", { type: "error" });
        });
    };

    fetchCustomPlans();
  }, []);

  // useEffect(() => {
  // 	console.log(plans);
  // }, [plans]);

  // useEffect(() => {
  // 	if (selectedPlans != null) {
  // 		let promises = [];
  // 		selectedPlans.forEach((pid) => {
  // 			promises.push(
  // 				Fetch({
  // 					url: "/discount-coupon/add-plan-mapping",
  // 					method: "POST",
  // 					data: {
  // 						discount_coupon_id: coupon?.discount_coupon_id,
  // 						plan_id: pid,
  // 					},
  // 				})
  // 					.then((res) => {
  // 						toast(res?.data?.message, { type: "success" });
  // 					})
  // 					.catch((err) => {
  // 						console.log(err);
  // 						toast(err?.response?.data?.message, {
  // 							type: "error",
  // 						});
  // 					})
  // 			);
  // 		});

  // 		Promise.all(promises)
  // 			.then((values) => {})
  // 			.catch((err) => {});
  // 		getUpdatedCoupon(coupon?.discount_coupon_id);
  // 	}
  // }, [selectedPlans]);

  const handleAddPlanMapping = (e) => {
    e.preventDefault();

    if (
      selectedPlans === null ||
      selectedCustomPlans === null ||
      (selectedPlans.length === 0 && selectedCustomPlans.length === 0)
    ) {
      toast("Please select a plan", { type: "error" });
      return;
    }

    let promises = [];

    let finalPlans = [];

    if (selectedPlans.includes("all-plans")) {
      finalPlans = [
        ...plans.map((plan) => ({
          plan_id: plan?.plan_id,
          is_custom_plan: false,
        })),
      ];
    } else {
      finalPlans = [
        ...selectedPlans.map((pid) => ({
          plan_id: pid,
          is_custom_plan: false,
        })),
      ];
    }

    if (selectedCustomPlans.includes("all-custom-plans")) {
      finalPlans = [
        ...finalPlans,
        ...customPlans.map((plan) => ({
          plan_id: String(plan?._id),
          is_custom_plan: true,
        })),
      ];
    } else {
      finalPlans = [
        ...finalPlans,
        ...selectedCustomPlans.map((pid) => ({
          plan_id: pid,
          is_custom_plan: true,
        })),
      ];
    }

    finalPlans.forEach((plan) => {
      promises.push(
        Fetch({
          url: "/discount-coupon/add-plan-mapping",
          method: "POST",
          data: {
            discount_coupon_id: coupon?.discount_coupon_id,
            plan_id: plan.plan_id,
            is_custom_plan: plan.is_custom_plan,
          },
        })
      );
    });

    Promise.all(promises)
      .then((values) => {
        getUpdatedCoupon(coupon?.discount_coupon_id);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to add plan mapping");
      });
  };

  const handleRemovePlanMapping = (plan_id, is_custom_plan = false) => {
    Fetch({
      url: "/discount-coupon/remove-plan-mapping",
      method: "POST",
      data: {
        discount_coupon_id: coupon?.discount_coupon_id,
        plan_id: plan_id,
        is_custom_plan,
      },
    })
      .then((res) => {
        toast(res.data.message, { type: "success" });
        getUpdatedCoupon(coupon?.discount_coupon_id);
      })
      .catch((err) => {
        toast(err.response?.data?.message, { type: "error" });
      });
  };

  const handleDownload = (data1) => {
    const csv = Papa.unparse(data1);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal visible={visible} onClose={() => setVisible(false)}>
      <Modal.Title>Applicable Plans</Modal.Title>
      <Modal.Content>
        <div className="flex flex-col gap-2">
          <h4>Current Plans</h4>
          {coupon.discount_coupon_applicable_plans &&
          coupon.discount_coupon_applicable_plans.length > 0 ? (
            <Table data={coupon.discount_coupon_applicable_plans}>
              <Table.Column
                prop="plan.plan_id"
                label="Plan ID"
                render={(val, row, idx) => <p>{row?.plan?.plan_id}</p>}
              />
              <Table.Column
                prop="plan.name"
                label="Plan Name"
                render={(val, row, idx) => <p>{row?.plan?.name}</p>}
              />
              <Table.Column
                prop="plan.plan_user_type"
                label="Plan User Type"
                render={(val, row, idx) => <p>{row?.plan?.plan_user_type}</p>}
              />
              <Table.Column
                label="Actions"
                render={(val, row, idx) => (
                  <Button
                    scale={0.4}
                    width={0.4}
                    onClick={() => handleRemovePlanMapping(row.plan.plan_id)}
                  >
                    Remove
                  </Button>
                )}
              />
            </Table>
          ) : (
            <p className="text-sm">No applicable plans</p>
          )}
          <Divider />

          <h4>Current Custom Plans</h4>
          {coupon.discount_coupon_applicable_custom_plans &&
          coupon.discount_coupon_applicable_custom_plans.length > 0 ? (
            <Table data={coupon.discount_coupon_applicable_custom_plans}>
              <Table.Column
                prop="plan._id"
                label="Plan ID"
                render={(val, row, idx) => <p>{row?.plan?._id}</p>}
              />
              <Table.Column
                prop="plan.plan_name"
                label="Plan Name"
                render={(val, row, idx) => <p>{row?.plan?.plan_name}</p>}
              />
              {/* <Table.Column
								prop="plan.plan_user_type"
								label="Plan User Type"
								render={(val, row, idx) => (
									<p>{row?.plan?.plan_user_type}</p>
								)}
							/> */}
              <Table.Column
                label="Actions"
                render={(val, row, idx) => (
                  <Button
                    scale={0.4}
                    width={0.4}
                    onClick={() => handleRemovePlanMapping(row.plan._id, true)}
                  >
                    Remove
                  </Button>
                )}
              />
            </Table>
          ) : (
            <p className="text-sm">No applicable custom plans</p>
          )}
        </div>

        <Divider />

        <form className="flex flex-col gap-2" onSubmit={handleAddPlanMapping}>
          <h4>Add Plan Mapping</h4>
          <Select
            multiple
            placeholder="Choose Plan"
            onChange={(val) => setSelectedPlans(val)}
          >
            <Select.Option key="all-plans" value="all-plans">
              All Plans
            </Select.Option>
            {plans?.map((plan) => (
              <Select.Option key={"plan" + plan?.plan_id} value={plan?.plan_id}>
                {plan?.name} [id: {plan?.plan_id}]
              </Select.Option>
            ))}
          </Select>

          <Select
            multiple
            placeholder="Choose Custom Plan"
            onChange={(val) => setSelectedCustomPlans(val)}
          >
            <Select.Option key="all-custom-plans" value="all-custom-plans">
              All Custom Plans
            </Select.Option>
            {customPlans?.map((plan) => (
              <Select.Option
                key={"custom-plan" + plan?._id}
                value={String(plan?._id)}
              >
                {plan?.plan_name} [id: {plan?._id}]
              </Select.Option>
            ))}
          </Select>

          <Button htmlType="submit">Add Plan</Button>
        </form>
      </Modal.Content>
      <Modal.Action onClick={() => setVisible(false)}>Cancel</Modal.Action>
    </Modal>
  );
}
