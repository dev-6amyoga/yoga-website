import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { alpha } from "@mui/material";
import Divider from "@mui/material/Divider";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import TeacherNavbar from "../../components/Common/TeacherNavbar/TeacherNavbar";
import Highlights from "../student/components/Highlights";
import FAQ from "../student/components/FAQ";
import Hero from "../student/components/Hero";

export default function ContactUs() {
  const [mode, setMode] = React.useState("light");
  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <TeacherNavbar />
      <Hero heading="Contact Us" />
      <div className="flex flex-col items-center border-600-blue">
        <Box
          id="image"
          sx={(theme) => ({
            mt: { xs: 0, sm: 0 },
            alignSelf: "center",
            height: { xs: 150, sm: 400 }, // Reduced height
            width: { xs: "90%", sm: "50%" }, // Reduced and responsive width
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
            className="w-full h-full"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </Box>
      </div>

      <Box sx={{ mt: { xs: 2, sm: 2 }, bgcolor: "background.default" }}>
        <Divider />
        <Divider />
        <Highlights />

        <Divider />
        <FAQ />
      </Box>
    </ThemeProvider>
  );
}
