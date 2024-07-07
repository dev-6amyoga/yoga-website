import GeneralNavbar from "./GeneralNavbar/GeneralNavbar";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";

export default function PageWrapper({ heading, children }) {
  const navigate = useNavigate();
  const pages = ["Login/Register"];
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (e) => {
    setAnchorElNav(true);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <>
      {/* <GeneralNavbar /> */}
      {/* <AppBar position="static"> */}
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          mt: 2,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            variant="regular"
            sx={(theme) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              borderRadius: "999px",
              bgcolor:
                theme.palette.mode === "light"
                  ? "rgba(255, 255, 255, 1.3)"
                  : "rgba(2, 31, 59, 0.7)",
              backdropFilter: "blur(24px)",
              maxHeight: 40,
              border: "1px solid",
              borderColor: "divider",
              boxShadow:
                theme.palette.mode === "light"
                  ? `0 0 1px rgba(85, 166, 246, 0.1), 1px 1.5px 2px -1px rgba(85, 166, 246, 0.15), 4px 4px 12px -2.5px rgba(85, 166, 246, 0.15)`
                  : "0 0 1px rgba(2, 31, 59, 0.7), 1px 1.5px 2px -1px rgba(2, 31, 59, 0.65), 4px 4px 12px -2.5px rgba(2, 31, 59, 0.65)",
            })}
          >
            <img
              src="logo_6am.png"
              alt="image_description"
              className="w-20 pt-2"
            />

            <Tooltip title="Register/Login">
              <Button
                onClick={() => {
                  navigate("/auth");
                  setTimeout(() => {
                    window.location.reload();
                  }, 100); // Adjust the delay as needed
                }}
              >
                <PersonIcon style={{ color: "blue" }} />
              </Button>
            </Tooltip>
          </Toolbar>
        </Container>
      </AppBar>
      <Box
        className="flex flex-col justify-center rounded-md"
        // id="hero"
        // sx={(theme) => ({
        //   width: "100%",
        //   backgroundImage:
        //     theme.palette.mode === "light"
        //       ? "linear-gradient(180deg, #CEE5FD, #FFF)"
        //       : `linear-gradient(#02294F, ${alpha("#090E10", 0.0)})`,
        //   backgroundSize: "100% 20%",
        //   backgroundRepeat: "no-repeat",
        // })}
      >
        <div className="min-h-screen">
          {heading ? (
            <h1 className="pt-4 font-bold text-center">{heading}</h1>
          ) : (
            <></>
          )}
          <div className="">{children}</div>
        </div>
      </Box>
    </>
  );
}
