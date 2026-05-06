import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockResetIcon from "@mui/icons-material/LockReset";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validatePassword } from "../../../utils/formValidation";

const initialForm = {
  old_password: "",
  new_password: "",
  confirm_new_password: "",
};

export default function ChangePassword() {
  const user = useUserStore((state) => state.user);
  const [formData, setFormData] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    old_password: false,
    new_password: false,
    confirm_new_password: false,
  });
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const nextErrors = {};

      if (formData.new_password) {
        const [isPasswordValid, passwordError] = validatePassword(
          formData.new_password,
        );
        if (!isPasswordValid || passwordError) {
          nextErrors.new_password = passwordError.message;
        }
      }

      if (
        formData.confirm_new_password &&
        formData.new_password !== formData.confirm_new_password
      ) {
        nextErrors.confirm_new_password = "Passwords do not match";
      }

      setErrors(nextErrors);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.new_password, formData.confirm_new_password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDisable = (event) => {
    event.preventDefault();
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.old_password ||
      !formData.new_password ||
      !formData.confirm_new_password
    ) {
      toast.warn("Please fill all fields");
      return;
    }

    if (formData.new_password !== formData.confirm_new_password) {
      setErrors((prev) => ({
        ...prev,
        confirm_new_password: "Passwords do not match",
      }));
      return;
    }

    const [isPasswordValid, passwordError] = validatePassword(
      formData.new_password,
    );
    if (!isPasswordValid || passwordError) {
      setErrors((prev) => ({
        ...prev,
        new_password: passwordError.message,
      }));
      return;
    }

    setIsSaving(true);
    try {
      await Fetch({
        url: "/user/update-password",
        method: "POST",
        data: { ...formData, user_id: user?.user_id },
      });

      toast.success("Password updated successfully");
      resetForm();
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not update password");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPasswordField = (name, label) => (
    <TextField
      label={label}
      name={name}
      type={showPassword[name] ? "text" : "password"}
      value={formData[name]}
      onChange={handleChange}
      onCut={handleDisable}
      onCopy={handleDisable}
      onPaste={handleDisable}
      required
      fullWidth
      error={Boolean(errors[name])}
      helperText={errors[name] || " "}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label={`toggle ${label.toLowerCase()} visibility`}
              onClick={() => toggleShowPassword(name)}
              edge="end"
            >
              {showPassword[name] ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  return (
    <Box component="form" onSubmit={handleSubmit} onReset={resetForm}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Change password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use a strong password that is unique to your 6AM Yoga account.
          </Typography>
        </Box>

        <Alert severity={Object.keys(errors).length ? "error" : "info"}>
          Password must be at least 8 characters and include a lowercase letter,
          a number, and one special character from !@#$%^&*,?
        </Alert>

        {renderPasswordField("old_password", "Current password")}
        {renderPasswordField("new_password", "New password")}
        {renderPasswordField("confirm_new_password", "Confirm new password")}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<LockResetIcon />}
            disabled={isSaving || Boolean(Object.keys(errors).length)}
          >
            {isSaving ? "Updating..." : "Update Password"}
          </Button>
          <Button type="reset" variant="outlined" disabled={isSaving}>
            Reset
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
