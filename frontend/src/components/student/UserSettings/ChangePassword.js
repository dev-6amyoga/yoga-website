import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validatePassword } from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";

export default function ChangePassword() {
  let user = useUserStore((state) => state.user);

  useEffect(() => {}, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = getFormData(e);

    if (
      !formData.old_password ||
      !formData.new_password ||
      !formData.confirm_new_password
    ) {
      toast.warn("Please fill all fields");
      return;
    }

    const new_password = formData.new_password;
    const conf_new_password = formData.confirm_new_password;

    if (new_password !== conf_new_password) {
      toast("The new passwords do not match!");
      return;
    }

    const [is_password_valid, pass_error] = validatePassword(new_password);
    if (is_password_valid) {
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
    } else {
      toast("Password is invalid");
      return;
    }
  };

  const [password, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const inputErrorDebounce = useRef(null);

  useEffect(() => {
    console.log(passwordError);
  }, [passwordError]);
  // Check password

  // Check password
  useEffect(() => {
    if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);

    inputErrorDebounce.current = setTimeout(() => {
      if (password && confirmPassword && password !== confirmPassword) {
        setPasswordError(null);
        setConfirmPasswordError("Passwords do not match");
        return;
      } else {
        const [is_password_valid, pass_error] = validatePassword(password);
        if (!is_password_valid || pass_error) {
          setPasswordError(pass_error.message);
          return;
        }

        const [is_confirm_password_valid, confirm_pass_error] =
          validatePassword(confirmPassword);
        if (!is_confirm_password_valid || confirm_pass_error) {
          setConfirmPasswordError(confirm_pass_error.message);
          return;
        }
      }

      setPasswordError(null);
      setConfirmPasswordError(null);
    }, 500);

    return () => {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
    };
  }, [password, confirmPassword]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowNewPassword = () => setShowNewPassword(!showNewPassword);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleDisable = (e) => {
    e.preventDefault();
  };

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={handleSubmit}
      style={{ width: "100%" }}
    >
      {/* <TextField
        fullWidth
        required
        name="old_password"
        label="Old Password"
        type="password"
        variant="outlined"
      /> */}

      <TextField
        label="Old Password"
        variant="outlined"
        name="old_password"
        type={showPassword ? "text" : "password"}
        onCut={handleDisable}
        onCopy={handleDisable}
        onPaste={handleDisable}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <br />
      <p
        className={`text-sm border p-2 rounded-lg text-zinc-500 ${passwordError || confirmPasswordError ? "border-red-500" : ""}`}
      >
        Password must be minimum 8 letters and contain at least 1 number, 1
        alphabet, 1 special character [!@#$%^&*,?]
      </p>
      {/* <TextField
        fullWidth
        required
        name="new_password"
        label="New Password"
        type="password"
        variant="outlined"
      /> */}
      <TextField
        label="New Password"
        variant="outlined"
        name="new_password"
        type={showNewPassword ? "text" : "password"}
        onCut={handleDisable}
        onCopy={handleDisable}
        onPaste={handleDisable}
        required
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        error={passwordError ? true : false}
        helperText={passwordError ? passwordError : " "}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowNewPassword}
              >
                {showNewPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        // error={passwordError ? true : false}
        // helperText={passwordError ? passwordError : " "}
      />
      <TextField
        label="Confirm New Password"
        variant="outlined"
        name="confirm_new_password"
        type={showConfirmPassword ? "text" : "password"}
        onCut={handleDisable}
        onCopy={handleDisable}
        onPaste={handleDisable}
        required
        error={confirmPasswordError ? true : false}
        helperText={confirmPasswordError ? confirmPasswordError : " "}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowConfirmPassword}
              >
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        // error={passwordError ? true : false}
        // helperText={passwordError ? passwordError : " "}
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
  );
}
