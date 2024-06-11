import { SEEK_TYPE_MOVE } from "../enums/seek_types";
import {
	VIDEO_VIEW_STUDENT_MODE,
	VIDEO_VIEW_TEACHING_MODE,
} from "../enums/video_view_modes";
import usePlaylistStore from "../store/PlaylistStore";
import useVideoStore from "../store/VideoStore";

const globalVideoStore = useVideoStore.getState();
const setCurrentMarkerIdx = globalVideoStore.setCurrentMarkerIdx;
const addToSeekQueue = globalVideoStore.addToSeekQueue;
const setViewMode = globalVideoStore.setViewMode;

const globalPlaylistStore = usePlaylistStore.getState();
const popFromArchive = globalPlaylistStore.popFromArchive;
const popFromQueue = globalPlaylistStore.popFromQueue;

export const handleToggleMode = () => {
	const videoStore = useVideoStore.getState();
	console.log(
		"Switching modes ==> Current mode: ",
		videoStore.viewMode.value
	);

	setViewMode(
		videoStore.viewMode.value === VIDEO_VIEW_STUDENT_MODE
			? VIDEO_VIEW_TEACHING_MODE
			: VIDEO_VIEW_STUDENT_MODE
	);
};

export const handlePrevMarker = () => {
	// console.log("Prev Marker Clicked");
	const videoStore = useVideoStore.getState();
	const markers = videoStore.markers;
	const currentMarkerIdx = videoStore.currentMarkerIdx.value;

	console.log("Prev Marker", markers.length);
	if (markers.length > 0) {
		const idx = (currentMarkerIdx || 0) - 1;
		console.log("SETTING MARKER ID :", idx);
		if (idx <= 0) {
			setCurrentMarkerIdx(null);
			popFromArchive(-1);
			// console.log("end reached");
			return;
		}
		// seek to prev marker
		else {
			setCurrentMarkerIdx(idx);
			addToSeekQueue({
				t: markers[idx].timestamp,
				type: SEEK_TYPE_MOVE,
			});
			return;
		}
	}
};

export const handleNextMarker = () => {
	console.log("Next Marker Clicked");
	const videoStore = useVideoStore.getState();
	const markers = videoStore.markers;
	const currentMarkerIdx = videoStore.currentMarkerIdx.value;

	console.log("Next Marker", markers.length);
	if (markers.length > 0) {
		const idx = (currentMarkerIdx.value || 0) + 1;

		if (idx >= markers.length) {
			popFromQueue(0);
			// console.log("end reached");
			return;
		}

		console.log("SETTING MARKER ID :", idx);
		setCurrentMarkerIdx(idx);
		// seek to next marker
		addToSeekQueue({
			t: markers[idx].timestamp,
			type: SEEK_TYPE_MOVE,
		});
	}
};
