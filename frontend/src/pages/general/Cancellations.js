import { Card, Divider, Text } from "@geist-ui/core";
import PageWrapper from "../../components/Common/PageWrapper";

function Cancellations() {
  return (
    <PageWrapper heading={"Cancellations and Refunds"}>
      <div className="flex flex-col items-center">
        <Divider />{" "}
        <Card width="50%" type="dark">
          <Text h4 my={0}>
            Cancellations and Refunds
          </Text>
          <Text>
            Subscription once taken cannot be cancelled under any circumstances.
          </Text>
          <Text>
            Fees once paid will not be refunded under any circumstances.
          </Text>
          <Text>
            Incase of any special circumstances, decisions will be taken on a
            case-to-case basis depending on the gravity of the situation.
          </Text>
          <Text>Decision taken by 6AM will be final.</Text>
          <Card.Footer>
            <Text>For any queries contact us at +91990802351.</Text>
          </Card.Footer>
        </Card>
      </div>
    </PageWrapper>
  );
}
export default Cancellations;
