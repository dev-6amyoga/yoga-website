import { createEffect, createSignal, on, onCleanup, onMount } from "solid-js";

export default function Playbar() {
	let [active, setActive] = createSignal(false);

	let [barBounds, setBarBounds] = createSignal({
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	});

	let [targetBounds, setTargetBounds] = createSignal({
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
	});

	let [target, setTarget] = createSignal(null);
	let [bar, setBar] = createSignal(null);

	onMount(() => {
		const handlePointerDown = (e) => {
			setActive(true);

			console.log("Pointer Down");
		};

		const handlePointerUp = (e) => {
			setActive(false);

			console.log("Pointer Up");
		};

		const handlePointerMove = (e) => {
			if (!active()) {
				return;
			}

			console.log("Pointer Move", e.clientX, e.clientY);
		};

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("pointerup", handlePointerUp);
		document.addEventListener("pointermove", handlePointerMove);

		onCleanup(() => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("pointerup", handlePointerUp);
			document.removeEventListener("pointermove", handlePointerMove);
		});
	});

	const updateBounds = () => {
		if (target()) {
			const bounds = target().getBoundingClientRect();
			console.log("Target Bounds", bounds, target());
			setTargetBounds({
				left: bounds.left,
				right: bounds.right,
				top: bounds.top,
				bottom: bounds.bottom,
			});
		}

		if (bar()) {
			const bounds = bar().getBoundingClientRect();
			console.log("Bar Bounds", bounds, bar());
			setBarBounds({
				left: bounds.left,
				right: bounds.right,
				top: bounds.top,
				bottom: bounds.bottom,
			});
		}
	};

	createEffect(on([bar, target], updateBounds));

	onMount(() => {
		updateBounds();

		window.addEventListener("resize", updateBounds);

		onCleanup(() => {
			window.removeEventListener("resize", updateBounds);
		});
	});

	return (
		<div class="max-w-4xl aspect-video bg-black mx-auto relative">
			<div class="absolute w-full h-24 border border-red-500 bottom-0">
				<div
					class="relative w-[calc(100%-0.5rem)] h-2 border-green-600 bg-white mx-auto"
					ref={(el) => {
						setBar(el);
						updateBounds();
					}}>
					<div
						class="absolute h-4 w-4 rounded-full bg-y-darkgreen -top-1 left-0 transition-all bg-opacity-20"
						style={{
							transform: `translateX(${active() ? "calc(100% - 0.5rem)" : "0"})`,
						}}
						ref={(el) => {
							setTarget(el);
							updateBounds();
						}}></div>
				</div>
			</div>
		</div>
	);
}
