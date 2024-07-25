import React from "react";
import shaka from "shaka-player/dist/shaka-player.ui";

/**
 * A React component for shaka-player.
 * @param {string} src
 * @param {shaka.extern.PlayerConfiguration} config
 * @param {boolean} autoPlay
 * @param {number} width
 * @param {number} height
 * @param ref
 * @returns {*}
 * @constructor
 */
function ShakaPlayer(
	{ src, config, chromeless, className, timingObjRef, isStudent, ...rest },
	ref
) {
	const uiContainerRef = React.useRef(null);
	const videoRef = React.useRef(null);

	const [player, setPlayer] = React.useState(null);
	const [ui, setUi] = React.useState(null);

	// React.useEffect(() => {
	//   const intervalId = setInterval(() => {
	//     if (player) {
	//       const stats = player.getStats();

	//       console.log("Estimated buffer level (seconds):", stats);
	//     }
	//   }, 1000); // Log every 1000 milliseconds (1 second)

	//   return () => {
	//     clearInterval(intervalId); // Clean up the interval when the component unmounts
	//   };
	// }, [player]);
	// Only re-run the effect if the player instance changes

	// Effect to handle component mount & mount.
	// Not related to the src prop, this hook creates a shaka.Player instance.
	// This should always be the first effect to run.
	React.useEffect(() => {
		const player = new shaka.Player(videoRef.current);
		setPlayer(player);

		let ui;
		if (!chromeless) {
			const ui = new shaka.ui.Overlay(
				player,
				uiContainerRef.current,
				videoRef.current
			);
			setUi(ui);
		}

		return () => {
			player.destroy();
			if (ui) {
				ui.destroy();
			}
		};
	}, [chromeless]);

	// Keep shaka.Player.configure in sync.
	React.useEffect(() => {
		if (player && config) {
			player.configure(config);
		}
	}, [player, config]);

	// Load the source url when we have one.
	React.useEffect(() => {
		if (player && src) {
			player.load(src);
		}
	}, [player, src]);

	// Define a handle for easily referencing Shaka's player & ui API's.
	React.useImperativeHandle(
		ref,
		() => ({
			get player() {
				return player;
			},
			get ui() {
				return ui;
			},
			get uiContainer() {
				return uiContainerRef.current;
			},
			get videoElement() {
				return videoRef.current;
			},
		}),
		[player, ui]
	);

	const setVideoRef = (element) => {
		videoRef.current = element;

		if (timingObjRef.current && element !== null) {
			console.log("[DASH PLAYER] : mediaSync");
			MCorp.mediaSync(element, timingObjRef.current, {
				mode: "skip",
				debug: true,
				target: 0.5,
			});
		}
	};

	return (
		<div ref={uiContainerRef} className={className}>
			<video
				ref={setVideoRef}
				style={{
					maxWidth: "100%",
					width: "100%",
				}}
				{...rest}
			/>

			{!isStudent && (
				<div className={`absolute bottom-4 right-4 z-[1000]`}>
					<button
						className="bg-white text-black px-4 py-2 rounded-md"
						onClick={() => {
							// player.play();
							timingObjRef.current.update({ velocity: 1 });
						}}>
						Play
					</button>
					<button
						className="bg-white text-black px-4 py-2 rounded-md"
						onClick={() => {
							// player.pause();
							timingObjRef.current.update({ velocity: 0 });
						}}>
						Pause
					</button>
					<button
						className="bg-white text-black px-4 py-2 rounded-md"
						onClick={() => {
							// playerRef.current.seek(playerRef.current.time() - 10);
							timingObjRef.current.update({
								position:
									timingObjRef.current.query().position - 10,
							});
						}}>
						Seek -10
					</button>
					<button
						className="bg-white text-black px-4 py-2 rounded-md"
						onClick={() => {
							timingObjRef.current.update({
								position:
									timingObjRef.current.query().position + 10,
							});
						}}>
						Seek +10
					</button>
					<button
						className="bg-white text-black px-4 py-2 rounded-md"
						onClick={() => {
							timingObjRef.current.update({
								position: 0,
							});
						}}>
						Reset
					</button>
				</div>
			)}
		</div>
	);
}

export default React.memo(React.forwardRef(ShakaPlayer));
