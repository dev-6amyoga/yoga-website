import {
	createEffect,
	createMemo,
	createRenderEffect,
	createSignal,
	on,
	onCleanup,
} from "solid-js";
import { SEEK_TYPE_MOVE } from "../../enums/seek_types";
import { usePlaylistStoreContext } from "../../store/PlaylistStore";
import {
	STATE_VIDEO_ERROR,
	STATE_VIDEO_LOADING,
	useVideoStoreContext,
} from "../../store/VideoStore";
import VideoControls from "./VideoControls";

function draggable(el, value) {
	const { onDragStart, onDrag, onDragEnd, bounds } = value();
	let active = false;
	let targetBounds = null;
	let dragBounds = null;

	const calcData = (e) => {
		let data = {
			clientX: e.clientX,
			clientY: e.clientY,
			offsetX: e.clientX - dragBounds.left,
			offsetY: e.clientY - dragBounds.top,
			max: dragBounds.width - targetBounds.width / 2,
			min: 0,
		};

		if (bounds === "parent") {
			if (e.clientX < dragBounds.left) {
				data.clientX = dragBounds.left;
				data.offsetX = 0;
			}
			if (e.clientX > dragBounds.right - targetBounds.width / 2) {
				data.clientX = dragBounds.right;
				data.offsetX = dragBounds.width - targetBounds.width / 2;
			}

			if (e.clientY < dragBounds.top) {
				data.clientY = dragBounds.top;
				data.offsetY = 0;
			}
			if (e.clientY > dragBounds.bottom) {
				data.clientY = dragBounds.bottom;
				data.offsetY = dragBounds.height;
			}
		}

		return data;
	};

	const handlePointerDown = (e) => {
		targetBounds = el.getBoundingClientRect();

		if (bounds === "parent") {
			dragBounds = el.parentNode.getBoundingClientRect();
			el.parentNode.style["user-select"] = "none";
			el.style["user-select"] = "none";
			// console.log({ dragBounds });
		}

		// console.log(
		// 	e.clientX,
		// 	e.clientY,
		// 	targetBounds,
		// 	e.clientX > targetBounds.left,
		// 	e.clientX < targetBounds.right,
		// 	e.clientY > targetBounds.top,
		// 	e.clientY < targetBounds.bottom
		// );

		if (
			e.clientX > targetBounds.left &&
			e.clientX < targetBounds.right &&
			e.clientY > targetBounds.top &&
			e.clientY < targetBounds.bottom
		) {
			console.log("ACTIVE");
			active = true;
			if (onDragStart) onDragStart();
		}
	};

	const handlePointerUp = (e) => {
		if (active) {
			active = false;
			console.log("INACTIVE");
			el.parentNode.style["user-select"] = "auto";
			el.style["user-select"] = "auto";

			let data = calcData(e);

			if (onDragEnd) onDragEnd(data);
		}
	};

	const handlePointerMove = (e) => {
		if (!active) {
			return;
		}

		let data = calcData(e);

		if (onDrag) onDrag(data);
	};

	const handleResize = () => {
		targetBounds = el.getBoundingClientRect();
		if (bounds === "parent") {
			dragBounds = el.parentNode.getBoundingClientRect();
		}
	};

	createRenderEffect(() => {
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("pointerup", handlePointerUp);
		document.addEventListener("pointermove", handlePointerMove);

		window.addEventListener("resize", handleResize);

		onCleanup(() => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("pointerup", handlePointerUp);
			document.removeEventListener("pointermove", handlePointerMove);

			window.removeEventListener("resize", handleResize);
		});
	});
}

/*
	playbarVisible,
	duration,
	draggableHandle,
	toTimeString,
	props.handleSetPlay,
	props.handleSetPause,
	props.handleFullScreen,
*/

export default function VideoPlaybar(props) {
	const [
		videoStore,
		{
			addToSeekQueue,
			setCurrentTime,
			setCurrentMarkerIdx,
			setVideoState,
			setPauseReason,
			setVideoEvent,
		},
	] = useVideoStoreContext();

	const [playlistStore, { popFromQueue }] = usePlaylistStoreContext();

	let popTimeout = null;
	let barRef = null;
	let draggableHandle = null;

	const [mouseDown, setMouseDown] = createSignal(false);
	const [barBound, setBarBound] = createSignal({
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
	});
	const [options, setOptions] = createSignal({
		axis: "x",
		bounds: "parent",
	});

	const [currentBoopPosition, setCurrentBoopPosition] = createSignal(0);

	createEffect(
		on([() => videoStore.currentVideo], () => {
			setCurrentTime(0);
		})
	);

	// const prevNextMarkers = createMemo(
	// 	on(
	// 		[() => videoStore.currentMarkerIdx, () => videoStore.markers],
	// 		() => {
	// 			console.log(
	// 				"CURRENT IDX CHANGED, SETTING PREV NEXT MARKERS",
	// 				videoStore.currentMarkerIdx
	// 			);
	// 			if (
	// 				videoStore.currentMarkerIdx === null ||
	// 				!videoStore.markers ||
	// 				videoStore.markers.length === 0
	// 			) {
	// 				return [null, null];
	// 			}

	// 			if (
	// 				videoStore.currentMarkerIdx ===
	// 				videoStore.markers.length - 1
	// 			) {
	// 				return [
	// 					videoStore.markers[videoStore.currentMarkerIdx],
	// 					null,
	// 				];
	// 			}

	// 			return [
	// 				videoStore.markers[videoStore.currentMarkerIdx],
	// 				videoStore.markers[videoStore.currentMarkerIdx + 1],
	// 			];
	// 		}
	// 	)
	// );

	// jugaad : if the video is less than 10 seconds, pop it from queue after 7.5 seconds
	// check if the current time is past the marker, set the current marker index / go back to start of marker
	// FIX :
	/*useEffect([currentVideo, props.duration, popFromQueue, currentTime], () => {
		if (
			currentVideo &&
			props.duration > 0 &&
			props.duration < 10 &&
			currentTime >= 7.5
		) {
			popTimeout = setTimeout(() => {
				console.log("Popping from queue");
				popFromQueue(0);
			}, 60);
		}

		// console.log(viewMode.value, currentTime, prevNextMarkers);
		// 0 : cur marker, 1 : next marker
		onCleanup(() => {
			if (popTimeout) {
				clearTimeout(popTimeout);
			}
		});
	});
	*/

	// useEffect(
	//	() => {
	// console.log(
	//     videoEvent,
	//     currentTime,
	//     prevNextMarkers[0],
	//     prevNextMarkers[1]
	// )
	// if (
	//     videoEvent &&
	//     videoEvent?.type === VIDEO_EVENT_MOVING_MARKER &&
	//     Math.abs(currentTime - markers[videoEvent?.markerIdx].timestamp) < 1
	// ) {
	//     console.log('SETTING CURRENT IDX --->', videoEvent?.markerIdx || 0)
	//     setCurrentMarkerIdx(videoEvent?.markerIdx || 0)
	//     console.log('VIDEO EVENT --->', null)
	//     setVideoEvent(null)
	//     return
	// }
	// if (videoEvent?.type !== VIDEO_EVENT_MOVING_MARKER) {
	//     if (
	//         prevNextMarkers[1] &&
	//         currentTime >= prevNextMarkers[1].timestamp
	//     ) {
	//         if (viewMode.value === VIDEO_VIEW_STUDENT_MODE) {
	//             setCurrentMarkerIdx(
	//                 videoStore.currentMarkerIdx + 1 > markers.length - 1
	//                     ? 0
	//                     : videoStore.currentMarkerIdx + 1
	//             )
	//         } else {
	//             // if in teaching mode, then go to start of current marker
	//             if (prevNextMarkers[0] && prevNextMarkers[0]?.loop) {
	//                 addToSeekQueue({
	//                     t: prevNextMarkers[0].timestamp,
	//                     type: SEEK_TYPE_MOVE,
	//                 })
	//             } else if (
	//                 prevNextMarkers[0] &&
	//                 !prevNextMarkers[0]?.loop
	//             ) {
	//                 console.log(
	//                     "SETTING PAUSE REASON TO 'VIDEO_PAUSE_MARKER'"
	//                 )
	//                 setVideoState(STATE_VIDEO_PAUSED)
	//                 setPauseReason(VIDEO_PAUSE_MARKER)
	//             }
	//         }
	//     }
	// }
	// },
	// [
	// setVideoEvent,
	// videoEvent,
	// currentTime,
	// setVideoState,
	// prevNextMarkers,
	// viewMode.value,
	// markers,
	// videoStore.currentMarkerIdx,
	// setCurrentMarkerIdx,
	// addToSeekQueue,
	// setPauseReason,
	//	]
	//);

	const handleSetBarBounds = () => {
		if (barRef) {
			const bounds = barRef.getBoundingClientRect();
			console.log("[VIDEO PLAYBAR] BOUNDS : ", bounds);
			setBarBound({
				top: bounds.top,
				bottom: bounds.bottom,
				left: bounds.left,
				right: bounds.right,
				width: bounds.width,
				height: bounds.height,
			});
		}
	};

	// set bar bounds on mount
	createEffect(
		on([() => videoStore.fullScreen], () => {
			handleSetBarBounds();

			window.addEventListener("resize", handleSetBarBounds);

			onCleanup(() => {
				window.removeEventListener("resize", handleSetBarBounds);
			});
		})
	);

	const moveToTimestamp = (t) => {
		// console.log("MOVING BY ", t - currentTime);
		addToSeekQueue({ t, type: SEEK_TYPE_MOVE });
	};

	// set the current position of the boop
	createEffect(
		on([() => videoStore.currentTime, barBound, props.duration], () => {
			const pos =
				barBound().width * (videoStore.currentTime / props.duration());
			// console.log("[EVENT] setting boop pos: ", pos);
			setCurrentBoopPosition(pos);
		})
	);

	// set bar bounds on fullscreen change
	// createEffect(() => {
	//	handleSetBarBounds();
	// }, [props.handleFullScreen?.active]);

	const seekOnClick = (e, location) => {
		if (location === "barclick") {
			const bounds = barBound();
			const t =
				(props.duration() * (e.clientX - bounds.left)) / bounds.width;
			console.log("[EVENT] Calling move to timestamp from seekOnClick", {
				duration: props.duration(),
				location,
				offsetX: e.clientX,
				barBound: bounds,
				t: t,
			});
			moveToTimestamp(t);
		} else {
			const bounds = barBound();
			const t = (props.duration() * e.offsetX) / bounds.width;
			console.log("[EVENT] Calling move to timestamp from seekOnClick", {
				duration: props.duration(),
				location,
				offsetX: e.offsetX,
				barBound: bounds,
				t: t,
			});
			moveToTimestamp(t);
		}
	};

	const handleDragOnStart = (e) => {
		console.log("[EVENT] DRAG STARTED", e, props.isActive, barBound());
		setMouseDown(true);
		props.handleSetPause(props.isActive);
	};

	const handleDragOnStop = (e) => {
		console.log("[EVENT] DRAG STOPPED", e, e.offsetX);
		seekOnClick(e, "boopdrag");
		setMouseDown(false);
	};

	const handleOnDrag = (e) => {
		const cbp = e.offsetX;
		// const calcpos = cbp < 0 ? 0 : cbp > bounds.width ? bounds.width : cbp;
		// console.log("[EVENT] Dragging : ", {
		// 	cbp,
		// 	calcpos,
		// 	e,
		// 	offLeft: e.offsetX,
		// });
		setCurrentBoopPosition((p) => cbp);
	};

	const draggedDuration = createMemo(
		on([barBound, currentBoopPosition, props.duration], () => {
			const d =
				(props.duration() * currentBoopPosition()) / barBound().width;
			// console.log(
			// 	props.duration,
			// 	currentBoopPosition,
			// 	barBound.width,
			// 	"------->",
			// 	d
			// );
			return d;
		})
	);

	// createEffect(
	// 	on([barBound], () => {
	// 		// const bounds = barBound();
	// 		const ops = {
	// 			axis: "x",
	// 			bounds: "parent",
	// 			onDragStart: handleDragOnStart,
	// 			onDragEnd: handleDragOnStop,
	// 			onDrag: handleOnDrag,
	// 		};
	// 		console.log("[EVENT] drag options change ", ops);
	// 		setOptions(ops);
	// 	})
	// );

	// const draggedDuration = createMemo(() => 0);

	// createEffect(on([() => props.isActive], () => {}));

	// createEffect(
	// 	on(
	// 		[
	// 			() => props.isActive,
	// 			() => videoStore.currentTime,
	// 			props.duration,
	// 		],
	// 		() => {
	// 			if (props.isActive) {
	// 				console.log(
	// 					videoStore.currentTime,
	// 					props.duration(),
	// 					videoStore.currentTime / props.duration()
	// 				);
	// 			}
	// 		}
	// 	)
	// );

	return (
		<div class="w-full relative playbar-bound">
			<div
				class={`w-[calc(100%-0.35rem)] h-[1.5rem] bg-transparent relative mx-auto group flex items-start mt-2`}
				onClick={(e) => {
					e.preventDefault();
					seekOnClick(e, "barclick");
				}}
				ref={(el) => {
					console.log(el.getBoundingClientRect());
					barRef = el;
				}}>
				<div
					class={`mt-3 w-full bg-white ${
						mouseDown() ? "" : "h-[30%]"
					} absolute z-20`}></div>
				<div
					class={`mt-4 w-[calc(100%+0.5rem)] -left-1 mx-auto h-[32%] absolute z-10`}></div>
				{/* play bar */}
				<div class="absolute z-[100] w-full h-full">
					<div
						class={`mt-3 bg-y-green ${
							mouseDown() ? "" : "h-[30%]"
						} relative transition-all duration-300 ease-linear ${
							videoStore.videoState === STATE_VIDEO_ERROR ||
							videoStore.videoState === STATE_VIDEO_LOADING
								? "opacity-0"
								: "opacity-100"
						}`}
						style={{
							width: `${
								(videoStore.currentTime / props.duration()) *
								100
							}%`,
						}}></div>
				</div>

				{/* boop */}
				<div
					use:draggable={{
						bounds: "parent",
						onDragStart: handleDragOnStart,
						onDragEnd: handleDragOnStop,
						onDrag: handleOnDrag,
					}}
					class={`timeboop bg-y-darkgreen rounded-full absolute z-[100] mt-[18px] w-3 h-3 ${
						videoStore.videoState === STATE_VIDEO_ERROR
							? "opacity-0"
							: "opacity-100"
					}   ${
						mouseDown()
							? ""
							: "duration-300 transition-all ease-linear"
					} ${
						props.handleFullScreen.active
							? mouseDown()
								? "-top-[calc(50%-0.3rem)]"
								: "-top-[calc(50%-0.3rem)] hover:-top-[calc(50%-0.1rem)]"
							: mouseDown()
								? "-top-[calc(50%-0.2rem)]"
								: "-top-[calc(50%-0.225rem)]"
					} `}
					ref={draggableHandle}
					style={{
						transform: `translate3d(${currentBoopPosition() - 2}px, 0, 0)`,
					}}>
					{/* {mouseDown() ? (
						<div
							class={`text-white absolute rounded-lg px-4 text-xs transition-all ${
								props.duration() - draggedDuration() < 5
									? "-left-[calc(50%+3.5rem)] -top-[calc(50%+3rem)]"
									: "-left-[calc(50%+1rem)] -top-[calc(50%+1.5rem)]"
							}  border border-white`}>
							{videoStore.videoState === STATE_VIDEO_LOADING
								? "--:--"
								: props.toTimeString(draggedDuration())}
						</div>
					) : (
						<></>
					)} */}
				</div>

				{/* time */}
				<p
					class={`bg-black bg-opacity-40 text-white text-xs absolute right-0 -top-6 border rounded-full px-1`}>
					{videoStore.videoState === STATE_VIDEO_LOADING
						? "--:--"
						: props.toTimeString(videoStore.currentTime.toFixed(0))}
					/
					{videoStore.videoState === STATE_VIDEO_LOADING
						? "--:--"
						: props.toTimeString(props.duration().toFixed(0))}
				</p>
			</div>
			<VideoControls handleFullScreen={props.handleFullScreen} />
		</div>
	);
}