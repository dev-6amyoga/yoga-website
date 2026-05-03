import { Box, Button, Stack, Typography } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import GoogleIcon from "@mui/icons-material/Google";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";

export default function PickRegistationMode({
  regMode,
  setRegMode,
  setGoogleInfo,
  setGeneralInfo,
  setLoading,
  clientID,
  handleNextStep,
  handleExistingGoogleLogin,
}) {
  const verifyGoogleToken = async (credentialResponse) => {
    setLoading(true);
    const jwt_token = credentialResponse.credential || null;

    try {
      const payload = await Fetch({
        url: `/auth/verify-google`,
        method: "POST",
        data: {
          client_id: clientID,
          jwtToken: jwt_token,
        },
      });

      const email_verified = payload.data.email_verified;
      if (payload?.data?.message === "User already exists; Please sign in") {
        await handleExistingGoogleLogin(jwt_token);
        return;
      }

      if (payload?.data?.message && payload.data.message !== "Token verified") {
        toast(payload.data.message, { type: "warning" });
        return;
      }

      if (email_verified) {
        const email = payload.data.email;
        const name = payload.data.name;
        setGoogleInfo({
          jwt_token,
          verified: true,
          email_id: email,
          name,
        });
        setGeneralInfo({
          email_id: email,
          name,
        });
        handleNextStep();
      } else {
        setGoogleInfo({ verified: false });
        toast("Google email is not verified", { type: "warning" });
      }
    } catch (error) {
      toast("Google login failed. Try again", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ color: "#101828", fontWeight: 900, fontSize: 20 }}>
          Choose how to sign up
        </Typography>
        <Typography sx={{ color: "#667085", mt: 0.5 }}>
          Google is fastest, or use your email to create a password.
        </Typography>
      </Box>

      <Stack spacing={1.5}>
        <Box
          sx={{
            p: 2,
            border: "1px solid #dfe5ec",
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: regMode === "GOOGLE" ? "#f0f8f5" : "#fff",
          }}
          onClick={() => setRegMode("GOOGLE")}
        >
          <Stack spacing={1} alignItems="center">
            <GoogleIcon sx={{ color: "#1f6f5b" }} />
            <GoogleLogin
              size="large"
              onSuccess={verifyGoogleToken}
              onError={() => {
                toast("Google login failed", { type: "warning" });
              }}
              onNonOAuthError={() => {
                toast("Google login failed. Try again", {
                  type: "warning",
                });
              }}
            />
          </Stack>
        </Box>

        <Button
          onClick={() => {
            setGoogleInfo({});
            setRegMode("NORMAL");
            handleNextStep();
          }}
          variant="outlined"
          startIcon={<MailOutlineIcon />}
          size="large"
          sx={{
            borderColor: "#1f6f5b",
            color: "#1f6f5b",
            py: 1.2,
            fontWeight: 900,
            textTransform: "none",
            "&:hover": {
              borderColor: "#185846",
              bgcolor: "rgba(31, 111, 91, 0.08)",
            },
          }}
        >
          Continue with email
        </Button>
      </Stack>
    </Stack>
  );
}
