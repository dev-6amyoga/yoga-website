import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

export default function VideoPlaybar({
	currentTime,
	duration,
	draggableHandle,
	toTimeString,
}) {
	const [mouseDown, setMouseDown] = useState(false);
	const barRef = useRef(null);
	const [barWidth, setBarWidth] = useState(0);
	const [currentBoopPosition, setCurrentBoopPosition] = useState(0);

	useEffect(() => {
		if (barRef.current) {
			console.log(barRef.current.getBoundingClientRect());
			setBarWidth(barRef.current.getBoundingClientRect().width);
		}
	}, [barRef]);

	return (
		<div className="w-full h-1 bg-white relative">
			<div
				className="bg-blue-500 h-full relative transition-all ease-linear"
				style={{
					width: `${(currentTime / duration) * 100}%`,
				}}
				ref={barRef}></div>

			<Draggable
				axis="x"
				bounds="parent"
				handle=".timeboop"
				defaultClassName="timeboop"
				onStart={(e, data) => {
					console.log("START-------------------------------------");
					console.log(data);
				}}
				onStop={(e, data) => {
					console.log("STOP-------------------------------------");
					console.log(data);
					setMouseDown(false);
				}}
				onDrag={(e, data) => {
					// console.log("DRAGG : ", data);
					// if (!mouseDown) setMouseDown(true);
					setCurrentBoopPosition(data.x);
				}}
				onMouseDown={() => {
					setMouseDown(true);
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
					} bg-blue-500 border border-black rounded-full absolute `}
					ref={draggableHandle}
					style={{
						left: `${(currentTime / duration) * 100}%`,
					}}>
					<div className="text-white absolute rounded-lg px-4 text-xs -left-[calc(50%+1rem)] -top-[calc(50%+1.5rem)] border border-white">
						{currentBoopPosition}
					</div>
				</div>
			</Draggable>

			<p className=" text-white text-xs absolute right-0 -top-4">
				{toTimeString(currentTime.toFixed(0))}/
				{toTimeString(duration.toFixed(0))}
			</p>
		</div>
	);
}
