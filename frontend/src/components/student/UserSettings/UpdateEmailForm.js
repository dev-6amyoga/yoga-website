import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import { Alert, Box, Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UserAPI } from "../../../api/user.api";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validateEmail } from "../../../utils/formValidation";

export function UpdateEmailForm() {
  const user = useUserStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const debounceRef = useRef(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", user?.user_id],
    enabled: Boolean(user?.user_id),
    queryFn: async () => {
      const [res, error] = await UserAPI.postGetUserByID(user?.user_id);
      if (error) {
        toast(error.message || "Could not load email", { type: "error" });
        return {};
      }
      return res?.user;
    },
  });

  useEffect(() => {
    if (userData?.email) {
      setEmail(userData.email);
    }
  }, [userData]);

  useEffect(() => {
    if (!isEditing) return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!email || email === userData?.email) {
        setEmailError(null);
        return;
      }

      const [isEmailValid, validationError] = validateEmail(email);
      if (!isEmailValid || validationError) {
        setEmailError(validationError.message);
        return;
      }

      const [checkEmail, error] = await UserAPI.postCheckEmail(email);
      if (error) {
        toast(error.message || "Could not validate email", { type: "warning" });
        return;
      }

      setEmailError(checkEmail?.exists ? "Email is already registered" : null);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [email, isEditing, userData?.email]);

  const handleCancel = () => {
    setEmail(userData?.email || "");
    setEmailError(null);
    setShowMessage(false);
    setIsEditing(false);
  };

  const handleUpdateEmail = async (event) => {
    event.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const nextEmail = email.trim();
    if (nextEmail === userData?.email) {
      toast.info("No changes to save");
      setIsEditing(false);
      return;
    }

    if (emailError) return;

    setIsSaving(true);
    try {
      await Fetch({
        url: "/update-request/register",
        method: "POST",
        data: {
          user_id: userData.user_id,
          username: userData.username,
          name: userData.name,
          old_email: userData.email,
          new_email: nextEmail,
          phone: userData.phone,
          request_date: new Date(),
          is_approved: false,
        },
      });

      toast.success("Email update request sent");
      setShowMessage(true);
      setIsEditing(false);
    } catch (error) {
      setShowMessage(false);
      toast.error(error?.response?.data?.error || "Could not request email update");
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
    <Box component="form" onSubmit={handleUpdateEmail}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Email address
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email changes are sent to the admin for approval and verification.
          </Typography>
        </Box>

        {showMessage && (
          <Alert severity="success">
            Your email update request has been sent. Check your inbox for the
            verification email.
          </Alert>
        )}

        <TextField
          name="email_profile"
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!isEditing || isSaving}
          fullWidth
          required
          error={Boolean(emailError)}
          helperText={emailError || " "}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {isEditing ? (
            <>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={isSaving || Boolean(emailError)}
              >
                {isSaving ? "Sending..." : "Send Request"}
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
              Change Email
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
