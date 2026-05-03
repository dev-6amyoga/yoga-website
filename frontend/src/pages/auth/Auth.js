import { useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import PageWrapper from "../../components/Common/PageWrapper";
import Login from "../login/login";
import Register from "../register/register";
import "./Auth.css";

export default function Auth() {
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (location.state) {
      setLoginOpen(
        location?.state?.login !== undefined ? location?.state?.login : false,
      );
    }

    if (searchParams.get("login") === "true") {
      setLoginOpen(true);
    }
    if (searchParams.get("register") === "true") {
      setLoginOpen(false);
    }
  }, [location, searchParams]);

  const isLogin =
    loginOpen ||
    searchParams.get("login") === "true" ||
    !(searchParams.get("register") === "true");

  const pageCopy = useMemo(
    () =>
      isLogin
        ? {
            label: "Welcome back",
            title: "Continue your yoga practice",
            body: "Sign in to access your classes, playlists, plans, and watch history.",
          }
        : {
            label: "Create account",
            title: "Start with 6AM Yoga",
            body: "Create your profile in a few simple steps and begin with free videos or a subscription plan.",
          },
    [isLogin],
  );

  return (
    <PageWrapper>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f7f8fb",
          display: "grid",
          placeItems: "center",
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1120,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "center",
          }}
        >
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Chip
              label={pageCopy.label}
              sx={{ mb: 2, bgcolor: "#e8f5e9", color: "#1f6f5b", fontWeight: 800 }}
            />
            <Typography
              component="h1"
              sx={{
                color: "#101828",
                fontSize: { md: 44, lg: 52 },
                lineHeight: 1.05,
                fontWeight: 900,
                mb: 2,
              }}
            >
              {pageCopy.title}
            </Typography>
            <Typography sx={{ color: "#667085", fontSize: 18, lineHeight: 1.7 }}>
              {pageCopy.body}
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 4 }}>
              {["Free yoga videos", "Guided subscriptions", "Live class access"].map(
                (item) => (
                  <Box
                    key={item}
                    sx={{
                      bgcolor: "#fff",
                      border: "1px solid #dfe5ec",
                      borderRadius: 2,
                      px: 2,
                      py: 1.25,
                      color: "#344054",
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </Box>
                ),
              )}
            </Stack>
          </Box>

          <Card
            elevation={0}
            sx={{
              border: "1px solid #dfe5ec",
              borderRadius: 2,
              boxShadow: "0 16px 42px rgba(16, 24, 40, 0.08)",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 4, md: 5 } }}>
              {isLogin ? (
                <Login switchForm={setLoginOpen} />
              ) : (
                <Register switchForm={setLoginOpen} />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </PageWrapper>
  );
}
