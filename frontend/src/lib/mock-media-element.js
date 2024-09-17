export class MockMediaElement {
	/*
    Mocks the HTMLMediaElement interface for testing purposes.
    * @param {number} duration
  */
	#currentTime;
	#duration;
	#playbackRate;
	#paused;

	constructor(duration) {
		this.#currentTime = 0;
		this.#duration = duration;
		this.#playbackRate = 1;
		this.#paused = true;
	}

	get currentTime() {
		return this.#currentTime;
	}

	set currentTime(time) {
		console.log("[MockMediaElement] set currentTime", time);
		this.#currentTime = time;
	}

	get duration() {
		return this.#duration;
	}

	get playbackRate() {
		return this.#playbackRate;
	}

	set playbackRate(rate) {
		this.#playbackRate = rate;
	}

	get paused() {
		return this.#paused;
	}

	play() {
		console.log("[MockMediaElement] play");
		this.#paused = false;
	}

	pause() {
		console.log("[MockMediaElement] pause");
		this.#paused = true;
	}
}
