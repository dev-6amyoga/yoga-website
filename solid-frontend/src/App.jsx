import { createSignal, onMount } from "solid-js";

function App() {
	const [count, setCount] = createSignal(0);

	onMount(() => {
		console.log("Hello!");
	});

	return (
		<div class="">
			<p>{count()}</p>
			<button
				onClick={() => {
					setCount((p) => p + 1);
				}}>
				+1
			</button>
			<button
				onClick={() => {
					setCount((p) => p - 1);
				}}>
				-1
			</button>
		</div>
	);
}

export default App;
