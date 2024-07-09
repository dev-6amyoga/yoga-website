import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { validateEmail, validatePhone } from "../../../utils/formValidation";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
const items = [
  {
    icon: <EmailIcon />,
    title: "Get in Touch",
    description: "992351@gmail.com",
  },
  {
    icon: <PhoneIcon />,
    title: "Talk to Us",
    description: "+91-9980802351",
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: "Address",
    description:
      "4th floor, Shalom Arcade, Kasavanahalli, Sarjapur Road, Bangalore, 560035",
  },
];

export default function Highlights() {
  const [phone, setPhone] = useState("");
  const fetchCountryCodes = async () => {
    const response = await fetch("https://restcountries.com/v3.1/all");
    const data = await response.json();
    return data.reduce((acc, country) => {
      const countryCode =
        country.idd?.root +
        (country.idd?.suffixes ? country.idd.suffixes[0] : "");
      if (countryCode) {
        acc[country.name.common] = countryCode;
      }
      return acc;
    }, {});
  };
  const [countryCodes, setCountryCodes] = useState({});
  const [country, setCountry] = useState("");
  useEffect(() => {
    const getCountryCodes = async () => {
      const codes = await fetchCountryCodes();
      setCountryCodes(codes);
    };
    getCountryCodes();
  }, []);
  const handleCountryChange = (event) => {
    const selectedCountry = event.target.value;
    setCountry(selectedCountry);
    const countryCode = countryCodes[selectedCountry];
    if (countryCode) {
      setPhone(countryCode);
    }
  };
  const handlePhoneChange = (event) => {
    const newPhone = event.target.value;
    const countryCode = countryCodes[country] || "";
    if (
      newPhone === countryCode &&
      event.nativeEvent.inputType === "deleteContentBackward"
    ) {
      setPhone(countryCode);
      return;
    }
    if (newPhone.length < countryCode.length) {
      setPhone(countryCode);
    } else {
      setPhone(newPhone);
    }
  };

  const [formData, setFormData] = useState({
    query_name: "",
    query_email: "",
    query_phone: "",
    query_text: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const inputErrorDebounce = useRef(null);
  const [phoneError, setPhoneError] = useState(null);

  useEffect(() => {
    if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);

    inputErrorDebounce.current = setTimeout(async () => {
      console.log("Checking phone number");

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
      }
      setPhoneError(null);
    }, 500);

    return () => {
      if (inputErrorDebounce.current) clearTimeout(inputErrorDebounce.current);
    };
  }, [phone]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const [validPhone, phoneError] = await validatePhone(phone);
    if (!validPhone) {
      toast(phoneError.message, { type: "error" });
      return;
    }
    // if (!formData.query_phone.startsWith("+91")) {
    //   formData.query_phone = "+91" + formData.query_phone;
    // }
    const [validEmail, emailError] = validateEmail(formData.query_email);
    if (!validEmail) {
      toast(emailError.message, { type: "error" });
      return;
    }
    toast("Sending Query!");
    formData.query_phone = phone;
    try {
      const response = await Fetch({
        url: "/query/register",
        method: "POST",
        data: formData,
      });
      if (response?.status === 200) {
        toast("Query submitted!");
        setFormData({
          query_name: "",
          query_email: "",
          query_phone: "",
          query_text: "",
        });
      } else {
        toast(
          "Could not submit query. An error occured! Kindly contact us directly."
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: "white",
        background: "linear-gradient(#033363, #021F3B)",
      }}
    >
      <Container
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: "100%", md: "60%" },
            textAlign: { sm: "left", md: "center" },
          }}
        >
          <Typography component="h2" variant="h4">
            Reach out to us!
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.400" }}>
            Our team of experts will give you a tailored product tour, showing
            you how our platform can streamline your workflow, address your pain
            points, and ultimately help you achieve your goals.
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                color="inherit"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  p: 3,
                  height: "100%",
                  border: "1px solid",
                  borderColor: "#AAC0DB",
                  background: "transparent",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Box
                  sx={{
                    opacity: "50%",
                    filter: "grayscale(1) brightness(0)",
                    color: "black",
                  }}
                >
                  {" "}
                  {item.icon}
                </Box>
                <div>
                  <Typography
                    fontWeight="medium"
                    gutterBottom
                    sx={{ color: "black" }}
                  >
                    {" "}
                    {/* Set text color */}
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "black" }}>
                    {" "}
                    {/* Set text color */}
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
        <Typography component="h2" variant="h4">
          Submit your query here!
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            "& .MuiTextField-root": {
              mb: 2,
            },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#F0F5FF",
            },
            p: 3,
            border: "1px solid",
            borderColor: "#AAC0DB",
            backgroundColor: "#FFFFFF",
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: 0,
            transition: "box-shadow 0.3s",
            "&:hover": {
              boxShadow: 3,
            },
          }}
        >
          <TextField
            name="query_name"
            label="Name"
            variant="outlined"
            fullWidth
            value={formData.query_name}
            onChange={handleChange}
          />

          <TextField
            name="query_email"
            label="Email"
            variant="outlined"
            fullWidth
            value={formData.query_email}
            onChange={handleChange}
          />

          <FormControl fullWidth>
            <InputLabel id="country-label">Country</InputLabel>
            <Select
              labelId="country-label"
              value={country}
              onChange={handleCountryChange}
              required
            >
              {Object.keys(countryCodes).map((countryName) => (
                <MenuItem key={countryName} value={countryName}>
                  {countryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <br />

          {/* <TextField
            name="query_phone"
            label="Phone"
            variant="outlined"
            fullWidth
            value={formData.query_phone}
            onChange={handleChange}
          /> */}

          <TextField
            width="100%"
            name="query_phone"
            placeholder="XXXXXXXXXX"
            value={phone}
            onChange={handlePhoneChange}
            required
            label="Phone"
            error={phoneError ? true : false}
            helperText={phoneError ? phoneError : " "}
          />
          <TextField
            name="query_text"
            label="Your Query"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={formData.query_text}
            onChange={handleChange}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "grey.600",
              "&:hover": { backgroundColor: "grey.500" },
              color: "white",
            }}
          >
            {" "}
            Submit
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
