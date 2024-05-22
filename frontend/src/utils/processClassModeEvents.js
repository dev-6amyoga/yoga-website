import {
	EVENT_CONTROLS,
	EVENT_CONTROLS_NEXT,
	EVENT_CONTROLS_PAUSE,
	EVENT_CONTROLS_PLAY,
	EVENT_CONTROLS_PREV,
	EVENT_CONTROLS_SEEK_MARKER,
	EVENT_CONTROLS_SEEK_TO,
	EVENT_QUEUE,
	EVENT_QUEUE_CLEAR,
	EVENT_QUEUE_POP,
	EVENT_QUEUE_PUSH,
} from "../enums/class_mode_events";

export const processClassModeQueueEvents = (events) => {
	/*
        Input : array of events
        Output : state of queue
    */

	try {
		let queue = [];

		events.forEach((e) => {
			const { class_id, type, data } = e;

			const { subtype, data: subtypeData } = data;

			switch (type) {
				case EVENT_QUEUE:
					switch (subtype) {
						case EVENT_QUEUE_PUSH:
							queue.push(subtypeData);
							break;
						case EVENT_QUEUE_POP:
							queue.pop();
							break;
						case EVENT_QUEUE_CLEAR:
							queue.splice(0, queue.length);
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		});

		return queue;
	} catch (error) {
		console.error(`Error processing class mode queue events: ${error}`);
		return null;
	}
};

export const processClassModeControlsEvents = (events) => {
	/*
        Input : array of events
        Output : state of controls
    */

	try {
		let controls = {
			play: false,
			seekQueue: [],
		};

		events.forEach((e) => {
			const { class_id, ztype, data } = e;

			const { subtype, data: subtypeData } = data;

			switch (type) {
				case EVENT_CONTROLS:
					switch (subtype) {
						case EVENT_CONTROLS_PLAY:
						case EVENT_CONTROLS_PAUSE:
							break;
						case EVENT_CONTROLS_NEXT:
						case EVENT_CONTROLS_PREV:
							break;
						case EVENT_CONTROLS_SEEK_TO:
						case EVENT_CONTROLS_SEEK_MARKER:
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
		});

		return controls;
	} catch (error) {
		console.error(`Error processing class mode controls events: ${error}`);
		return null;
	}
};
