import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import dashjs from "dashjs";

function DashPlayer({ src, config, className, ...rest }, ref) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const player = dashjs.MediaPlayer().create();
    playerRef.current = player;

    player.initialize(videoRef.current, null, true, config);

    if (src) {
      player.attachSource(src);
    }

    return () => {
      player.reset();
    };
  }, [src, config]);

  useImperativeHandle(
    ref,
    () => ({
      player: playerRef.current,
      videoElement: videoRef.current,
    }),
    []
  );

  return (
    <div className={className}>
      <video ref={videoRef} {...rest}></video>
    </div>
  );
}

export default forwardRef(DashPlayer);
