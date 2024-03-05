import { Button } from "@geist-ui/core";
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFrontendDomain } from "./utils/getFrontendDomain";
import PageWrapper from "./components/Common/PageWrapper";
import { useInView } from "react-intersection-observer";

// function App() {
//   const screen = useRef(null);
//   const canvas = useRef(null);
//   const scale = 2;
//   const frames = 300;
//   const navigate = useNavigate();

//   // const [scrollPos, setScrollPos] = useState(0);
//   const [ctx, setCtx] = useState(null);
//   const [screenDimensions, setScreenDimensions] = useState({
//     width: 0,
//     height: 0,
//   });

//   useEffect(() => {
//     if (canvas.current) {
//       const c = canvas.current.getContext("2d");
//       setCtx(c);
//     }
//   }, [canvas]);

//   useEffect(() => {
//     if (ctx) {
//       const img = new Image();
//       console.log("here");
//       img.src = `${getFrontendDomain()}/frames/Untitled00108000.jpg`;
//       img.onload = () => {
//         ctx.drawImage(
//           img,
//           0,
//           0,
//           screenDimensions.width * scale,
//           screenDimensions.height * scale
//         );
//       };
//     }
//   }, [ctx]);

//   useEffect(() => {
//     if (canvas) {
//       canvas.current.width = screenDimensions.width * scale;
//       canvas.current.height = screenDimensions.height * scale;
//     }
//   }, [screenDimensions]);

//   useEffect(() => {
//     const dim = canvas.current.getBoundingClientRect();
//     setScreenDimensions({
//       width: dim.width,
//       height: dim.height,
//     });
//   }, [screen]);

//   const handleScroll = (e) => {
//     // TODO : make this smooth somehow
//     console.log(e.target.scrollTop);
//     const img = new Image();
//     console.log(
//       `${getFrontendDomain()}/frames/Untitled00108${String(
//         Math.floor(e.target.scrollTop / 5)
//       ).padStart(3, "0")}.jpg`
//     );
//     img.src = `${getFrontendDomain()}/frames/Untitled00108${String(
//       Math.floor(e.target.scrollTop / 5)
//     ).padStart(3, "0")}.jpg`;
//     img.onload = () => {
//       ctx.drawImage(
//         img,
//         0,
//         0,
//         screenDimensions.width * scale,
//         screenDimensions.height * scale
//       );
//     };
//   };

//   return (
//     <div
//       className="h-screen overflow-y-scroll relative smooth-scroll"
//       ref={screen}
//       onScroll={handleScroll}
//     >
//       <div className="h-[300vh] bg-transparent pointer-events-auto"></div>
//       <div className="h-[300vh] absolute top-0 w-full bg-black bg-opacity-10 z-[1000] pointer-events-auto">
//         <div className="h-screen w-full relative">
//           <div className="w-full flex items-center justify-center absolute bottom-0">
//             <Button onClick={() => navigate("/auth")}>Enter</Button>
//           </div>
//         </div>
//         <div className="h-screen w-full text-white"></div>
//       </div>

//       <canvas
//         id="canvas"
//         className="w-full h-screen bg-zinc-200 sticky top-0 left-0 right-0 bottom-0 z-10 pointer-events-auto"
//         ref={canvas}
//       ></canvas>
//     </div>
//   );
// }

function App() {
  const navigate = useNavigate();
  const screen2Ref = useRef(null);
  // const isScreen2InView = useInView(screen2Ref, { once: false });

  // useEffect(() => {
  //   console.log(isScreen2InView);
  // }, [isScreen2InView]);

  return (
    <PageWrapper>
      <div className="relative w-full h-screen">
        <div className="w-full h-full fixed z-10 top-0 left-0 right-0 bottom-0 bg-black bg-opacity-40">
          <video
            src={
              window.innerWidth < 640
                ? "/frontpage_video_mobile.mp4"
                : "/frontpage_video.mp4"
            }
            // src={"/frontpage_video.mp4"}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        </div>

        {/* <div className="w-full flex items-center justify-center absolute bottom-0">
          <Button onClick={() => navigate("/auth")}>Enter</Button>
        </div> */}
        <div className="absolute z-20 h-full w-full text-white pl-16">
          <div className="h-screen w-full text-2xl">screen 1</div>
          <div
            className="h-screen w-full text-2xl"
            // ref={screen2Ref}
            // style={{
            //   backgroundColor: isScreen2InView ? "red" : "blue",
            // }}
          >
            screen 2
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default App;
