import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UserAPI } from "../../../api/user.api";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validateEmail } from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";

export function UpdateEmailForm() {
  const user = useUserStore((state) => state.user);
  const [update, setUpdate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [currentEmail, setCurrentEmail] = useState(null);
  const [formData, setFormData] = useState({
    name_profile: "",
    username_profile: "",
    email_profile: "",
    phone_profile: "",
  });

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

  const [emailError, setEmailError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const inputErrorDebounce = useRef(null);

  // check email
  useEffect(() => {
    if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);

    inputErrorDebounce.current = setTimeout(async () => {
      console.log("Checking email");

      if (formData?.email_profile && formData?.email_profile !== currentEmail) {
        const [is_email_valid, email_error] = validateEmail(
          formData?.email_profile
        );

        if (!is_email_valid || email_error) {
          setEmailError(email_error.message);
          return;
        }

        const [check_email, error] = await UserAPI.postCheckEmail(
          formData?.email_profile
        );

        if (error) {
          toast(error.message, { type: "warning" });
          return;
        }

        if (check_email?.exists) {
          setEmailError("Email exists");

          return;
        }
      }
      setEmailError(null);
    }, 500);

    return () => {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
    };
  }, [formData?.email_profile]);

  const [showMessage, setShowMessage] = useState(false);
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    const formData = getFormData(e);
    console.log(formData.email_profile);
    if (formData.email_profile === currentEmail) {
      toast("No changes to save!");
      setShowMessage(false);
      setIsEditing(false);
      return;
    }
    setIsEditing(false);
    console.log(userData);
    Fetch({
      url: "/update-request/register",
      method: "POST",
      data: {
        user_id: userData.user_id,
        username: userData.username,
        name: userData.name,
        old_email: userData.email,
        new_email: formData.email_profile,
        phone: userData.phone,
        request_date: new Date(),
        is_approved: false,
      },
    })
      .then((res) => {
        console.log(res);
        toast("Update sent successfully", { type: "success" });
        setShowMessage(true);
        setIsEmailUpdate(false);
      })
      .catch((err) => {
        setShowMessage(false);
        toast(`Error : ${err.response.data.error}`, {
          type: "error",
        });
        setIsEmailUpdate(false);
      });
  };

  const closeUpdateHandler = (event) => {
    setUpdate(false);
  };

  const handleReset = () => {
    setIsEditing(false);
    setEmailError(null);
  };

  useEffect(() => {
    if (userData) {
      setFormData({
        email_profile: userData.email,
      });
      setCurrentEmail(userData.email);
    }
  }, [userData]);

  return (
    <div>
      <form
        className="flex flex-col items-center w-full gap-4"
        onSubmit={handleUpdateEmail}
        onReset={handleReset}
      >
        <Typography>Email ID</Typography>

        {showMessage && (
          <p
            className={
              "text-sm border p-2 rounded-lg text-zinc-500 border-red-500"
            }
          >
            The admin has been notified of your request. Do check your inbox for
            a mail from us which indicates the success of the updation!
          </p>
        )}
        <TextField
          fullWidth
          value={formData.email_profile}
          name="email_profile"
          label={isEditing ? "Email" : ""}
          placeholder={userData?.email}
          onChange={handleChange}
          disabled={!isEditing}
          sx={{ mb: 2 }}
          helperText={emailError ? emailError : " "}
          error={emailError ? true : false}
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
                sx={{ mr: 2 }}
                disabled={emailError !== null}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                type="reset"
                startIcon={<CancelIcon />}
              >
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
              Edit
            </Button>
          )}
        </Box>
      </form>

      <Dialog open={update} onClose={closeUpdateHandler}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Do you really wish to update your profile?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdate(false)}>No</Button>
          <Button onClick={() => {}} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
