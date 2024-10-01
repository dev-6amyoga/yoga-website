const UPDATE_INTERVAL = 200;

const setCurrentTime = (mediaElement, newCurrentTime) => {
	console.log("[setTimingSrc] setting current time", {
		oldCurrentTime: mediaElement.currentTime,
		newCurrentTime,
	});
	mediaElement.currentTime = newCurrentTime;
};

const setPlaybackRate = (mediaElement, newPlaybackRate) => {
	console.log("[setTimingSrc] setting playback rate");
	mediaElement.playbackRate = newPlaybackRate;
};

const play = (mediaElement) => {
	if (mediaElement.paused) {
		console.log("[setTimingSrc] calling play");
		mediaElement.play();
	}
};

const pause = (mediaElement) => {
	if (!mediaElement.paused) {
		console.log("[setTimingSrc] calling pause");
		mediaElement.pause();
	}
};

// TODO : doesnt gradually shift
const updateMediaElement = (
	mediaElement,
	currentTime,
	duration,
	playbackRate,
	position,
	velocity
) => {
	console.log(
		"[updateMediaElement] currentTime",
		currentTime,
		"duration",
		duration,
		"playbackRate",
		playbackRate,
		"position",
		position,
		"velocity",
		velocity
	);

	if (velocity > 0) {
		if (playbackRate !== velocity) {
			setPlaybackRate(mediaElement, velocity);
		}
		play(mediaElement);
	} else if (currentTime !== duration) {
		pause(mediaElement);
	}

	if (position < 0) {
		console.log(">>> branch 1");
		if (currentTime > 0) {
			setCurrentTime(mediaElement, currentTime);
		}

		pause(mediaElement);
	} else if (
		duration !== undefined &&
		duration !== null &&
		position >= duration
	) {
		console.log(">>> branch 2");
		if (currentTime !== duration) {
			setCurrentTime(mediaElement, duration);
		}

		pause(mediaElement);
	} else if (Math.abs(currentTime - position) > 0.5) {
		console.log(">>> branch 3");
		setCurrentTime(mediaElement, position);
	}
};

const setTimingSrc = (mediaElement, timingObject) => {
	// need to latch onto timingObject and update mediaElement
	// stop updating when velocity is 0

	let unsubscribeFunctions = [];

	console.log("[setTimingSrc] starting interval");

	let intervalId = null;

	const update = (newVec = null) => {
		// query timingObject
		let vec = newVec;

		if (!vec) {
			console.log("[setTimingSrc] querying timingObject");
			vec = timingObject.query();
			console.log("[setTimingSrc] vec", vec);
		}

		const { position = null, velocity = null } = vec;

		if (position === null || velocity === null) {
			return;
		}

		if (velocity <= 0) {
			updateMediaElement(
				mediaElement,
				mediaElement?.currentTime,
				mediaElement?.duration,
				mediaElement?.playbackRate,
				position / 1000,
				velocity
			);
			console.log("[setTimingSrc] clearing interval, velocity <= 0");
			clearInterval(intervalId);
			intervalId = null;
			return;
		} else {
			if (intervalId === null) {
				console.log("[setTimingSrc] setting up interval");
				intervalId = setInterval(update, UPDATE_INTERVAL);
			}
		}

		updateMediaElement(
			mediaElement,
			mediaElement?.currentTime,
			mediaElement?.duration,
			mediaElement?.playbackRate,
			position / 1000,
			velocity
		);
	};

	const handleTimingObjectChange = (e) => {
		console.log("[setTimingSrc] handling change event", e?.detail);
		update(e?.detail);
	};

	console.log("[setTimingSrc] setting up interval");
	intervalId = setInterval(update, UPDATE_INTERVAL);

	console.log("[setTimingSrc] listening to change event");
	timingObject.addEventListener("change", handleTimingObjectChange);

	unsubscribeFunctions.push(() => {
		console.log("[setTimingSrc] clearing interval");
		clearInterval(intervalId);
	});

	unsubscribeFunctions.push(() => {
		console.log("[setTimingSrc] removing event listener for change event");
		timingObject.removeEventListener("change", handleTimingObjectChange);
	});

	return () => {
		console.log("[setTimingSrc] unsubscribe called on setTimingSrc");
		unsubscribeFunctions.forEach((unsubscribe) => {
			unsubscribe();
		});
	};
};

export default setTimingSrc;
