class CustomTimingProvider {
	constructor({
		position = 0,
		velocity = 0,
		skew = 0,
		range = [-Infinity, Infinity],
	}) {
		this._skew = skew;
		this._velocity = velocity;
		this._position = position;
		this._timestamp = Date.now();

		this._range = range;

		this._lastUpdate = 0;
		this._lastPosition = 0;
		this._lastVelocity = 1;
		this._lastSkew = 0;
	}

	get skew() {
		return this._skew;
	}

	get velocity() {
		return this._velocity;
	}

	get position() {
		return this._position;
	}

	get timestamp() {
		return this._timestamp;
	}

	query() {
		return {
			position: this._position,
			velocity: this._velocity,
			skew: this._skew,
			timestamp: this._timestamp,
		};
	}

	update({
		position = this._position,
		velocity = this._velocity,
		skew = this._skew,
		timestamp = this._timestamp,
	}) {
		this._position = position;
		this._velocity = velocity;
		this._skew = skew;
		this._timestamp = timestamp;

		// send update to server
	}
}
