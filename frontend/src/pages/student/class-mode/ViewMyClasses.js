import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import { alpha, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import StudentNavMUI from "../../../components/Common/StudentNavbar/StudentNavMUI";
import Hero from "../components/Hero";

export default function ViewMyClasses() {
  const [mode, setMode] = React.useState("light");
  const defaultTheme = createTheme({ palette: { mode } });

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <StudentNavMUI />
      <Hero heading="My Classes" />
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
          <div>
            <Typography>Hello</Typography>
          </div>
        </Box>
      </div>
    </ThemeProvider>
  );
}
