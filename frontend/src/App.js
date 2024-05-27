import { Button, Card, Display, Spacer, Tabs, Text } from "@geist-ui/core";
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFrontendDomain } from "./utils/getFrontendDomain";
import PageWrapper from "./components/Common/PageWrapper";
import { useInView } from "react-intersection-observer";

function App() {
  const navigate = useNavigate();
  const screen2Ref = useRef(null);
  // const isScreen2InView = useInView(screen2Ref, { once: false });

  return (
    <PageWrapper>
      <div className="relative w-full h-screen">
        {/* <div className="w-full h-full fixed z-10 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40"> */}
        {/* <video
            src={
              window.innerWidth < 640
                ? "/frontpage_video_mobile.mp4"
                : "/frontpage_video.mp4"
            }
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          /> */}
        {/* </div> */}
        <div className="absolute z-20 h-full w-full text-white pl-16">
          <div className="h-screen w-full text-2xl"></div>
          <div className="h-screen w-full text-2xl">
            {/* <Display shadow>screen 1</Display> */}
            {/* <div
              className={`w-full h-full bg-grey-900 bg-opacity-40 backdrop-blur-md text-white text-2xl pointer-events transition-all duration-500 flex flex-col pt-6 items-center`}
            >
              <Card width="80%">
                <Text h3>About Us</Text>
                <Spacer />
                <Tabs initialValue="1">
                  <Tabs.Item color="white" label="Who we are" value="1">
                    <div className="flex flex-col items-center">
                      <Spacer />
                      <Spacer />
                      <Text>
                        Multiple schools, such as the Bihar School of Yoga and
                        SVYASA, offer unique perspectives and approaches to
                        teaching and practising yoga. Thus, a multitude of
                        styles have also emerged, including Ashtanga, Hatha,
                        Vinyasa, and Power Yoga, catering to a wide range of
                        practitioners and preferences.
                      </Text>
                      <Spacer />
                      <Text h3>This inherent diversity has led to</Text>
                      <Text>
                        1. Lack of standardisation due to varied teaching
                        styles.
                      </Text>
                      <Text>
                        2. Inadequate awareness of yoga resulting from
                        inconsistent learning and practice methods.
                      </Text>
                      <Text>
                        3. Lack of last-mile quality due to poor communication
                        skills.
                      </Text>
                      <Text>
                        4. Limited scalability due to underutilization of
                        technology.
                      </Text>
                      <Spacer />
                      <Text>
                        My Yoga Teacher is a comprehensive subscription-based
                        online platform that empowers users to learn and
                        practice yoga at their own pace, enabling a self-guided,
                        do-it-yourself (DIY) approach.
                      </Text>
                    </div>
                  </Tabs.Item>
                  <Tabs.Item color="white" label="Features" value="2">
                    <Spacer />
                    <Text h6>
                      1. High-quality, instructional yoga videos developed based
                      on AYUSH Ministry protocols, SVYASA University processes,
                      and 25 years of yoga teaching expertise
                    </Text>
                    <Spacer />
                    <Text>
                      2. The videos are created with the “Tristhana” concept -
                      standard steps, right breathing techniques and correct
                      gazing points (Drishti).
                    </Text>
                    <Spacer />
                    <Text h6>
                      3. The videos contain instructions in various local
                      languages to help users easily understand the steps and
                      techniques to be adopted.
                    </Text>
                    <Spacer />
                    <Text>
                      4. Standard yogasana playlists tailored for overall
                      fitness, as well as targeted playlists addressing specific
                      needs like back pain relief, weight management, etc.
                    </Text>
                    <Spacer />
                    <Text h6>
                      5. Users can personalise their yoga journey by creating
                      custom playlists, enabling them to learn yoga at their own
                      pace.
                    </Text>
                    <Spacer />
                    <Text>
                      Our inbuilt class-mode empowers institutes and individuals
                      to conduct yoga classes using our videos and playlists
                      right out of the box.
                    </Text>
                    <Spacer />
                    <Text h6>
                      7. An AI Posture Corrector that gives live feedback while
                      the practitioner practises yoga.
                    </Text>
                    <Spacer />
                    <Text>And many more</Text>
                  </Tabs.Item>
                </Tabs>
                <Card.Footer>
                  <Text>
                    For any queries, contact us at +919980802351, or write to us
                    at 992351@gmail.com
                  </Text>
                </Card.Footer>
              </Card>
            </div> */}
          </div>
          {/* <div className="h-screen w-full text-2xl">screen 2</div> */}
        </div>
      </div>
    </PageWrapper>
  );
}

export default App;
