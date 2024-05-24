import PageWrapper from "../../components/Common/PageWrapper";
import { Card, Divider, Text } from "@geist-ui/core";

function TermsAndConditions() {
  return (
    <PageWrapper heading={"Terms and Conditions"}>
      <div className="flex flex-col items-center">
        <Divider />{" "}
        <Card width="50%" type="dark">
          <Text h4 my={0}>
            Terms and Conditions
          </Text>
          <Text>
            Acceptance of Terms : By accessing the website, you agree to be
            bound by these Terms and Conditions, all applicable laws and
            regulations, and agree that you are responsible for compliance with
            any applicable local laws.
          </Text>
          <Text>
            Use of the Platform : The platform enables you to engage in online
            content by 6AM Yoga facilitated by your chosen teacher or
            institution ("Teacher"). You must comply with all rules and
            guidelines set by the Teacher and our website.
          </Text>
          <Text>
            Student Responsibilities : You are responsible for ensuring that you
            have the necessary equipment and internet connection to access the
            videos. You must adhere to all guidelines and codes of conduct set
            by your Teacher.
          </Text>
          <Text>
            Payments : If applicable, payments for the services must be made
            through the platform or as directed by your Teacher. All payments
            are subject to the terms and conditions set by the Teacher and the
            platform.
          </Text>
          <Text>
            Privacy : Your privacy is important to us. Please review our Privacy
            Policy for information on how your personal information is
            collected, used, and shared.
          </Text>
          <Text>
            Intellectual Property : All content, including but not limited to
            class materials, videos, and documents provided by the Teacher, is
            the intellectual property of the Teacher or other rightful owners.
            You may not distribute, reproduce, or use this content in any way
            without express permission.
          </Text>
          <Text>
            Disclaimers and Limitations of Liability : 6AM Yoga and the Teacher
            make no warranties, expressed or implied, and hereby disclaim and
            negate all other warranties. Neither 6AM Yoga nor the Teacher shall
            be liable for any damages arising from your use of the platform.
          </Text>
          <Text>
            Modifications to Terms : 6AM Yoga or the Teacher may revise these
            Terms and Conditions at any time without notice. By using this
            website, you agree to be bound by the then-current version of these
            Terms and Conditions.
          </Text>
          <Text>
            Governing Law : These terms and conditions are governed by the laws
            of the jurisdiction in which your Teacher operates, and any disputes
            will be resolved in accordance with those laws.
          </Text>
          <Text>
            Contact Information : For any questions or concerns regarding these
            Terms and Conditions, please contact your Teacher or email us at
            992351@gmail.com.
          </Text>
          <Card.Footer>
            <Text>For any queries contact us at +91990802351.</Text>
          </Card.Footer>
        </Card>
      </div>
    </PageWrapper>
  );
}
export default TermsAndConditions;
