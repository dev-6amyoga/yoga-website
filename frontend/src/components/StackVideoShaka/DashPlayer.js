import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import dashjs from "dashjs";

function DashPlayer({ src, config, className, ...rest }, ref) {
  const videoRef = useRef(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    const player = dashjs.MediaPlayer().create();
    setPlayer(player);

    player.initialize(videoRef.current, src, true, config);

    return () => {
      player.reset();
    };
  }, [src, config]);

  useImperativeHandle(
    ref,
    () => ({
      player: player,
      videoElement: videoRef.current,
    }),
    [player]
  );

  return (
    <div className={className}>
      <video ref={videoRef} {...rest}></video>
    </div>
  );
}

export default forwardRef(DashPlayer);
