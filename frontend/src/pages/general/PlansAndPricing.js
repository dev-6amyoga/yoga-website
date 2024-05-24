import { Card, Divider, Text } from "@geist-ui/core";
import PageWrapper from "../../components/Common/PageWrapper";

function PlansAndPricing() {
  return (
    <PageWrapper heading={"Plans and Pricing"}>
      <div className="flex flex-col items-center">
        <Divider />{" "}
        <Card width="50%" type="dark">
          <Text h4 my={0}>
            Plans and Pricing
          </Text>
          <Text>We currently have two plans for students</Text>
          <Card>
            <Text>Basic Plan</Text>
            <Text>Play 6AM Yoga Playlists!</Text>
            <Text>50 Hours Watch Time Limit</Text>
            <Text>30 days validity</Text>
            <Text>INR 1999</Text>
          </Card>

          <Card>
            <Text>Basic Plan</Text>
            <Text>Play 6AM Yoga Playlists!</Text>
            <Text>50 Hours Watch Time Limit</Text>
            <Text>90 days validity</Text>
            <Text>INR 4999</Text>
          </Card>

          <Card.Footer>
            <Text>
              For any queries contact us at +91990802351 or write us at
              992351@gmail.com
            </Text>
          </Card.Footer>
        </Card>
      </div>
    </PageWrapper>
  );
}
export default PlansAndPricing;
