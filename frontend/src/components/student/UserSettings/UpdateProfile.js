import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { UserAPI } from "../../../api/user.api";
import useUserStore from "../../../store/UserStore";
import getFormData from "../../../utils/getFormData";
import { toast } from "react-toastify";
import { validateEmail, validatePhone } from "../../../utils/formValidation";
import { Fetch } from "../../../utils/Fetch";

export default function UpdateProfile() {
  const user = useUserStore((state) => state.user);

  // const navigate = useNavigate();
  // const [userData, setUserData] = useState({});
  const [update, setUpdate] = useState(false);
  const [isEmailUpdate, setIsEmailUpdate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [formData, setFormData] = useState({
    name_profile: "",
    username_profile: "",
    email_profile: "",
    phone_profile: "",
  });

  const [currentUsername, setCurrentUsername] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [usernameError, setUsernameError] = useState(null);

  const {
    data: userData,
    isLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", user?.user_id],
    queryFn: async () => {
      const [res, error] = await UserAPI.postGetUserByID(user?.user_id);
      if (error) {
        toast(error.message, { type: "error" });
        return {};
      }

      return res?.user;
    },
  });

  useEffect(() => {
    if (userData) {
      setCurrentUsername(userData.username);
      setFormData({
        name_profile: userData.name,
        username_profile: userData.username,
      });
    }
  }, [userData]);

  const closeUpdateHandler = (event) => {
    setUpdate(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isEditing) {
        setIsEditing(true);
      } else {
        const formData = getFormData(e);
        if (formData.name_profile === "" && formData.email_profile === "") {
          toast("No changes to save!");
        } else if (
          formData.name_profile === userData.name &&
          formData.username_profile === userData.username
        ) {
          toast("No changes to save!");
        } else {
          setUpdate(true);
          setUpdateData(formData);
          setIsEditing(false);
          toast("Updating Data!");
        }
      }
    },
    [isEditing, userData, formData, setUpdateData, setUpdate, setFormData]
  );

  useEffect(() => {
    if (update) {
      updateProfile();
    }
  }, [update]);

  const updateProfile = useCallback(async () => {
    setUpdate(false);
    const updateData1 = {
      user_id: user?.user_id,
      name:
        updateData.name_profile !== ""
          ? updateData.name_profile
          : userData.name,
      username:
        updateData.username_profile !== ""
          ? updateData.username_profile
          : userData.username,
    };
    setIsEditing(false);
    Fetch({
      url: "/user/update-name-username",
      method: "POST",
      data: {
        user_id: updateData1.user_id,
        username: updateData1.username,
        name: updateData1.name,
      },
    })
      .then((res) => {
        console.log(res);
        toast("Updated!", { type: "success" });
        refetchUser();
      })
      .catch((err) => {
        toast(`Error : ${err.response.data.error}`, {
          type: "error",
        });
      });
  }, [updateData, userData]);

  const inputErrorDebounce = useRef(null);

  // check username
  useEffect(() => {
    if (isEditing) {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
      inputErrorDebounce.current = setTimeout(async () => {
        if (formData.username_profile) {
          if (formData.username_profile !== currentUsername) {
            const [check_username, error] = await UserAPI.postCheckUsername(
              formData.username_profile
            );

            if (error) {
              toast(error.message, { type: "warning" });
              return;
            }

            if (check_username?.exists) {
              setUsernameError("Username exists");

              return;
            }
          }
          setUsernameError(null);
        }
      }, 500);

      return () => {
        if (inputErrorDebounce.current)
          clearTimeout(inputErrorDebounce.current);
      };
    }
  }, [formData.username_profile]);

  return (
    <form
      onSubmit={handleSubmit}
      onReset={() => {
        setIsEditing(false);
      }}
      style={{ width: "100%" }}
    >
      <Typography>Name</Typography>
      <TextField
        name="name_profile"
        fullWidth
        value={formData.name_profile}
        label={isEditing ? "" : ""}
        placeholder={userData?.name}
        onChange={handleChange}
        disabled={!isEditing}
        sx={{ mb: 2 }}
      />
      <Typography>Username</Typography>

      <TextField
        fullWidth
        value={formData.username_profile}
        name="username_profile"
        label={isEditing ? "" : ""}
        placeholder={userData?.username}
        onChange={handleChange}
        disabled={!isEditing}
        sx={{ mb: 2 }}
        helperText={usernameError ? usernameError : " "}
        error={usernameError ? true : false}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}
      >
        {isEditing ? (
          <>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              sx={{ mr: 2 }} // Add right margin to the "Save" button
              disabled={
                usernameError !== null ||
                emailError !== null ||
                phoneError !== null
              }
            >
              Save Changes
            </Button>
            <Button variant="outlined" type="reset" startIcon={<CancelIcon />}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(true);
            }}
            type="button"
            variant="outlined"
            startIcon={<EditIcon />}
          >
            Edit Profile
          </Button>
        )}
      </Box>
    </form>
  );
}
