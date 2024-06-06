import shaka from "shaka-player/dist/shaka-player.ui";
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
  console.log("Switching modes ==> Current mode: ", videoStore.viewMode);

  setViewMode(
    videoStore.viewMode === VIDEO_VIEW_STUDENT_MODE
      ? VIDEO_VIEW_TEACHING_MODE
      : VIDEO_VIEW_STUDENT_MODE
  );
};

export const handlePrevMarker = () => {
  // console.log("Prev Marker Clicked");
  const videoStore = useVideoStore.getState();
  const markers = videoStore.markers;
  const currentMarkerIdx = videoStore.currentMarkerIdx;

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
  const currentMarkerIdx = videoStore.currentMarkerIdx;

  console.log("Next Marker", markers.length);
  if (markers.length > 0) {
    const idx = (currentMarkerIdx || 0) + 1;

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

// -----
class ShakaPlayerGoNext extends shaka.ui.Element {
  constructor(parent, controls, eventHandler) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `<i class="fa-icons fa-solid fa-forward-step"></i>`;
    this.button_.title = "Next Video";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", eventHandler);
  }
}

ShakaPlayerGoNext.Factory = class {
  constructor(eventHandler) {
    this.eventHandler = eventHandler;
  }

  create(rootElement, controls) {
    return new ShakaPlayerGoNext(rootElement, controls, this.eventHandler);
  }
};

// -----

class ShakaPlayerGoPrev extends shaka.ui.Element {
  constructor(parent, controls, eventHandler) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `<i class="fa-icons fa-solid fa-backward-step"></i>`;
    this.button_.title = "Previous Video";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", eventHandler);
  }
}

ShakaPlayerGoPrev.Factory = class {
  constructor(eventHandler) {
    this.eventHandler = eventHandler;
  }

  create(rootElement, controls) {
    return new ShakaPlayerGoPrev(rootElement, controls, this.eventHandler);
  }
};

// -----

class ShakaPlayerGoSeekBackward extends shaka.ui.Element {
  constructor(parent, controls, eventHandler) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `<span><i class="fa-icons fa-solid fa-chevron-left"></i>5</span>`;
    this.button_.title = "Seek Backward 5s";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", eventHandler);
  }
}

ShakaPlayerGoSeekBackward.Factory = class {
  constructor(eventHandler) {
    this.eventHandler = eventHandler;
  }

  create(rootElement, controls) {
    return new ShakaPlayerGoSeekBackward(
      rootElement,
      controls,
      this.eventHandler
    );
  }
};

// -----

class ShakaPlayerGoSeekForward extends shaka.ui.Element {
  constructor(parent, controls, eventHandler) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `<span>5<i class="fa-icons fa-solid fa-chevron-right"></i></span>`;
    this.button_.title = "Seek Forward 5s";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", eventHandler);
  }
}

ShakaPlayerGoSeekForward.Factory = class {
  constructor(eventHandler) {
    this.eventHandler = eventHandler;
  }

  create(rootElement, controls) {
    return new ShakaPlayerGoSeekForward(
      rootElement,
      controls,
      this.eventHandler
    );
  }
};

class ShakaPlayerToggleMode extends shaka.ui.Element {
  constructor(parent, controls, eventHandler) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `
   <label class="custom-shaka-toggle-mode-label">
    <input type="checkbox" class="custom-shaka-toggle-mode"/>
    <span>
     <span class="custom-shaka-toggle-mode-teacher">
      Teacher
     </span>
     <span class="custom-shaka-toggle-mode-student">
      Student
     </span>
    </span>
   </label>
  `;
    this.button_.title = "Toggle Mode";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", eventHandler);

    this.unsub = useVideoStore.subscribe(
      (state) => state.viewMode,
      (viewMode, prevMode) => {
        console.log("View Mode Change : ", prevMode, "=>", viewMode);
        this.handleViewModeChange(viewMode);
      },
      { fireImmediately: true }
    );

    // this.handleViewModeChange(useVideoStore.getState().viewMode);
  }

  handleViewModeChange(viewMode) {
    if (viewMode === VIDEO_VIEW_STUDENT_MODE) {
      this.button_.querySelector(".custom-shaka-toggle-mode").checked = false;
    } else {
      this.button_.querySelector(".custom-shaka-toggle-mode").checked = true;
    }
  }

  enable() {
    this.button_.style.display = "block";
  }

  disable() {
    this.button_.style.display = "none";
  }
}

ShakaPlayerToggleMode.Factory = class {
  constructor() {
    this.eventHandler = handleToggleMode;
    this.element = null;
    this.enableElement = true;
  }

  enable() {
    if (this.element) {
      this.enableElement = true;
      this.element.enable();
    }
  }

  disable() {
    if (this.element) {
      this.enableElement = false;
      this.element.disable();
    }
  }

  create(rootElement, controls) {
    this.element = new ShakaPlayerToggleMode(
      rootElement,
      controls,
      this.eventHandler
    );
    return this.element;
  }
};

// ----------------------

class ShakaPlayerNextMarker extends shaka.ui.Element {
  constructor(parent, controls, eventHandler) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `
   <i class="fa-icons fa-solid fa-arrow-right-to-bracket"></i>
  `;
    this.button_.title = "Next Marker";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", eventHandler);
  }

  enable() {
    this.button_.style.display = "block";
  }

  disable() {
    this.button_.style.display = "none";
  }
}

ShakaPlayerNextMarker.Factory = class {
  constructor() {
    this.eventHandler = handleNextMarker;
    this.element = null;
    this.enableElement = true;
  }

  enable() {
    if (this.element) {
      this.enableElement = true;
      this.element.enable();
    }
  }

  disable() {
    if (this.element) {
      this.enableElement = false;
      this.element.disable();
    }
  }

  create(rootElement, controls) {
    this.element = new ShakaPlayerNextMarker(
      rootElement,
      controls,
      this.eventHandler
    );
    return this.element;
  }
};

// ------------------------------

class ShakaPlayerPrevMarker extends shaka.ui.Element {
  constructor(parent, controls, eventHandler) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `
   <i class="fa-icons fa-solid fa-arrow-right-to-bracket rotate-180"></i>
  `;
    this.button_.title = "Previous Marker";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", eventHandler);
  }

  enable() {
    this.button_.style.display = "block";
  }

  disable() {
    this.button_.style.display = "none";
  }
}

ShakaPlayerPrevMarker.Factory = class {
  constructor() {
    this.eventHandler = handlePrevMarker;
    this.element = null;
    this.enableElement = true;
  }

  enable() {
    if (this.element) {
      this.enableElement = true;
      this.element.enable();
    }
  }

  disable() {
    if (this.element) {
      this.enableElement = false;
      this.element.disable();
    }
  }

  create(rootElement, controls) {
    this.element = new ShakaPlayerPrevMarker(
      rootElement,
      controls,
      this.eventHandler
    );
    return this.element;
  }
};

const handleFullscreen = () => {
  const videoStore = useVideoStore.getState();
  console.log("Current Fullscreen State: ", videoStore.fullScreen);
  useVideoStore.setState({ fullScreen: !videoStore.fullScreen });

  if (videoStore.fullScreen) {
    document.exitFullscreen();
  } else {
    document.querySelector(".toplvlpage").requestFullscreen();
  }
  useVideoStore.setState({ fullScreen: !videoStore.fullScreen });
};

class ShakaPlayerFullscreen extends shaka.ui.Element {
  constructor(parent, controls) {
    super(parent, controls);

    // The actual button that will be displayed
    this.button_ = document.createElement("button");
    this.button_.innerHTML = `F`;
    this.button_.title = "Full Screen";

    this.parent.appendChild(this.button_);

    // Listen for clicks on the button to start the next playback
    this.eventManager.listen(this.button_, "click", handleFullscreen);
  }

  enable() {
    this.button_.style.display = "block";
  }

  disable() {
    this.button_.style.display = "none";
  }
}

ShakaPlayerFullscreen.Factory = class {
  constructor() {
    this.element = null;
    this.enableElement = true;
  }

  enable() {
    if (this.element) {
      this.enableElement = true;
      this.element.enable();
    }
  }

  disable() {
    if (this.element) {
      this.enableElement = false;
      this.element.disable();
    }
  }

  create(rootElement, controls) {
    this.element = new ShakaPlayerFullscreen(rootElement, controls);
    return this.element;
  }
};

// ------------------------------

const shakaPlayerToggleModeInstance = new ShakaPlayerToggleMode.Factory();

// ------------------------------

const shakaUIConfig = {
  enableTooltips: true,
  doubleClickForFullscreen: true,
  seekOnTaps: true,
  tapSeekDistance: 5,
  enableKeyboardPlaybackControls: true,
  enableFullscreenOnRotation: true,
  keyboardSeekDistance: 5,
  controlPanelElements: [
    "prev",
    "prev_marker",
    "seek_backward",
    "play_pause",
    "seek_forward",
    "next_marker",
    "next",
    "spacer",
    "mute",
    "volume",
    "time_and_duration",
    "toggle_mode",
    "custom_fullscreen",
  ],
  seekBarColors: {
    base: "#FFFFFF",
    buffered: "#DDDDDD",
    played: "#FFBF00",
  },
  fastForwardRates: [2, 4, 8, 1],
  rewindRates: [-1, -2, -4, -8],
};

const shakaStreamConfig = {
  streaming: {
    // maxDisabledTime: 0,
    // inaccurateManifestTolerance: 0,
    // lowLatencyMode: true,
    bufferingGoal: 10,
    bufferBehind: 20,
    rebufferingGoal: 4,
    ignoreTextStreamFailures: true,
    stallThreshold: 3,
    segmentPrefetchLimit: 3,
    preloadNextUrlWindow: 40,
    retryParameters: {
      maxAttempts: 3,
      timeout: 30000,
      connectionTimeout: 30000,
      stallTimeout: 15000,
    },
  },
};

export {
  ShakaPlayerFullscreen,
  ShakaPlayerGoNext,
  ShakaPlayerGoPrev,
  ShakaPlayerGoSeekBackward,
  ShakaPlayerGoSeekForward,
  ShakaPlayerNextMarker,
  ShakaPlayerPrevMarker,
  ShakaPlayerToggleMode,
  shakaPlayerToggleModeInstance,
  shakaStreamConfig,
  shakaUIConfig,
};
