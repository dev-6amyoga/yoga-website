import { READYSTATE_INITIALIZED } from "../enums/timing_provider_readystate";

export class CustomTimingObject extends EventTarget {
	constructor(timingProvider) {
		super();

		this.timingProvider = timingProvider;
		this.readyState = READYSTATE_INITIALIZED;
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
		this.dispatchEvent(new CustomEvent("change"));
	}

	_init() {
		this.timingProvider.addEventListener("change", () => {
			this.vector = this.timingProvider.vector;
		});
	}

	query() {
		// query the timing provider
	}

	update() {
		// update the timing provider
	}

	destroy() {
		// destroy the timing provider
		this.timingProvider.removeEventListener("change");
	}
}
