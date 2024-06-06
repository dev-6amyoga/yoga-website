import { Button, Card, Display, Spacer, Tabs, Text } from "@geist-ui/core";
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFrontendDomain } from "./utils/getFrontendDomain";
import PageWrapper from "./components/Common/PageWrapper";
import { useInView } from "react-intersection-observer";
import Carousel from "react-material-ui-carousel";
import { alpha } from "@mui/material";
import {
  Box,
  Typography,
  Container,
  Stack,
  TextField,
  Link,
  Paper,
} from "@mui/material";

function Item(props) {
  return (
    <Paper>
      <img
        src={props.image.imageUrl}
        alt={props.image.name}
        style={{ width: "100%" }}
      />
      {/* <h2>{props.image.name}</h2>
      <p>{props.image.description}</p> */}
    </Paper>
  );
}

function App() {
  const navigate = useNavigate();
  const screen2Ref = useRef(null);
  // const isScreen2InView = useInView(screen2Ref, { once: false });
  const images = [
    {
      name: "Image 1",
      description: "This is the first image",
      imageUrl: "img1.jpg",
    },
    {
      name: "Image 2",
      description: "This is the second image",
      imageUrl: "img2.jpg",
    },
  ];

  return (
    <PageWrapper>
      <div className="relative w-full h-screen">
        {/* <Box
          id="hero"
          sx={(theme) => ({
            width: "100%",
            backgroundImage:
              theme.palette.mode === "light"
                ? "linear-gradient(180deg, #CEE5FD, #FFF)"
                : `linear-gradient(#02294F, ${alpha("#090E10", 0.0)})`,
            backgroundSize: "100% 20%",
            backgroundRepeat: "no-repeat",
          })}
        > */}
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: { xs: 14, sm: 20 },
            pb: { xs: 8, sm: 12 },
          }}
        >
          <Stack
            spacing={2}
            useFlexGap
            sx={{ width: { xs: "100%", sm: "70%" } }}
          >
            <Typography
              variant="h1"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignSelf: "center",
                textAlign: "center",
                fontSize: "clamp(3.5rem, 10vw, 4rem)",
              }}
            >
              My Yoga&nbsp;
              <Typography
                component="span"
                variant="h1"
                sx={{
                  fontSize: "clamp(3rem, 10vw, 4rem)",
                  color: (theme) =>
                    theme.palette.mode === "light"
                      ? "primary.main"
                      : "primary.light",
                }}
              >
                Teacher
              </Typography>
            </Typography>
            <Typography
              textAlign="center"
              color="text.secondary"
              sx={{ alignSelf: "center", width: { sm: "100%", md: "80%" } }}
            >
              My Yoga Teacher is a comprehensive subscription-based online
              platform that empowers users to learn and practice yoga at their
              own pace, enabling a self-guided DIY approach.
            </Typography>
          </Stack>
          <Box
            id="image"
            sx={(theme) => ({
              mt: { xs: 8, sm: 10 },
              alignSelf: "center",
              height: { xs: 200, sm: 700 },
              width: "85%",
              display: "flex", // Enable flexbox
              justifyContent: "center", // Horizontal centering
              alignItems: "center", // Vertical centering (optional)

              backgroundImage:
                theme.palette.mode === "light"
                  ? 'url("/static/images/templates/templates-images/hero-light.png")'
                  : 'url("/static/images/templates/templates-images/hero-dark.png")',
              backgroundSize: "cover",
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
            <Carousel
              sx={{
                height: 600, // Set your desired height in pixels
                width: 800,
                "& .MuiCarousel-img": { height: 600 }, // Adjust image height as needed
              }}
            >
              {images.map((image, i) => (
                <Item key={i} image={image} />
              ))}
            </Carousel>
          </Box>
        </Container>
        {/* </Box> */}
      </div>
    </PageWrapper>
  );
}

export default App;
