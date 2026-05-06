import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Alert, Box, Button, Chip, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect, useRef, useState } from "react";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "react-toastify";
import OTPAPI from "../../../api/otp.api";
import { UserAPI } from "../../../api/user.api";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validatePhone } from "../../../utils/formValidation";

const CustomTextField = forwardRef((props, ref) => (
  <TextField inputRef={ref} fullWidth {...props} />
));

export default function UpdatePhoneForm() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(null);
  const [verified, setVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const debounceRef = useRef(null);

  const {
    data: userData,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", user?.user_id],
    enabled: Boolean(user?.user_id),
    queryFn: async () => {
      const [res, error] = await UserAPI.postGetUserByID(user?.user_id);
      if (error) {
        toast(error.message || "Could not load phone", { type: "error" });
        return {};
      }
      return res?.user;
    },
  });

  useEffect(() => {
    if (userData?.phone) {
      setPhone(userData.phone);
    }
  }, [userData]);

  useEffect(() => {
    if (!timer) return undefined;

    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!isEditing) return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!phone || phone === userData?.phone) {
        setPhoneError(null);
        return;
      }

      const [isPhoneValid, validationError] = await validatePhone(phone);
      if (!isPhoneValid || validationError) {
        setPhoneError(validationError.message);
        return;
      }

      const [checkPhone, error] = await UserAPI.postCheckPhoneNumber(phone);
      if (error) {
        toast(error.message || "Could not validate phone", { type: "warning" });
        return;
      }

      setPhoneError(checkPhone?.exists ? "Phone number is already registered" : null);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [phone, isEditing, userData?.phone]);

  const resetVerification = () => {
    setOtp("");
    setOtpError(null);
    setVerified(false);
    setOtpSent(false);
    setTimer(0);
  };

  const handleCancel = () => {
    setPhone(userData?.phone || "");
    setPhoneError(null);
    resetVerification();
    setIsEditing(false);
  };

  const handleOTPSend = async () => {
    if (!phone || phoneError) return;

    if (phone === userData?.phone) {
      toast.info("Enter a new phone number first");
      return;
    }

    if (!userData?.email) {
      toast.error("Email is required to receive OTP");
      return;
    }

    const [res, error] = await OTPAPI.postCreateOTP(
      "OTP_FOR_PHONE",
      phone,
      "OTP_TARGET_EMAIL",
      userData.email,
    );

    if (error) {
      toast.error(error.message || "Could not send OTP");
      return;
    }

    setOtpSent(true);
    setVerified(false);
    setTimer(30);
    toast.success("OTP sent to your email");
  };

  const handleOTPVerify = async () => {
    if (!otp) {
      setOtpError("OTP is required");
      return;
    }

    const [res, error] = await OTPAPI.postVerifyOTP(
      "OTP_FOR_PHONE",
      phone,
      "OTP_TARGET_EMAIL",
      userData.email,
      otp,
    );

    if (error) {
      setVerified(false);
      setOtpError("Incorrect OTP");
      return;
    }

    if (res?.message === "OTP verified successfully") {
      setVerified(true);
      setOtpError(null);
      toast.success("Phone verified");
    }
  };

  const handleUpdatePhone = async (event) => {
    event.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      setPhone(userData?.phone || "");
      return;
    }

    if (phone === userData?.phone) {
      toast.info("No changes to save");
      setIsEditing(false);
      return;
    }

    if (!verified) {
      toast.error("Please verify the new phone number");
      return;
    }

    setIsSaving(true);
    try {
      const response = await Fetch({
        url: "/user/update-profile",
        method: "POST",
        data: {
          user_id: userData.user_id,
          phone,
        },
      });

      const updatedUser = response.data?.user;
      if (updatedUser) {
        setUser({
          ...user,
          user_id: updatedUser.user_id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          phone: updatedUser.phone,
        });
      }
      await refetchUser();
      resetVerification();
      setIsEditing(false);
      toast.success("Phone updated");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not update phone");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={54} />
        <Skeleton height={40} width={180} />
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleUpdatePhone}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Phone number
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Verify your new phone number with an OTP sent to your email.
          </Typography>
        </Box>

        <PhoneInputWithCountrySelect
          value={phone}
          onChange={(value) => {
            setPhone(value || "");
            resetVerification();
          }}
          disabled={!isEditing || isSaving || verified}
          defaultCountry="IN"
          limitMaxLength
          numberInputProps={{
            name: "phone",
            label: "Phone number",
            helperText: phoneError || " ",
            error: Boolean(phoneError),
          }}
          inputComponent={CustomTextField}
        />

        {isEditing && phone && phone !== userData?.phone && !phoneError && (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                type="button"
                variant="contained"
                onClick={handleOTPSend}
                disabled={timer > 0 || verified}
              >
                {otpSent ? (timer ? `Resend in ${timer}s` : "Resend OTP") : "Send OTP"}
              </Button>
              {verified && (
                <Chip
                  color="success"
                  icon={<VerifiedIcon />}
                  label="Verified"
                  sx={{ width: "fit-content" }}
                />
              )}
            </Stack>

            {otpSent && !verified && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  error={Boolean(otpError)}
                  helperText={otpError || " "}
                  fullWidth
                />
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleOTPVerify}
                  sx={{ minWidth: 120, height: 56 }}
                >
                  Verify
                </Button>
              </Stack>
            )}
          </Stack>
        )}

        {isEditing && phone === userData?.phone && (
          <Alert severity="info">Enter a new phone number to verify and save.</Alert>
        )}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {isEditing ? (
            <>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSaving || !verified}
              >
                {isSaving ? "Saving..." : "Save Phone"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button type="submit" variant="outlined" startIcon={<EditIcon />}>
              Change Phone
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
