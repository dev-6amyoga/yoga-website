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
function ShakaPlayer({ src, config, chromeless, className, ...rest }, ref) {
	console.log("[ShakaPlayer] Props passed to ShakaPlayer:", {
		src,
		config,
		chromeless,
		className,
		rest,
	});

	const uiContainerRef = React.useRef(null);
	const videoRef = React.useRef(null);
	const storageRef = React.useRef(null);

	const [contentList, setContentList] = React.useState([]);
	const [downloadProgress, setDownloadProgress] = React.useState(0);

	const [player, setPlayer] = React.useState(null);
	const [ui, setUi] = React.useState(null);

	// Effect to handle component mount & mount.
	// Not related to the src prop, this hook creates a shaka.Player instance.
	// This should always be the first effect to run.
	React.useEffect(() => {
		const player = new shaka.Player(videoRef.current);
		setPlayer(player);
		console.log("HELLO THIS IS PLAYER!!!");

		let ui;

		if (!chromeless) {
			const ui = new shaka.ui.Overlay(
				player,
				uiContainerRef.current,
				videoRef.current
			);
			setUi(ui);
		}

		// setup player storage
		console.log("[ShakaPlayer] Setting up storage");
		const storage = new shaka.offline.Storage(player);

		storageRef.current = storage;

		return () => {
			player.destroy();
			if (ui) {
				ui.destroy();
			}
			if (storage) {
				storage.destroy();
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
			console.log("url is : ", src);
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

			get storage() {
				return storageRef.current;
			},
		}),
		[player, ui]
	);

	return (
		<div ref={uiContainerRef} className={className}>
			<video
				ref={videoRef}
				style={{
					maxWidth: "100%",
					width: "100%",
				}}
				{...rest}
			/>
		</div>
	);
}

export default React.memo(React.forwardRef(ShakaPlayer));
