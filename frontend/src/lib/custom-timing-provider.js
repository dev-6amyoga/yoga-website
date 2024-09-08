import {
	READYSTATE_CLOSED,
	READYSTATE_CLOSING,
	READYSTATE_INITIALIZED,
	READYSTATE_OPEN,
} from "../enums/timing_provider_readystate.js";

export class CustomTimingProvider extends EventTarget {
	constructor(
		class_id,
		user_id,
		{
			position = 0,
			velocity = 0,
			acceleration = 0,
			timestamp = Date.now(),
		},
		startPosition,
		endPosition
	) {
		this._class_id = class_id;
		this._user_id = user_id;

		this._skew = skew;

		this.startPosition = startPosition;
		this.endPosition = endPosition;

		this.readyState = READYSTATE_INITIALIZED;

		this._socket = null;

		this._vector = {
			position,
			velocity,
			acceleration,
			timestamp: timestamp,
		};

		this._init();
	}

	get skew() {
		return this._skew;
	}

	get startPosition() {
		return this.startPosition;
	}

	get endPosition() {
		return this.endPosition;
	}

	_handleSocketOpen() {
		// handle the socket open event
		this.readyState = READYSTATE_OPEN;

		// send the initial vector to the server
		this._socket.send(
			JSON.stringify({
				type: "EVENT_TEACHER_INIT",
				class_id: this._class_id,
				user_id: this._user_id,
				start_position: 0,
				end_position: 0,
				data: {
					position: 0,
					velocity: 0,
					acceleration: 0,
				},
			})
		);
	}

	_handleSocketMessage(e) {
		const eventData = JSON.parse(e.data);

		// handle the socket message event

		switch (eventData.type) {
			case "EVENT_TEACHER_INIT_RESPONSE":
				break;

			case "EVENT_TIMER_UPDATE_RESPONSE":
				this._position = eventData.data.position;
				this._velocity = eventData.data.velocity;
				this._acceleration = eventData.data.acceleration;
				this._timestamp = eventData.data.timestamp;

				// trigger the update event
				this.dispatchEvent(
					new CustomEvent("timeupdate", { detail: eventData.data })
				);
				break;

			case "EVENT_TIMER_QUERY_RESPONSE":
				break;

			case "EVENT_TIMER_TIMEUPDATE":
				this._position = eventData.data.position;
				this._velocity = eventData.data.velocity;
				this._acceleration = eventData.data.acceleration;
				this._timestamp = eventData.data.timestamp;

				// trigger the update event
				this.dispatchEvent(
					new CustomEvent("timeupdate", { detail: eventData.data })
				);
				break;

			default:
				console.error(
					"[CustomTimingProvider] Unknown message type:",
					eventData.type,
					eventData
				);
		}
	}

	_handleSocketClose() {
		// handle the socket close event
		this.readyState = READYSTATE_CLOSING;

		this._destroy();
		this.readyState = READYSTATE_CLOSED;
	}

	_init() {
		// initialize the timing provider
		// connect to the server
		this._socket = new WebSocket("ws://localhost:4949/");

		this._socket.addEventListener("open", this._handleSocketOpen);
		this._socket.addEventListener("message", this._handleSocketMessage);
		this._socket.addEventListener("close", this._handleSocketClose);
	}

	_destroy() {
		// destroy the timing provider
		this._socket.removeEventListener("open", this._handleSocketOpen);
		this._socket.removeEventListener("message", this._handleSocketMessage);
		this._socket.removeEventListener("close", this._handleSocketClose);

		if (this._socket.readyState === WebSocket.OPEN) {
			this._socket.close();
		}
	}

	query() {
		// return the current position, velocity, acceleration, and timestamp

		// send query to server
		if (this._socket.readyState === WebSocket.OPEN) {
			this._socket.send(
				JSON.stringify({
					type: "EVENT_TIME_QUERY",
				})
			);
		}

		// calculate the current position using the vector

		// return {
		// 	position: this._position,
		// 	velocity: this._velocity,
		// 	acceleration: this._acceleration,
		// 	timestamp: this._timestamp,
		// };
	}

	update(vector) {
		// TODO : should the local vector be updated here optimistically or
		// during a response from the server?

		// send update to server
		if (this._socket.readyState === WebSocket.OPEN) {
			updatedVector = {};

			if (vector?.position) {
				updatedVector.position = vector.position;
			} else if (vector?.velocity) {
				updatedVector.velocity = vector.velocity;
			} else if (vector?.acceleration) {
				updatedVector.acceleration = vector.acceleration;
			} else {
				console.error(
					"[CustomTimingProvider] Invalid vector update:",
					vector
				);
				return;
			}

			this._socket.send(
				JSON.stringify({
					type: "EVENT_TIME_UPDATE",
					class_id: this._class_id,
					user_id: this._user_id,
					data: updatedVector,
				})
			);
		}

		this._vector = {
			position: vector.position,
			velocity: vector.velocity,
			acceleration: vector.acceleration,
			timestamp: vector.timestamp,
		};
	}
}
