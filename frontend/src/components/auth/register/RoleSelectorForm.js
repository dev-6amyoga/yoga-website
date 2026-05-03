import SchoolIcon from "@mui/icons-material/School";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import { Box, ButtonBase, Stack, Typography } from "@mui/material";

export default function RoleSelectorForm({ role, setRole, handleNextStep }) {
  const roles = [
    {
      value: "STUDENT",
      title: "Student",
      body: "Practice with videos, playlists, and live classes.",
      icon: <SelfImprovementIcon />,
    },
    // {
    //   value: "TEACHER",
    //   title: "Teacher",
    //   body: "Teach and manage yoga learning workflows.",
    //   icon: <SchoolIcon />,
    // },
  ];

  return (
    <Stack spacing={2.5}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ color: "#101828", fontWeight: 900, fontSize: 20 }}>
          Choose your role
        </Typography>
        <Typography sx={{ color: "#667085", mt: 0.5 }}>
          Pick the experience you want to start with.
        </Typography>
      </Box>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        {roles.map((item) => {
          const selected = role === item.value;

          return (
            <ButtonBase
              key={item.value}
              onClick={() => {
                setRole(item.value);
                handleNextStep();
              }}
              sx={{
                flex: 1,
                display: "block",
                textAlign: "left",
                p: 2,
                border: "1px solid",
                borderColor: selected ? "#1f6f5b" : "#dfe5ec",
                borderRadius: 2,
                bgcolor: selected ? "#f0f8f5" : "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#1f6f5b",
                  bgcolor: "rgba(31, 111, 91, 0.06)",
                },
              }}
            >
              <Stack spacing={1}>
                <Box sx={{ color: "#1f6f5b", display: "flex" }}>
                  {item.icon}
                </Box>
                <Typography sx={{ color: "#101828", fontWeight: 900 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#667085" }}>
                  {item.body}
                </Typography>
              </Stack>
            </ButtonBase>
          );
        })}
      </Stack>
    </Stack>
  );
}
