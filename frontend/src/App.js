import { Button } from "@geist-ui/core";
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const screen = useRef(null);
  const canvas = useRef(null);
  const scale = 2;
  const frames = 300;

  // const [scrollPos, setScrollPos] = useState(0);
  const [ctx, setCtx] = useState(null);
  const [screenDimensions, setScreenDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (canvas.current) {
      const c = canvas.current.getContext("2d");
      setCtx(c);

      const img = new Image();

      img.src = `http://localhost:3000/frames/Untitled00108000.jpg`;
      img.onload = () => {
        c.drawImage(
          img,
          0,
          0,
          screenDimensions.width * scale,
          screenDimensions.height * scale
        );
      };
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas) {
      canvas.current.width = screenDimensions.width * scale;
      canvas.current.height = screenDimensions.height * scale;
    }
  }, [screenDimensions]);

  useEffect(() => {
    const dim = canvas.current.getBoundingClientRect();
    console.log(dim);
    setScreenDimensions({
      width: dim.width,
      height: dim.height,
    });
  }, [screen]);

  const handleScroll = (e) => {
    // TODO : make this smooth somehow
    console.log(e.target.scrollTop);
    const img = new Image();
    console.log(
      `http://localhost:3000/frames/Untitled00108${String(
        Math.floor(e.target.scrollTop / 5)
      ).padStart(3, "0")}.jpg`
    );
    img.src = `http://localhost:3000/frames/Untitled00108${String(
      Math.floor(e.target.scrollTop / 5)
    ).padStart(3, "0")}.jpg`;
    img.onload = () => {
      ctx.drawImage(
        img,
        0,
        0,
        screenDimensions.width * scale,
        screenDimensions.height * scale
      );
    };
  };

  return (
    <div
      className="h-screen overflow-y-scroll relative smooth-scroll"
      ref={screen}
      onScroll={handleScroll}
    >
      <div className="h-[300vh] bg-transparent pointer-events-auto"></div>

      <div className="h-[300vh] absolute top-0 w-full bg-black bg-opacity-10 z-20 pointer-events-auto">
        <div className="h-screen top-0 w-full text-white">
          <h1>6AM Yoga</h1>
          <p>tagline wohohoohohoohohohohoho tagline ends</p>
        </div>
        <div className="h-screen top-0 w-full text-white">
          <h1>6AM Yoga</h1>
          <p>tagline wohohoohohoohohohohoho tagline ends</p>
        </div>
      </div>

      <canvas
        id="canvas"
        className="w-full h-screen bg-zinc-200 sticky top-0 left-0 right-0 bottom-0 z-10 pointer-events-auto"
        ref={canvas}
      ></canvas>
    </div>
  );
}

export default App;
