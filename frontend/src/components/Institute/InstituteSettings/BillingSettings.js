import { Button, Input } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";

export default function ContactInfoSettings() {
  const institutes = useUserStore((state) => state.institutes);
  const currentInstituteId = useUserStore((state) => state.currentInstituteId);
  const updateInstitute = useUserStore((state) => state.updateInstitute);

  const [currentInstitute, setCurrentInstitute] = useState(null);

  useEffect(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);

    if (
      formData?.billing_address === undefined ||
      formData?.billing_address === ""
    ) {
      formData.billing_address = currentInstitute?.billing_address;
    }

    Fetch({
      url: "http://localhost:4000/institute/update-billing-address",
      method: "POST",
      data: {
        institute_id: currentInstitute.institute_id,
        ...formData,
      },
    })
      .then((res) => {
        if (res && res.status === 200) {
          Fetch({
            url: "http://localhost:4000/institute/get-by-instituteid",
            method: "POST",
            data: {
              institute_id: currentInstitute?.institute_id,
            },
          }).then((res) => {
            if (res && res.status === 200) {
              toast("Institute updated successfully", {
                type: "success",
              });
              // console.log({ res: res.data });
              updateInstitute(res.data);
            } else {
              toast("Error updating institute; retry", {
                type: "error",
              });
            }
          });
        } else {
          toast("Error updating institute; retry", { type: "error" });
        }
      })
      .catch((err) => {
        console.log(err);
        toast("Error updating institute", { type: "error" });
      });
  };

  return (
    <div>
      <h2>Billing Settings</h2>

      <section className="my-5">
        <h4>Billing Address</h4>
        <hr />
        <form className="flex flex-col gap-2 my-8" onSubmit={handleSubmit}>
          <Input
            width="100%"
            defaultValue={currentInstitute?.billing_address}
            placeholder={currentInstitute?.billing_address}
            name="billing_address"
          >
            Billing Address
          </Input>
          <div className="flex flex-row gap-2 w-full">
            <Button className="flex-1" type="secondary" htmlType="submit">
              Update
            </Button>
            <Button className="flex-1" htmlType="reset">
              Reset
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
