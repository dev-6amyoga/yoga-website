import { Button, CircularProgress, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
import { validatePassword } from "../../utils/formValidation";
import getFormData from "../../utils/getFormData";

export default function ForgotPassword() {
  const [token, setToken] = useState(null);

  const [error, setError] = useState(null);

  const [passwordError, setPasswordError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setToken(() => {
      if (location.search.includes("?token=")) {
        console.log(
          "IN EMAIL VERIFICATION WITH : ",
          location.search.split("?token=")[1]
        );
        return location.search.split("?token=")[1];
      } else {
        return null;
      }
    });
  }, [location]);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", token],

    queryFn: async () => {
      setError(null);
      try {
        const res = await Fetch({
          url: "/user/forgot-password-token",
          method: "POST",
          data: {
            token: token,
          },
        });

        if (res && res.status === 200) {
          return res?.data?.user;
        } else {
          toast.error(res?.data?.error);
          console.log("ERROR: ", res?.data?.error);
          setError(res?.data?.error);
          return res?.data?.error;
        }
      } catch (error) {
        console.log("ERROR: ", error);
        setError(error?.response?.data?.error);
      }
    },

    enabled: token !== null && token !== undefined,
    retry: 3,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    const new_password = formData.new_password;
    const conf_new_password = formData.confirm_new_password;

    if (new_password !== conf_new_password) {
      toast("The new passwords do not match!");
      return;
    }

    const [is_password_valid, pass_error] = validatePassword(new_password);

    if (is_password_valid && !pass_error) {
      toast("Updating Password!");
      Fetch({
        url: "/user/forgot-password-update",
        method: "POST",
        data: { ...formData, user_id: user?.user_id },
      })
        .then((res) => {
          if (res && res.status === 200) {
            toast("Password updated successfully", {
              type: "success",
            });
            navigate("/auth");
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
    } else {
      toast("Password is invalid");
      return;
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-center">Forgot Password</h1>

      {isError ? (
        <p className="text-center">{error}</p>
      ) : isLoading ? (
        <div className="flex justify-center w-full">
          <CircularProgress variant="indeterminate" />
        </div>
      ) : (
        <form
          className="flex flex-col gap-2 mt-4"
          onSubmit={handleSubmit}
          style={{ width: "100%" }}
        >
          <p
            className={
              "text-sm border p-2 rounded-lg text-zinc-500 border-red-500"
            }
          >
            Password must be minimum 8 letters and contain atleast 1 number, 1
            alphabet, 1 special character [!@#$%^&*,?]
          </p>
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
      )}
    </div>
  );
}
