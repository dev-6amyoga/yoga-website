import App from "../App";
import PageWrapper from "../components/Common/PageWrapper";
import NotFound from "../pages/common/NotFound";
import Unauthorized from "../pages/common/Unauthorized";
import Privacy from "../pages/general/Privacy";
import TermsAndConditions from "../pages/general/TermsAndConditions";
import PlansAndPricing from "../pages/general/PlansAndPricing";
import Cancellations from "../pages/general/Cancellations";
import { Card, Text } from "@geist-ui/core";

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
        <Card>
          <Text>Contact us at +919980802351</Text>
          <Text>Write us at 992351@gmail.com</Text>
        </Card>
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
