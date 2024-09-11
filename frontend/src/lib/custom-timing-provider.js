import {
	READYSTATE_CLOSED,
	READYSTATE_CLOSING,
	READYSTATE_INITIALIZED,
	READYSTATE_OPEN,
} from "../enums/timing_provider_readystate.js";

export class CustomTimingProvider extends EventTarget {
	#vector = {};
	#socket = null;

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
		super();
		this._class_id = String(class_id);
		this._user_id = String(user_id);

		this._skew = -1;

		this.startPosition = startPosition;
		this.endPosition = endPosition;

		this.readyStateStatus = READYSTATE_INITIALIZED;

		this.#socket = null;

		this.#vector = {
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

	get vector() {
		return this.#vector;
	}

	#handleSocketOpen = () => {
		console.log("[CustomTimingProvider] socket open", this);
		// handle the socket open event
		this.readyStateStatus = READYSTATE_OPEN;

		// send the initial vector to the server
		if (this.#socket) {
			this.#socket.send(
				JSON.stringify({
					type: "EVENT_TEACHER_INIT",
					class_id: this._class_id,
					user_id: this._user_id,
					start_position: this.startPosition,
					end_position: this.endPosition,
					data: {
						position: 0,
						velocity: 0,
						acceleration: 0,
					},
				})
			);
		}
	};

	#handleSocketMessage = (e) => {
		const eventData = JSON.parse(e.data);

		console.log("[CustomTimingProvider] event received : ", eventData.type);

		// handle the socket message event

		switch (eventData.type) {
			case "EVENT_TEACHER_INIT_RESPONSE":
				break;

			case "EVENT_TIMER_UPDATE_RESPONSE":
				this.#vector = eventData.data;

				// trigger the update event
				this.dispatchEvent(
					new CustomEvent("timeupdate", { detail: eventData.data })
				);
				break;

			case "EVENT_TIMER_QUERY_RESPONSE":
				break;

			case "EVENT_TIMER_TIMEUPDATE":
				this.#vector = eventData.data;

				// trigger the update event
				this.dispatchEvent(
					new CustomEvent("timeupdate", { detail: eventData.data })
				);
				console.log(
					performance.now(),
					"[CustomTimingProvider] timeupdate event dispatched"
				);
				break;

			default:
				console.error(
					"[CustomTimingProvider] Unknown message type:",
					eventData.type,
					eventData
				);
		}
	};

	#handleSocketClose = () => {
		// handle the socket close event
		this.readyStateStatus = READYSTATE_CLOSING;

		this.destroy();
		this.readyStateStatus = READYSTATE_CLOSED;
	};

	_init() {
		// initialize the timing provider
		// connect to the server
		this.#socket = new WebSocket("ws://localhost:4949/teacher/ws");

		this.#socket.addEventListener("open", this.#handleSocketOpen);
		this.#socket.addEventListener("message", this.#handleSocketMessage);
		this.#socket.addEventListener("close", this.#handleSocketClose);
	}

	destroy() {
		// destroy the timing provider
		this.#socket.removeEventListener("open", this.#handleSocketOpen);
		this.#socket.removeEventListener("message", this.#handleSocketMessage);
		this.#socket.removeEventListener("close", this.#handleSocketClose);

		if (this.#socket.readyState === WebSocket.OPEN) {
			this.#socket.close();
		}
		console.log("[CustomTimingProvider] destroyed");
	}

	query() {
		// return the current position, velocity, acceleration, and timestamp

		// send query to server
		if (this.#socket.readyState === WebSocket.OPEN) {
			this.#socket.send(
				JSON.stringify({
					type: "EVENT_TIME_QUERY",
				})
			);
		}

		// calculate the current position using the vector

		// return {
		// 	position: this.#position,
		// 	velocity: this.#velocity,
		// 	acceleration: this.#acceleration,
		// 	timestamp: this.#timestamp,
		// };
	}

	update(vector) {
		// TODO : should the local vector be updated here optimistically or
		// during a response from the server?

		// send update to server
		if (this.#socket.readyState === WebSocket.OPEN) {
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

			this.#socket.send(
				JSON.stringify({
					type: "EVENT_TIME_UPDATE",
					class_id: this._class_id,
					user_id: this._user_id,
					data: updatedVector,
				})
			);
		}

		this.#vector = {
			position: vector.position,
			velocity: vector.velocity,
			acceleration: vector.acceleration,
			timestamp: vector.timestamp,
		};
	}
}
