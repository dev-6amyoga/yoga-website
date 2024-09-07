const setCurrentTime = (mediaElement, newCurrentTime) => {
	mediaElement.currentTime = newCurrentTime;
};

const setPlaybackRate = (mediaElement, newPlaybackRate) => {
	mediaElement.playbackRate = newPlaybackRate;
};

const play = (mediaElement) => {
	mediaElement.play();
};

const pause = (mediaElement) => {
	mediaElement.pause();
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

	const update = (newVec) => {
		// query timingObject
		let vec = newVec;

		if (!vec) {
			vec = timingObject.query();
		}

		if (newVec === null) {
			return;
		}

		const { position, velocity } = newVec;

		if (position === null || velocity === null) {
			return;
		}

		if (velocity <= 0) {
			clearInterval(intervalId);
			intervalId = null;
			return;
		} else {
			if (intervalId === null) {
				intervalId = setInterval(update, 100);
			}
		}

		updateMediaElement(
			mediaElement,
			mediaElement.currentTime,
			mediaElement.duration,
			mediaElement.playbackRate,
			position,
			velocity
		);
	};

	const handleTimingObjectChange = (e) => {
		update(e.detail);
	};

	intervalId = setInterval(update, 100);

	timingObject.addEventListener("change", handleTimingObjectChange);

	unsubscribeFunctions.push(() => {
		console.log("[setTimingSrc] clearing interval");
		clearInterval(intervalId);
	});

	unsubscribeFunctions.push(() => {
		timingObject.removeEventListener("change", handleTimingObjectChange);
	});

	return () => {
		unsubscribeFunctions.forEach((unsubscribe) => {
			unsubscribe();
		});
	};
};

export default setTimingSrc;
