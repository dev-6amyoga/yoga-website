import dashjs from "dashjs";
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

function DashPlayer({ src, onMetadataLoaded, className, ...rest }, ref) {
	const videoRef = useRef(null);
	const [playerRefSet, setPlayerRefSet] = useState(false);
	const playerRef = useRef(null);

	useEffect(() => {
		console.log("[DASH PLAYER] : setup");
		const p = dashjs.MediaPlayer().create();
		playerRef.current = p;
		setPlayerRefSet(true);

		return () => {
			console.log("[DASH PLAYER] Cleanup, player reset");
			p.reset();
		};
	}, [setPlayerRefSet]);

	useEffect(() => {
		console.log(
			"[DASH PLAYER] : playerRef",
			playerRef.current,
			playerRefSet
		);

		if (playerRefSet && src && videoRef.current) {
			playerRef.current.on(
				dashjs.MediaPlayer.events.CAN_PLAY_THROUGH,
				onMetadataLoaded
			);
			playerRef.current.initialize(videoRef.current, src, true);
		}
	}, [playerRefSet, src]);

	useImperativeHandle(
		ref,
		() => {
			console.log("[DASH PLAYER] : ref");
			return {
				get player() {
					return playerRef.current;
				},
				get videoElement() {
					return videoRef.current;
				},
				get videoUrl() {
					try {
						return playerRef.current.getSource();
					} catch (error) {
						return null;
					}
				},
				set videoUrl(url) {
					if (playerRef.current === null) {
						return;
					}

					// playerRef.current.setSource(url);
					// playerRef.current.player.initialize();
				},
			};
		},
		[playerRefSet]
	);

	const setVideoRef = useCallback(
		(element) => {
			// console.log("[DASH PLAYER] : setVideoRef", element);
			if (element !== null) {
				videoRef.current = element;
				if (playerRefSet) {
					// playerRef.current.attachView(element);
				}
			}
		},
		[playerRefSet]
	);

	return (
		<div className={className}>
			<video ref={setVideoRef} {...rest}></video>
		</div>
	);
}

export default forwardRef(DashPlayer);
