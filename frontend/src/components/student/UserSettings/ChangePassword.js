import { useEffect } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";
import { TextField, Button } from "@mui/material";

export default function ChangePassword() {
  let user = useUserStore((state) => state.user);

  useEffect(() => {}, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    // console.log(formData);

    Fetch({
      url: "/user/update-password",
      method: "POST",
      data: { ...formData, user_id: user?.user_id },
    })
      .then((res) => {
        if (res && res.status === 200) {
          toast("Password updated successfully", {
            type: "success",
          });
        } else {
          toast("Error updating password; retry", {
            type: "error",
          });
        }
      })
      .catch((err) => {
        toast("Error updating password: " + err?.response?.data?.error, {
          type: "error",
        });
      });
  };

  return (
    <div>
      <form
        className="flex flex-col gap-2"
        onSubmit={handleSubmit}
        style={{ width: "100%" }}
      >
        {/* <Input.Password width="100%" required name="old_password">
            Old Password
          </Input.Password> */}
        <TextField
          fullWidth
          required
          name="old_password"
          label="Old Password"
          type="password"
          variant="outlined"
        />
        <TextField
          fullWidth
          required
          name="new_password"
          label="New Password"
          type="password"
          variant="outlined"
        />
        <TextField
          fullWidth
          required
          name="confirm_new_password"
          label="Confirm New Password"
          type="password"
          variant="outlined"
        />

        <div className="flex flex-row gap-2 w-full">
          <Button
            className="flex-1"
            variant="contained"
            color="primary"
            type="submit"
          >
            Update
          </Button>
          <Button
            className="flex-1"
            variant="outlined"
            color="secondary"
            type="reset"
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
