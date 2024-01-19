import { Button, Divider, Modal, Select, Table } from "@geist-ui/core";
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
  const [selectedPlans, setSelectedPlans] = useState(null);

  useEffect(() => {
    const fetchPlans = () => {
      Fetch({
        url: "http://localhost:4000/plan/get-all",
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
    console.log(plans);
  }, [plans]);
  const handleSelectPlan = (val) => {
    setSelectedPlans(val);
  };

  useEffect(() => {
    if (selectedPlans != null && selectedPlans.length === 41) {
      console.log(selectedPlans);
      let promises = [];
      selectedPlans.forEach((pid) => {
        promises.push(
          Fetch({
            url: "http://localhost:4000/discount-coupon/add-plan-mapping",
            method: "POST",
            data: {
              discount_coupon_id: coupon?.discount_coupon_id,
              plan_id: pid,
            },
          })
            .then((res) => {
              toast(res?.data?.message, { type: "success" });
            })
            .catch((err) => {
              console.log(err);
              toast(err?.response?.data?.message, { type: "error" });
            })
        );
      });

      Promise.all(promises)
        .then((values) => {})
        .catch((err) => {});
      getUpdatedCoupon(coupon?.discount_coupon_id);
    }
  }, [selectedPlans]);

  const handleAddPlanMapping = (e) => {
    e.preventDefault();

    if (!selectedPlans) {
      toast("Please select a plan", { type: "error" });
      return;
    }
    let promises = [];
    if (selectedPlans.includes("all-plans")) {
      setSelectedPlans(plans.map((plan) => String(plan?.plan_id)));
    }
    console.log(selectedPlans);
    if (selectedPlans.includes("all-plans")) {
      console.log("oh no");
    } else {
      console.log("oh yes");
      selectedPlans.forEach((pid) => {
        promises.push(
          Fetch({
            url: "http://localhost:4000/discount-coupon/add-plan-mapping",
            method: "POST",
            data: {
              discount_coupon_id: coupon?.discount_coupon_id,
              plan_id: pid,
            },
          })
            .then((res) => {
              toast(res?.data?.message, { type: "success" });
            })
            .catch((err) => {
              console.log(err);
              toast(err?.response?.data?.message, { type: "error" });
            })
        );
      });

      Promise.all(promises)
        .then((values) => {})
        .catch((err) => {});
      getUpdatedCoupon(coupon?.discount_coupon_id);
    }
  };

  const handleRemovePlanMapping = (plan_id) => {
    Fetch({
      url: "http://localhost:4000/discount-coupon/remove-plan-mapping",
      method: "POST",
      data: {
        discount_coupon_id: coupon?.discount_coupon_id,
        plan_id: plan_id,
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
            <p>No applicable plans</p>
          )}
        </div>

        <Divider />

        <form className="flex flex-col gap-2" onSubmit={handleAddPlanMapping}>
          <h4>Add Plan Mapping</h4>
          <Select
            multiple
            placeholder="Choose Plan"
            onChange={handleSelectPlan}
          >
            <Select.Option key="all-plans" value="all-plans">
              All Plans
            </Select.Option>
            {plans?.map((plan) => (
              <Select.Option
                key={"plan" + plan?.plan_id}
                value={String(plan?.plan_id)}
              >
                {plan?.name} [id: {plan?.plan_id}]
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
