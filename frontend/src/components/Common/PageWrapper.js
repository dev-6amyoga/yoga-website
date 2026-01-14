import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";

export default function PageWrapper({ heading, children }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          px: 1,
          width: "100vw",
          left: 0,
        }}
      >
        <Toolbar
          sx={(theme) => ({
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            overflow: "hidden",
            borderRadius: "999px",
            px: 1,
            py: 0.5,
            minHeight: 44,
            bgcolor:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.9)"
                : "rgba(2, 31, 59, 0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid",
            borderColor: "divider",
          })}
        >
          {/* Logo */}
          <Box sx={{ display: "flex", alignItems: "center", maxWidth: "60%" }}>
            <img
              src="logo_6am.png"
              alt="logo"
              style={{
                height: isMobile ? 22 : 28,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          {/* Icons */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <Tooltip title="Home">
              <Button
                size="small"
                onClick={() => navigate("/")}
                sx={{ minWidth: 36 }}
              >
                <HomeIcon fontSize="small" />
              </Button>
            </Tooltip>

            <Tooltip title="Register/Login">
              <Button
                size="small"
                onClick={() => {
                  navigate("/auth");
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }}
                sx={{ minWidth: 36 }}
              >
                <PersonIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content spacing */}
      <Box sx={{ pt: 8 }}>
        <div className="min-h-screen">
          {heading && <h1 className="pt-4 font-bold text-center">{heading}</h1>}
          <div>{children}</div>
        </div>
      </Box>
    </>
  );
}
