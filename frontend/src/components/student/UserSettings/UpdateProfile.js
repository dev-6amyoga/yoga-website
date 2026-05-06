import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Box, Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UserAPI } from "../../../api/user.api";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validateUsername } from "../../../utils/formValidation";

const blankForm = {
  name: "",
  username: "",
};

export default function UpdateProfile() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(blankForm);
  const [usernameError, setUsernameError] = useState(null);
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
        toast(error.message || "Could not load profile", { type: "error" });
        return {};
      }
      return res?.user;
    },
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        username: userData.username || "",
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!isEditing) return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const username = formData.username?.trim();
      const [isUsernameValid, validationError] = validateUsername(username);

      if (!isUsernameValid || validationError) {
        setUsernameError(validationError.message);
        return;
      }

      if (username && username !== userData?.username) {
        const [checkUsername, error] = await UserAPI.postCheckUsername(username);
        if (error) {
          toast(error.message || "Could not validate username", {
            type: "warning",
          });
          return;
        }

        if (checkUsername?.exists) {
          setUsernameError("Username is already taken");
          return;
        }
      }

      setUsernameError(null);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.username, isEditing, userData?.username]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || "",
      username: userData?.username || "",
    });
    setUsernameError(null);
    setIsEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const nextName = formData.name.trim();
    const nextUsername = formData.username.trim();

    if (!nextName || !nextUsername) {
      toast.warn("Name and username are required");
      return;
    }

    if (usernameError) return;

    if (nextName === userData?.name && nextUsername === userData?.username) {
      toast.info("No changes to save");
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const response = await Fetch({
        url: "/user/update-name-username",
        method: "POST",
        data: {
          user_id: user?.user_id,
          name: nextName,
          username: nextUsername,
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
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Could not update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <Skeleton height={54} />
        <Skeleton height={54} />
        <Skeleton height={40} width={180} />
      </Stack>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Basic details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update the name and username shown across your account.
          </Typography>
        </Box>

        <Alert severity="info">
          Email and phone changes are handled in their own tabs for verification.
        </Alert>

        <TextField
          name="name"
          label="Full name"
          value={formData.name}
          onChange={handleChange}
          disabled={!isEditing || isSaving}
          fullWidth
          required
        />

        <TextField
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          disabled={!isEditing || isSaving}
          fullWidth
          required
          error={Boolean(usernameError)}
          helperText={usernameError || "Use 4-25 letters, numbers, or underscores."}
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          {isEditing ? (
            <>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={isSaving || Boolean(usernameError)}
              >
                {isSaving ? "Saving..." : "Save Changes"}
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
            <Button
              type="submit"
              variant="outlined"
              startIcon={<EditIcon />}
            >
              Edit Profile
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
