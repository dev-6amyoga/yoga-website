import { createRenderEffect, createSignal, onCleanup } from "solid-js";

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
		active = false;
		console.log("INACTIVE");
		el.parentNode.style["user-select"] = "auto";
		el.style["user-select"] = "auto";

		let data = calcData(e);

		if (onDragEnd) onDragEnd(data);
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

export default function Playbar() {
	const [dragX, setDragX] = createSignal(0);

	const handleOnDrag = (e) => {
		// console.log(e);
		setDragX(e.offsetX);
	};

	const handleOnDragEnd = (e) => {
		console.log(e);
	};

	return (
		<div>
			<div class="max-w-4xl aspect-video bg-black mx-auto relative">
				<div class="absolute w-full h-24 border border-red-500 bottom-0">
					<div class="bar relative w-[calc(100%-0.5rem)] h-2 border-green-600 bg-white mx-auto">
						<div
							use:draggable={{
								onDragStart: () => {},
								onDrag: handleOnDrag,
								onDragEnd: handleOnDragEnd,
								bounds: "parent",
							}}
							class="dragtarget absolute h-4 w-4 rounded-full bg-y-darkgreen -top-1 left-0 bg-opacity-20"
							style={{
								transform: `translate3d(${dragX()}px, 0, 0)`,
							}}></div>
					</div>
				</div>
			</div>
		</div>
	);
}
