import React from "react";
import shaka from "shaka-player/dist/shaka-player.ui";
import ShakaOfflineStore from "../../lib/offline-storage";
import useShakaOfflineStore from "../../store/ShakaOfflineStore";
import useVideoStore from "../../store/VideoStore";
import { browser, detectBrowser } from "../../utils/browser";
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
	const uiContainerRef = React.useRef(null);
	const videoRef = React.useRef(null);

	const [setShakaOfflineStore, setDownloadProgress, setOfflineSupported] =
		useShakaOfflineStore((state) => [
			state.setShakaOfflineStore,
			state.setDownloadProgress,
			state.setOfflineSupported,
		]);

	const [setShakaSupported] = useVideoStore((state) => [
		state.setShakaSupported,
	]);

	const [player, setPlayer] = React.useState(null);
	const [ui, setUi] = React.useState(null);

	// Effect to handle component mount & mount.
	// Not related to the src prop, this hook creates a shaka.Player instance.
	// This should always be the first effect to run.
	React.useEffect(() => {
		if (!shaka.Player.isBrowserSupported()) {
			console.error("[ShakaPlayer] Browser not supported");

			return;
		} else {
			console.log("[ShakaPlayer] Browser supported");

			if (!shaka.offline.Storage.support()) {
				console.error("[ShakaPlayer] Offline storage not supported");
				setOfflineSupported(false);
			} else {
				console.log("[ShakaPlayer] Offline storage supported");
			}
		}

		const detectedBrowser = detectBrowser();

		try {
			if (detectedBrowser == browser.safari) {
				console.log("[ShakaPlayer] Installing polyfills for Fairplay");

				shaka.polyfill.PatchedMediaKeysApple.install();

				console.log("[ShakaPlayer] Installed polyfills for Fairplay");
			}
		} catch (e) {
			console.error(
				"[ShakaPlayer] Error installing polyfills for Fairplay",
				e
			);
		}

		const player = new shaka.Player(videoRef.current);

		// console.log("HELLO THIS IS PLAYER!!!");
		// await ShakaOfflineStore.deleteAll();

		let ui;

		if (!chromeless) {
			const ui = new shaka.ui.Overlay(
				player,
				uiContainerRef.current,
				videoRef.current
			);
		}

		// setup player storage
		console.log("[ShakaPlayer] Setting up storage");
		const storage = new shaka.offline.Storage(player);

		// TODO : remove reset of storage
		// shaka.offline.Storage.deleteAll()
		// 	.then((res) => {
		// 		console.log("All content deleted", res);
		// 	})
		// 	.catch((err) => {
		// 		console.error("Error deleting all content", err);
		// 	});

		const shakaOfflineStore = new ShakaOfflineStore(
			storage,
			(content, progress) => {
				setDownloadProgress(progress);
			}
		);
		setShakaOfflineStore(shakaOfflineStore);
		setPlayer(player);
		setUi(ui);

		// const content = await storage.store("test:sintel").promise;
		// expect(content).toBeTruthy();

		//   const contentUri = content.offlineUri;
		//   goog.asserts.assert(
		//     contentUri != null,
		//     "Stored content should have an offline uri."
		//   );

		//   await player.load(contentUri);

		return () => {
			console.log("[ShakaPlayer] Cleaning up ShakaPlayer");
			player.destroy();
			if (ui) {
				console.log("[ShakaPlayer] Cleaning up UI");
				ui.destroy();
			}
			if (shakaOfflineStore) {
				console.log(
					"[ShakaPlayer] Cleaning up ShakaPlayerOfflineStore"
				);
				shakaOfflineStore.destroy();
			}
		};
	}, [chromeless, setDownloadProgress, setPlayer, setShakaOfflineStore]);

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
