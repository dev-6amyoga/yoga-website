import { READYSTATE_INITIALIZED } from "../enums/timing_provider_readystate";

export class CustomTimingObject extends EventTarget {
	constructor(timingProvider) {
		super();

		this.timingProvider = timingProvider;
		this.readyState = READYSTATE_INITIALIZED;
		this._vector = {};

		this.#init();
	}

	get vector() {
		return this._vector;
	}

	get startPosition() {
		return this.timingProvider?.startPosition;
	}

	get endPosition() {
		return this.timingProvider?.endPosition;
	}

	set vector(vector) {
		this._vector = vector;
		this.dispatchEvent(new CustomEvent("change"), { detail: vector });
	}

	#handleTimingProviderChange = (e) => {
		this.vector = e.detail;
		this.dispatchEvent(new CustomEvent("change", { detail: e.detail }));
		console.log(
			performance.now(),
			"[CustomTimingObject] change event dispatched"
		);
	};

	#handleTimingProviderTimeUpdate = (e) => {
		this.dispatchEvent(new CustomEvent("timeupdate", { detail: e.detail }));
		console.log(
			performance.now(),
			"[CustomTimingObject] timeupdate event dispatched"
		);
	};

	#init() {
		// setup event listeners
		console.log(
			"[CustomTimingObject] initializing, setting up event listeners"
		);

		this.timingProvider.addEventListener(
			"change",
			this.#handleTimingProviderChange
		);
		this.timingProvider.addEventListener(
			"timeupdate",
			this.#handleTimingProviderTimeUpdate
		);

		this.vector = this.timingProvider.query();
	}

	query() {
		// TODO : query the timing provider or return the vector
		console.log("[CustomTimingObject] query");
		return this.vector;
	}

	update(updates) {
		// send update to the timing provider
		// can have position (and/or) velocity (and/or) acceleration
		console.log(
			"[CustomTimingObject] sending update to timing provider",
			updates
		);
		this.timingProvider.update(updates);
	}

	destroy() {
		// destroy the timing provider
		console.log(
			"[CustomTimingObject] destroying, removing event listeners"
		);
		this.timingProvider.removeEventListener(
			"change",
			this.#handleTimingProviderChange
		);
		this.timingProvider.removeEventListener(
			"timeupdate",
			this.#handleTimingProviderTimeUpdate
		);
	}
}
