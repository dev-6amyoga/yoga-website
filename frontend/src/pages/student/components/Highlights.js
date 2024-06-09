import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { TextField, Button } from "@mui/material";
import { useState } from "react";
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
  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic (e.g., send data to API)
    console.log(formData);
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
          {/* {items.map((item, index) => (
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
                <Box sx={{ opacity: "50%" }}>{item.icon}</Box>
                <div>
                  <Typography fontWeight="medium" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400" }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))} */}
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
                  {/* Apply filter to logo */}
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
          Submit your query here
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            "& .MuiTextField-root": {},
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

          <TextField
            name="query_phone"
            label="Phone"
            variant="outlined"
            fullWidth
            value={formData.query_phone}
            onChange={handleChange}
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
