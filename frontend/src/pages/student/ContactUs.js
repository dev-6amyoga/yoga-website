import { Card, Text, Link } from "@geist-ui/core";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
export default function ContactUs() {
  return (
    <div>
      <div>
        <StudentNavbar />
      </div>
      <div className="flex flex-row justify-center">
        <div className="flex flex-col items-start gap-2 p-6 bg-gray-500 text-white mt-10 mx-10 rounded-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.9968518180767!2d77.67348657454568!3d12.907923616272244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1340031bb427%3A0xee0df18d7177d35d!2s6am%20Yoga!5e0!3m2!1sen!2sin!4v1706362049496!5m2!1sen!2sin"
            width="600"
            height="450"
            // style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div className="flex flex-col items-center p-6 rounded-md bg-gray-200 shadow-md mt-10 mx-10">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <div className="max-w-[1200px] mx-auto mt-5 overflow-hidden rounded-md">
            {/* YouTube player */}
            <Card width="100%" type="dark">
              <Text h4 my={0}>
                Phone Number
              </Text>

              <Text>992351@gmail.com</Text>
              <br />
              <Text h4 my={0}>
                Email ID
              </Text>
              <Text>+91-9980802351</Text>
              <Card.Footer>
                <Link
                  target="_blank"
                  href="https://www.youtube.com/@SivakumarP"
                >
                  Our Youtube Channel
                </Link>
              </Card.Footer>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
