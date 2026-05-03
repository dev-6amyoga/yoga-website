import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

export default function PageWrapper({ heading, children }) {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const navItems = [
    { label: "Pricing", path: "/pricing", icon: <PaymentsOutlinedIcon /> },
    {
      label: "Contact",
      path: "/contact-us",
      icon: <ContactSupportOutlinedIcon />,
    },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          boxShadow: 0,
          bgcolor: "transparent",
          backgroundImage: "none",
          px: { xs: 1, md: 3 },
          py: 1.25,
          width: "100%",
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
            px: { xs: 1.25, md: 2 },
            py: 0.75,
            minHeight: { xs: 48, md: 56 },
            bgcolor:
              theme.palette.mode === "light"
                ? "rgba(255, 255, 255, 0.86)"
                : "rgba(2, 31, 59, 0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
          })}
        >
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              maxWidth: "60%",
              cursor: "pointer",
            }}
          >
            <img
              src="/logo_6am.png"
              alt="6AM Yoga"
              style={{
                height: isMobile ? 24 : 32,
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.25, md: 0.75 },
              flexShrink: 0,
            }}
          >
            {!isMobile &&
              navItems.map((item) => (
                <Button
                  key={item.path}
                  size="small"
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: "#182230",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 1.5,
                  }}
                >
                  {item.label}
                </Button>
              ))}

            <Tooltip title="Home">
              <Button
                size="small"
                onClick={() => navigate("/")}
                sx={{ color: "#182230", minWidth: 36 }}
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
                sx={{
                  bgcolor: "#1f6f5b",
                  color: "#fff",
                  minWidth: 36,
                  px: { xs: 1, md: 1.75 },
                  textTransform: "none",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#185846" },
                }}
              >
                {isMobile ? <PersonIcon fontSize="small" /> : "Login"}
              </Button>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: { xs: 8, md: 9 }, bgcolor: "#f7f8fb" }}>
        <Box sx={{ minHeight: "100vh", overflow: "visible" }}>
          {heading && (
            <Box sx={{ textAlign: "center", px: 2, pt: 5 }}>
              <h1 className="font-bold">{heading}</h1>
            </Box>
          )}
          {children}
        </Box>
      </Box>
    </>
  );
}
