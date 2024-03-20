import { Button } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gifs } from "../../utils/gifs";

export default function Unauthorized() {
  const [gif, setGif] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
    setGif(randomGif);
    return () => {
      setGif("");
    };
  }, []);

  return (
    <div className="grid min-h-screen w-full place-items-center">
      <div className="flex flex-col gap-4 items-center max-w-2xl p-2">
        <img src="/logo_6am.png" alt="logo" />
        <img src={gif} alt="spy gif" />
        <h1>Unauthorized Access! 👁️🕵️</h1>
        <Button
          onClick={() => {
            navigate("/auth");
          }}
        >
          Take me back!
        </Button>
      </div>
    </div>
  );
}
