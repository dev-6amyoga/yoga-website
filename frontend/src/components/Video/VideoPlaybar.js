import { useEffect, useRef, useState } from "react";
import { DraggableCore } from "react-draggable";

export default function VideoPlaybar({
	playbarVisible,
	currentTime,
	duration,
	draggableHandle,
	toTimeString,
	moveToTimestamp,
	handleSetPlay,
	handleSetPause,
}) {
	const [mouseDown, setMouseDown] = useState(false);
	const barRef = useRef(null);
	const [barBound, setBarBound] = useState({
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
	});
	const [currentBoopPosition, setCurrentBoopPosition] = useState(0);

	useEffect(() => {
		if (barRef.current) {
			const bounds = barRef.current.getBoundingClientRect();
			console.log(bounds);
			setBarBound({
				top: bounds.top,
				bottom: bounds.bottom,
				left: bounds.left,
				right: bounds.right,
				width: bounds.width,
				height: bounds.height,
			});
		}
	}, [barRef]);

	useEffect(() => {
		setCurrentBoopPosition(barBound.width * (currentTime / duration));
	}, [currentTime, barBound, duration]);

	return (
		<div
			className={`w-full h-1 bg-white relative`}
			onClick={(e) => {
				moveToTimestamp(
					(duration * (e.clientX - barBound.left)) / barBound.width
				);
			}}>
			<div
				className="bg-blue-500 h-full relative transition-all ease-linear"
				style={{
					width: `${(currentTime / duration) * 100}%`,
				}}
				ref={barRef}></div>

			<DraggableCore
				axis="x"
				// bounds={{
				// 	left: 0,
				// 	right: barBound.right - barBound.left,
				// 	top: barBound.top,
				// 	bottom: barBound.bottom,
				// }}
				bounds="parent"
				// position={[currentBoopPosition, 0]}
				handle=".timeboop"
				defaultClassName="timeboop"
				onStart={(e, data) => {
					// console.log("START-------------------------------------");
					// console.log(e.clientX);
					setMouseDown(true);
					handleSetPause();
				}}
				onStop={(e, data) => {
					// console.log("STOP-------------------------------------");
					moveToTimestamp(
						(duration * (e.clientX - barBound.left)) /
							barBound.width
					);
					setMouseDown(false);
				}}
				onDrag={(e, data) => {
					// console.log("DRAGG : ", data);
					// if (!mouseDown) setMouseDown(true);
					// console.log(e.clientX - barBound.left);
					setCurrentBoopPosition((p) => e.clientX - barBound.left);
				}}
				// grid={[duration, 10]}
				scale={1}
				nodeRef={draggableHandle}
				// defaultPosition={}
			>
				<div
					className={`timeboop ${
						mouseDown
							? "xw-4 xh-4 x-top-[calc(50%+0.25rem)] w-2 h-2 -top-1/2"
							: "w-2 h-2 -top-1/2 delay-75 transition-all"
					} bg-blue-500 border border-black rounded-full absolute`}
					ref={draggableHandle}
					style={{
						left: `${
							(currentBoopPosition / barBound.width) * 100
						}%`,
					}}>
					{mouseDown ? (
						<div className="text-white absolute rounded-lg px-4 text-xs -left-[calc(50%+1rem)] -top-[calc(50%+1.5rem)] border border-white">
							{toTimeString(
								(duration * currentBoopPosition) /
									barBound.width
							)}
						</div>
					) : (
						<></>
					)}
				</div>
			</DraggableCore>

			<p className=" text-white text-xs absolute right-0 -top-4">
				{toTimeString(currentTime.toFixed(0))}/
				{toTimeString(duration.toFixed(0))}
			</p>
		</div>
	);
}
