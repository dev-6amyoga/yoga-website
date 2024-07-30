import { Box, Container, Link, Paper } from "@mui/material";
import { useRef } from "react";
import Carousel from "react-material-ui-carousel";
import { useNavigate } from "react-router-dom";
import PageWrapper from "./components/Common/PageWrapper";

function Item(props) {
  return (
    <Paper>
      <img
        src={props.image.imageUrl}
        alt={props.image.name}
        style={{ width: "100%" }}
      />
    </Paper>
  );
}

function App() {
  const navigate = useNavigate();
  const screen2Ref = useRef(null);
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
        <Container className="flex flex-col items-center pt-14 sm:pt-20 pb-8 sm:pb-12">
          <div className="flex flex-col gap-2 text-center items-center mt-10">
            <h1 className="">My Yoga Teacher</h1>
            <p className="max-w-xl mx-auto">
              My Yoga Teacher is a comprehensive subscription-based online
              platform that empowers users to learn and practice yoga at their
              own pace, enabling a self-guided DIY approach.
            </p>
          </div>

          <Box className="mt-8 sm:mt-10 w-11/12 sm:w-8/12 mx-auto flex justify-center items-center h-64 sm:h-[500px] rounded-md shadow-md">
            <Carousel
              className="h-64 sm:h-[500px] w-11/12 sm:w-8/12" // Responsive carousel sizing
            >
              {images.map((image, i) => (
                <Item key={i} image={image} />
              ))}
            </Carousel>
          </Box>
        </Container>

        <Box className="w-full bg-gray-800 text-white py-6 mt-8">
          <Container className="flex flex-col items-center">
            <div className="flex gap-6">
              <Link href="/terms-and-conditions" className="hover:underline">
                Terms and Conditions
              </Link>
              <Link href="/contact-us" className="hover:underline">
                Contact Us
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/cancellations" className="hover:underline">
                Refunds and Cancellations
              </Link>
              <Link href="/pricing" className="hover:underline">
                Plans and pricing
              </Link>
            </div>
            <br />
            <p className="mt-4 text-sm">
              © {new Date().getFullYear()} My Yoga Teacher. All rights
              reserved.
            </p>
          </Container>
        </Box>
      </div>
    </PageWrapper>
  );
}

export default App;
