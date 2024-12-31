import React, { useEffect, useState } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
import useShakaOfflineStore from "../store/ShakaOfflineStore";
import { toast } from "react-toastify";

const DownloadProgressCircle = () => {
  const downloadProgress = useShakaOfflineStore(
    (state) => state.downloadProgress
  );

  const [visible, setVisible] = useState(false);

  // useEffect(() => {
  //   if (!visible) {
  //     return null;
  //   }
  // }, [visible]);

  useEffect(() => {
    const roundedProgress = Math.round(downloadProgress * 100);

    if (roundedProgress > 0 && roundedProgress < 100) {
      setVisible(true);
    } else if (roundedProgress === 100) {
      setVisible(false);
      toast("Playing soon!");
    }
  }, [downloadProgress]);

  const progressPercentage = Math.round(downloadProgress * 100);
  if (!visible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay
        zIndex: 15000,
      }}
    >
      <Box
        position="relative"
        display="inline-flex"
        sx={{
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.8)",
        }}
      >
        <CircularProgress
          variant="determinate"
          value={progressPercentage}
          size={120}
          thickness={4}
          sx={{
            color: "#1e90ff",
          }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          right={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h4"
            component="div"
            color="white"
            sx={{
              fontWeight: "bold",
              textShadow: "1px 1px 5px rgba(0, 0, 0, 0.7)",
            }}
          >
            {`${progressPercentage}%`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DownloadProgressCircle;
