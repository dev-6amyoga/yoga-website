import { Button, Input, Modal } from "@geist-ui/core";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import CustomInput from "../../Common/CustomInput";

export default function AddCouponForm({ visible, setVisible }) {
  const handleAddCoupon = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    console.log();

    if (!formData.validity_from) return;

    formData.validity_from = new Date(formData.validity_from).toISOString();

    if (!formData.validity_to) return;

    formData.validity_to = new Date(formData.validity_to).toISOString();

    Fetch({
      url: "http://localhost:4000/discount-coupon/create",
      method: "POST",
      data: formData,
    })
      .then((res) => {
        toast(res?.data?.message, { type: "success" });
        setVisible(false);
      })
      .catch((err) => {
        console.log(err);
        toast(err.response?.data?.message, {
          type: "error",
        });
      });
  };
  return (
    <Modal visible={visible} onClose={() => setVisible(() => false)}>
      <Modal.Title>Add Discount Coupon</Modal.Title>
      <Modal.Content>
        <form className="flex flex-col gap-2" onSubmit={handleAddCoupon}>
          <Input name="coupon_name" w={"100%"}>
            Name
          </Input>

          <Input name="coupon_description" w={"100%"}>
            Description
          </Input>

          <Input name="discount_percentage" w={"100%"}>
            Discount Percentage (%)
          </Input>

          <CustomInput name="validity_from" type="datetime-local">
            Validity From
          </CustomInput>

          <CustomInput name="validity_to" type="datetime-local">
            Validity To
          </CustomInput>
          <div className="flex flex-row gap-2 justify-between mt-5">
            <Button
              onClick={(e) => {
                e.preventDefault();
                setVisible(false);
              }}
            >
              Cancel
            </Button>
            <Button htmlType="submit">Submit</Button>
          </div>
        </form>
      </Modal.Content>
    </Modal>
  );
}
