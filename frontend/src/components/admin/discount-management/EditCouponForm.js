import { Button, Input, Modal } from "@geist-ui/core";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import CustomInput from "../../Common/CustomInput";

export default function EditCouponForm({ visible, setVisible, coupon }) {
  const formDate = (timestampString) => {
    const d = new Date(timestampString);

    return `${d.getUTCFullYear()}-${
      d.getUTCMonth() >= 9 ? d.getUTCMonth() + 1 : "0" + (d.getUTCMonth() + 1)
    }-${d.getUTCDate().toString().padStart(2, "0")}T${d
      .getUTCHours()
      .toString()
      .padStart(2, "0")}:${d.getUTCMinutes().toString().padStart(2, "0")}:${d
      .getUTCSeconds()
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Modal visible={visible} onClose={() => setVisible(() => false)}>
      <Modal.Title>Edit Discount Coupon</Modal.Title>
      <Modal.Content>
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

            formData.validity_to = new Date(formData.validity_to).toISOString();
            Fetch({
              url: "http://localhost:4000/discount-coupon/update",
              method: "POST",
              data: {
                ...formData,
                discount_coupon_id: coupon?.discount_coupon_id,
              },
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
          }}
        >
          <Input
            name="coupon_name"
            w={"100%"}
            initialValue={coupon?.coupon_name}
          >
            Name
          </Input>

          <Input
            name="coupon_description"
            w={"100%"}
            initialValue={coupon?.coupon_description}
          >
            Description
          </Input>

          <Input
            name="discount_percentage"
            w={"100%"}
            initialValue={coupon?.discount_percentage}
          >
            Discount Percentage (%)
          </Input>

          <CustomInput
            name="validity_from"
            type="datetime-local"
            initialValue={formDate(coupon?.validity_from)}
          >
            Validity From
          </CustomInput>

          <CustomInput
            name="validity_to"
            type="datetime-local"
            initialValue={formDate(coupon?.validity_to)}
          >
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
