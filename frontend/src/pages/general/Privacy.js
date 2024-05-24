import { Card, Divider, Text } from "@geist-ui/core";
import PageWrapper from "../../components/Common/PageWrapper";

function Privacy() {
  return (
    <PageWrapper heading={"Privacy Policy"}>
      <div className="flex flex-col items-center">
        <Divider />{" "}
        <Card width="50%" type="dark">
          <Text h4 my={0}>
            Privacy Policy
          </Text>
          <Text>
            This Privacy Policy outlines how the Teacher collects, uses, and
            protects your personal information when you participate in online
            and offline classes. By signing up with the Teacher through the 6AM
            Yoga platform, you agree to this Privacy Policy.
          </Text>
          <Text>
            Data Collection and Usage : The Teacher collects personal
            information such as name, email address, and other relevant details
            to provide and manage classes. This information is used solely for
            class management and communication purposes.
          </Text>
          <Text>
            Third-Party Interactions : The Teacher may engage with third-party
            services for class management and other purposes. Please refer to
            the individual third-party privacy policies for more information.
          </Text>
          <Text>
            Security and Protection : The Teacher takes reasonable measures to
            protect your personal information. However, no method of
            transmission or electronic storage is completely secure.
          </Text>
          <Text>
            Consent and Agreement : By signing up for classes with the Teacher,
            you consent to the collection and use of your personal information
            as described in this Privacy Policy.
          </Text>
          <Text>
            Changes to Privacy Policy : The Teacher may update this Privacy
            Policy from time to time. Any changes will be posted on the
            Teacher's website, and continued participation in classes
            constitutes acceptance of the revised terms.
          </Text>
          <Text>
            Contact Information For any inquiries or concerns related to this
            Privacy Policy, please contact the Teacher through the contact
            details provided. (992351@gmail.com)
          </Text>
          <Card.Footer>
            <Text>For any queries contact us at +91990802351.</Text>
          </Card.Footer>
        </Card>
      </div>
    </PageWrapper>
  );
}
export default Privacy;
