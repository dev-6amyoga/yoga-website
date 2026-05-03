import {
  Alert,
  Button,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { UserAPI } from "../../../api/user.api";
import {
  validateEmail,
  validatePassword,
  validatePhone,
} from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";
import { Fetch } from "../../../utils/Fetch";

export default function GeneralInformationForm({
  generalInfo,
  setGeneralInfo,
  googleInfo,
  setBlockStep,
  setLoading,
  handleNextStep,
}) {
  const [username, setUsername] = useState(generalInfo?.username);
  const [usernameError, setUsernameError] = useState(null);

  const [password, setPassword] = useState(generalInfo?.password);
  const [confirmPassword, setConfirmPassword] = useState(
    generalInfo?.confirm_password
  );
  const [passwordError, setPasswordError] = useState(null);

  const [email, setEmail] = useState(generalInfo?.email_id);
  const [emailError, setEmailError] = useState(null);

  const [phone, setPhone] = useState(generalInfo?.phone_no || "");
  const [phoneError, setPhoneError] = useState(null);

  const [infoSaved, setInfoSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleGeneralInfoChange = useCallback(
    async (e) => {
      e.preventDefault();
      const formData = getFormData(e);

      // VALIDATE NAME
      if (formData.name.length < 4) {
        toast("Name must be at least 4 characters", {
          type: "warning",
        });
        return;
      }

      // VALIDATE EMAIL
      let [is_email_valid, email_error] = validateEmail(formData?.email_id);

      if (!is_email_valid) {
        toast(email_error.message, { type: "warning" });
        return;
      }

      let check_email;

      [check_email, email_error] = await UserAPI.postCheckEmail(
        formData?.email_id
      );

      if (check_email?.exists) {
        toast("Email already exists", { type: "warning" });
        return;
      }

      if (email_error) {
        toast(email_error.message, { type: "warning" });
        return;
      }

      // VALIDATE PASSWORD
      if (formData?.password !== formData?.confirm_password) {
        toast("Passwords do not match");
        return;
      }

      const [is_password_valid, pass_error] = validatePassword(
        formData?.password
      );

      if (!is_password_valid || pass_error) {
        toast(pass_error.message, { type: "warning" });
        setPasswordError(pass_error);
        return;
      }

      // VALIDATE PHONE NUMBER

      const [is_phone_valid, phone_error] = await validatePhone(
        formData.phone_no
      );

      if (!is_phone_valid || phone_error) {
        toast(phone_error.message, { type: "warning" });
        return;
      }

      // VALIDATE USERNAME
      let [username, username_error] = await UserAPI.postCheckUsername(
        formData.username
      );

      if (username.exists) {
        toast("Username already exists", { type: "warning" });
        return;
      }

      if (username_error) {
        toast(username_error.message, { type: "warning" });
        return;
      }

      setPasswordError(null);
      setEmailError(null);
      setUsernameError(null);
      setPhoneError(null);

      setGeneralInfo(formData);

      setInfoSaved(true);

      toast("Saved!", { type: "success" });
      handleNextStep();
    },
    [generalInfo, googleInfo, handleNextStep, setGeneralInfo]
  );

  const inputErrorDebounce = useRef(null);

  useEffect(() => {
    setBlockStep(!infoSaved);
  }, [infoSaved, setBlockStep]);

  useEffect(() => {
    setInfoSaved(false);
  }, []);

  useEffect(() => {
    if (usernameError || passwordError || emailError || phoneError) {
      setBlockStep(true);
    }
  }, [usernameError, passwordError, emailError, phoneError, setBlockStep]);

  // Check username
  useEffect(() => {
    if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);

    inputErrorDebounce.current = setTimeout(async () => {
      if (username) {
        const [check_username, error] =
          await UserAPI.postCheckUsername(username);

        if (error) {
          toast(error.message, { type: "warning" });
          return;
        }

        if (check_username?.exists) {
          setUsernameError("Username exists");
          return;
        }

        setUsernameError(null);
      }
    }, 500);

    return () => {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
    };
  }, [username]);

  // Check password
  useEffect(() => {
    if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);

    inputErrorDebounce.current = setTimeout(() => {
      if (!password && !confirmPassword) {
        setPasswordError(null);
        return;
      }

      if (password && confirmPassword && password !== confirmPassword) {
        setPasswordError(new Error("Passwords do not match"));
        return;
      } else {
        const [is_password_valid, pass_error] = validatePassword(password);
        if (!is_password_valid || pass_error) {
          setPasswordError(pass_error);
          return;
        }
      }

      setPasswordError(null);
    }, 500);
    return () => {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
    };
  }, [password, confirmPassword]);

  // Check email
  useEffect(() => {
    if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);

    inputErrorDebounce.current = setTimeout(async () => {
      if (email) {
        const [check_email, error] = await UserAPI.postCheckEmail(email);

        if (error) {
          toast(error.message, { type: "warning" });
          return;
        }

        if (check_email?.exists) {
          setEmailError("Email exists");
          return;
        }

        setEmailError(null);
      }
    }, 500);

    return () => {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
    };
  }, [email]);

  // Check phone number
  useEffect(() => {
    if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);

    inputErrorDebounce.current = setTimeout(async () => {
      if (phone) {
        const [is_phone_valid, phone_error] = await validatePhone(phone);

        if (!is_phone_valid || phone_error) {
          setPhoneError(phone_error.message);
          return;
        }

        const [check_phone, error] = await UserAPI.postCheckPhoneNumber(phone);

        if (error) {
          toast(error.message, { type: "warning" });
          return;
        }

        if (check_phone?.exists) {
          setPhoneError("Phone number exists");
          return;
        }

        setPhoneError(null);
      }
    }, 500);

    return () => {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
    };
  }, [phone]);

  const fetchCountryCodes = async () => {
    const res = await Fetch({
      url: "/auth/countries",
      //   token: true,
      method: "GET",
    });
    return res.data;
  };

  const [countryCodes, setCountryCodes] = useState([]);
  const [country, setCountry] = useState("");

  useEffect(() => {
    const getCountryCodes = async () => {
      const codes = await fetchCountryCodes();
      const sorted = [...codes].sort();
      setCountryCodes(sorted);
    };
    getCountryCodes();
  }, []);

  const handleCountryChange = (event) => {
    setCountry(event.target.value);
  };

  const handlePhoneChange = (event) => {
    setPhone(event.target.value);
  };

  const handleDisable = (e) => {
    e.preventDefault();
  };

  return (
    <form
      style={{ width: "100%" }}
      onSubmit={handleGeneralInfoChange}
    >
      <Stack spacing={2}>
      <div style={{ textAlign: "center" }}>
        <Typography sx={{ color: "#101828", fontWeight: 900, fontSize: 20 }}>
          Your details
        </Typography>
        <Typography sx={{ color: "#667085", mt: 0.5 }}>
          These details help us create and secure your account.
        </Typography>
      </div>
      <TextField
        name="name"
        placeholder="John Doe"
        defaultValue={generalInfo?.name}
        required
        label="Name"
        fullWidth
      />
      <TextField
        name="email_id"
        placeholder="abc@email.com"
        defaultValue={generalInfo?.email_id}
        onChange={(e) => {
          setEmail(e.target.value);
        }}
        required
        label="Email ID"
        type="email"
        fullWidth
        error={emailError ? true : false}
        helperText={emailError ? emailError : " "}
      />

      <FormControl fullWidth>
        <InputLabel id="country-label">Country</InputLabel>
        <Select
          labelId="country-label"
          value={country}
          onChange={handleCountryChange}
          required
          label="Country"
        >
          {countryCodes.map((countryName) => (
            <MenuItem key={countryName} value={countryName}>
              {countryName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        name="phone_no"
        placeholder="XXXXXXXXXX"
        value={phone}
        onChange={handlePhoneChange}
        required
        label="Phone No"
        fullWidth
        error={phoneError ? true : false}
        helperText={phoneError ? phoneError : " "}
      />

      <TextField
        name="username"
        placeholder="johnDoe123"
        defaultValue={generalInfo?.username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        required
        label="Username"
        fullWidth
        error={usernameError ? true : false}
        helperText={usernameError ? usernameError : " "}
      />
      <Alert severity={passwordError ? "warning" : "info"}>
        Password must be minimum 8 letters and contain at least 1 number, 1
        alphabet, and 1 special character.
      </Alert>
      <TextField
        type={showPassword ? "text" : "password"}
        name="password"
        defaultValue={generalInfo?.password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
        onCut={handleDisable}
        onCopy={handleDisable}
        onPaste={handleDisable}
        title="Password must be minimum 8 letters and contain at least 1 number, 1 alphabet, 1 special character."
        required
        label="Password"
        fullWidth
        error={passwordError ? true : false}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        type={showPassword ? "text" : "password"}
        name="confirm_password"
        defaultValue={generalInfo?.confirm_password}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
        }}
        title="Password must be minimum 8 letters and contain at least 1 number, 1 alphabet, 1 special character."
        required
        label="Confirm Password"
        fullWidth
        onCut={handleDisable}
        onCopy={handleDisable}
        onPaste={handleDisable}
        error={password && confirmPassword && password !== confirmPassword}
        helperText={
          password && confirmPassword && password !== confirmPassword
            ? "Passwords do not match"
            : " "
        }
      />
      <Button
        variant="contained"
        type="submit"
        size="large"
        sx={{
          bgcolor: "#1f6f5b",
          fontWeight: 900,
          textTransform: "none",
          "&:hover": { bgcolor: "#185846" },
        }}
      >
        Save and continue
      </Button>
      </Stack>
    </form>
  );
}
