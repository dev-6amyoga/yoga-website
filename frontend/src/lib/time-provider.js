// class TimingObject extends EventTarget {
// 	constructor(vector, startPosition, endPosition) {}

//     constructor(timingProvider) {

//     }

// 	on(eventType, callback) {
// 		this.addEventListener(eventType, callback);
// 	}

// 	off(eventType, callback) {
// 		this.removeEventListener(eventType, callback);
// 	}
// }

class TimingProvider {
	constructor(startPosition = null, endPosition = null) {
		this._startPosition = startPosition;
		this._endPosition = endPosition;

		this._position = 0;
		this._velocity = 0;
		this._acceleration = 0;
		this._timestamp = 0;
		this.readyState = "";
		this._skew = 0;

		this.lastPosition = 0;
		this.lastVelocity = 0;
		this.lastAcceleration = 0;
		this.lastTimestamp = 0;
		this.lastReadyState = 0;

		this.lastUpdateTime = 0;
	}

	get vector() {
		return {
			position: this._position,
			velocity: this._velocity,
			acceleration: this._acceleration,
			timestamp: this._timestamp,
		};
	}

	get skew() {
		return this._skew;
	}

	get readyState() {
		return this.readyState;
	}

	update() {}

	run() {
		// connect to backend
		// get timer data
		// set it
		// update the events
	}
}
