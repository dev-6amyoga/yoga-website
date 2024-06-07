// import { Button, Card, Input, Link, Text, Textarea } from "@geist-ui/core";
// import { toast } from "react-toastify";
// import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
// import { Fetch } from "../../utils/Fetch";
// import { validateEmail, validatePhone } from "../../utils/formValidation";
// import getFormData from "../../utils/getFormData";
// export default function ContactUs() {
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = getFormData(e);
//     const [validPhone, phoneError] = validatePhone(formData.query_phone);
//     if (!validPhone) {
//       toast(phoneError.message, { type: "error" });
//       return;
//     }
//     if (!formData.query_phone.startsWith("+91")) {
//       formData.query_phone = "+91" + formData.query_phone;
//     }
//     const [validEmail, emailError] = validateEmail(formData.query_email);
//     if (!validEmail) {
//       toast(emailError.message, { type: "error" });
//       return;
//     }
//     console.log(formData);
//     try {
//       const response = await Fetch({
//         url: "/query/register",
//         method: "POST",
//         data: formData,
//       });
//       if (response?.status === 200) {
//         toast("Query submitted!");
//       } else {
//         toast(
//           "Could not submit query. An error occured!Kindly contact us directly."
//         );
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   return (
//       </div>
//       <div className="flex justify-center">
//         <div className="flex flex-col items-center p-6 rounded-md bg-y-white shadow-md mt-10 mx-10">
//           <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
//           <div className="mt-5 overflow-hidden rounded-md">
//             <Card width="100%" type="dark">
//               <Text h4 my={0}>
//                 Phone Number
//               </Text>

//               <Text>992351@gmail.com</Text>
//               <br />
//               <Text h4 my={0}>
//                 Email ID
//               </Text>
//               <Text>+91-9980802351</Text>
//               <Card.Footer>
//                 <Link
//                   target="_blank"
//                   href="https://www.youtube.com/@SivakumarP"
//                 >
//                   Our Youtube Channel
//                 </Link>
//               </Card.Footer>
//             </Card>
//           </div>
//         </div>
//         <div className="flex flex-col items-right p-6 rounded-md bg-y-white shadow-md mt-10 mx-10">
//           <h1 className="text-3xl font-bold mb-4">Submit your queries here!</h1>
//           <div className="mt-5 overflow-hidden rounded-md">
//             <Card width="100%">
//               <form
//                 className="flex flex-col justify-center"
//                 onSubmit={handleSubmit}
//               >
//                 <h6>Name</h6>
//                 <Input width="100%" name="query_name" />
//                 <h6>Email</h6>
//                 <Input width="100%" name="query_email" />
//                 <h6>Phone No.</h6>
//                 <Input width="100%" name="query_phone" />
//                 <h6>Query</h6>
//                 <Textarea
//                   type="success"
//                   height="100px"
//                   placeholder="Please enter your query here"
//                   name="query_text"
//                 />
//                 <br />
//                 <Button type="success" htmlType="submit">
//                   Submit
//                 </Button>
//               </form>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </StudentPageWrapper>
//   );
// }

import * as React from "react";
import PropTypes from "prop-types";

import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material";
import Divider from "@mui/material/Divider";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AppAppBar from "../../components/SidebarMui";
import Hero from "./components/Hero";
import LogoCollection from "./components/LogoCollection";
import Highlights from "./components/Highlights";
import Pricing from "./components/Pricing";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import getLPTheme from "./getLPTheme";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";

export default function LandingPage() {
  const [mode, setMode] = React.useState("light");
  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <StudentNavMUI />
      <Hero heading="Contact Us" />
      <div className="flex flex-col justify-center border-600-blue">
        <Box
          id="image"
          sx={(theme) => ({
            mt: { xs: 0, sm: 0 },
            alignSelf: "center",
            height: { xs: 200, sm: 500 },
            width: "60%",
            borderRadius: "10px",
            outline: "1px solid",
            outlineColor:
              theme.palette.mode === "light"
                ? alpha("#BFCCD9", 0.5)
                : alpha("#9CCCFC", 0.1),
            boxShadow:
              theme.palette.mode === "light"
                ? `0 0 12px 8px ${alpha("#9CCCFC", 0.2)}`
                : `0 0 24px 12px ${alpha("#033363", 0.2)}`,
          })}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.9968518180767!2d77.67348657454568!3d12.907923616272244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1340031bb427%3A0xee0df18d7177d35d!2s6am%20Yoga!5e0!3m2!1sen!2sin!4v1706362049496!5m2!1sen!2sin"
            // style="border:0;"
            className="w-full h-full"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </Box>
      </div>
      <Box sx={{ mt: { xs: 2, sm: 2 }, bgcolor: "background.default" }}>
        {/* <LogoCollection /> */}
        {/* <Features /> */}
        <Divider />
        {/* <Testimonials />
        <Divider /> */}
        <Highlights />
        {/* <Divider />
        <Pricing /> */}
        <Divider />
        <FAQ />
        {/* <Divider />
        <Footer /> */}
      </Box>
    </ThemeProvider>
  );
}
