import App from "../App";
import PageWrapper from "../components/Common/PageWrapper";
import NotFound from "../pages/common/NotFound";
import Unauthorized from "../pages/common/Unauthorized";
import Privacy from "../pages/general/Privacy";
import TermsAndConditions from "../pages/general/TermsAndConditions";
import PlansAndPricing from "../pages/general/PlansAndPricing";
import Cancellations from "../pages/general/Cancellations";
import { Text } from "@geist-ui/core";
import { Card, CardContent, Typography, Divider } from "@mui/material";

const ContactCard = () => {
  return (
    <Card sx={{ maxWidth: 600, margin: "auto", mt: 14 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Contact Us
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" paragraph>
          Phone: <strong>+919980802351</strong>
        </Typography>
        <Typography variant="body1" paragraph>
          Email: <a href="mailto:992351@gmail.com">992351@gmail.com</a>
        </Typography>
        <Typography variant="body1" paragraph>
          Operating and Registered Address:
          <br />
          6AM, 4th Floor, Shalom Arcade,
          <br />
          Kasavanahalli, Sarjapur Road,
          <br />
          Bangalore 560035, Karnataka, India
        </Typography>
      </CardContent>
    </Card>
  );
};

export const GeneralRoutes = [
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/about-us",
    element: <PageWrapper>NOT IMPLEMENTED</PageWrapper>,
  },
  {
    path: "/contact-us",
    element: (
      <PageWrapper>
        <div className="min-h-screen grid place-items-center">
          <ContactCard />
        </div>
      </PageWrapper>
    ),
  },
  {
    path: "/pricing",
    element: <PlansAndPricing />,
  },
  {
    path: "/terms-and-conditions",
    element: <TermsAndConditions />,
  },
  {
    path: "/cancellations",
    element: <Cancellations />,
  },
  {
    path: "/privacy",
    element: <Privacy />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];
