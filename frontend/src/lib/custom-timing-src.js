const setCurrentTime = (mediaElement, newCurrentTime) => {
	mediaElement.currentTime = newCurrentTime;
};

const setPlaybackRate = (mediaElement, newPlaybackRate) => {
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

	if (position < 0) {
		if (currentTime > 0) {
			setCurrentTime(mediaElement, currentTime);
		}

		pause(mediaElement);
	} else if (position >= duration) {
		if (currentTime !== duration) {
			setCurrentTime(mediaElement, duration);
		}

		pause(mediaElement);
	} else if (currentTime !== position) {
		setCurrentTime(mediaElement, position);

		if (velocity !== 0) {
			if (playbackRate !== velocity) {
				setPlaybackRate(mediaElement, velocity);
			}

			play(mediaElement);
		} else {
			pause(mediaElement);
		}
	} else if (playbackRate !== velocity) {
		if (velocity !== 0) {
			setPlaybackRate(mediaElement, velocity);
			play(mediaElement);
		} else {
			pause(mediaElement);
		}
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
				position,
				velocity
			);
			console.log("[setTimingSrc] clearing interval, velocity <= 0");
			clearInterval(intervalId);
			intervalId = null;
			return;
		} else {
			if (intervalId === null) {
				console.log("[setTimingSrc] setting up interval");
				intervalId = setInterval(update, 100);
			}
		}

		updateMediaElement(
			mediaElement,
			mediaElement?.currentTime,
			mediaElement?.duration,
			mediaElement?.playbackRate,
			position,
			velocity
		);
	};

	const handleTimingObjectChange = (e) => {
		console.log("[setTimingSrc] handling change event", e?.detail);
		update(e?.detail);
	};

	console.log("[setTimingSrc] setting up interval");
	intervalId = setInterval(update, 100);

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
