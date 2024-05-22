import {
	For,
	children,
	createContext,
	createEffect,
	createSignal,
	on,
	onMount,
	useContext,
} from "solid-js";
import { createStore, produce } from "solid-js/store";

const CounterContext = createContext(
	[
		{
			count: 0,
		},
		{},
	],
	{ name: "CounterContext" }
);

function CounterContextProvider(props) {
	const [store, setStore] = createStore({
		count: 0,
	});

	const counterStore = [
		store,
		{
			increment() {
				setStore(
					produce((state) => {
						state.count++;
					})
				);
			},
		},
	];

	const resolvedChildren = children(() => props.children);

	return (
		<div class="border border-red-500">
			<CounterContext.Provider value={counterStore}>
				<div>{resolvedChildren()}</div>
			</CounterContext.Provider>
		</div>
	);
}

const Counter = () => {
	const [store, actions] = useContext(CounterContext);

	console.log({ store, actions });

	createEffect(
		on([() => store.count], (v) => console.log("Count changed : ", v))
	);

	return (
		<div class="border p-4">
			<p>{store.count}</p>
			<button onClick={() => actions.increment()}>+1</button>
		</div>
	);
};

function App() {
	const [count, setCount] = createSignal(0);
	const [input, setInput] = createSignal("");

	const [counterStore, setCounterStore] = createStore({
		count: 0,
	});

	const counterStoreActions = [
		counterStore,
		{
			increment() {
				setCounterStore(
					produce((state) => {
						state.count++;
					})
				);
			},
		},
	];

	const [store, setStore] = createStore({
		name: "John Doe",
		todos: ["hello", "world"],
	});

	onMount(() => {
		console.log("Hello!");
	});

	createEffect(
		on([() => store.name], (v) => {
			console.log("Name changed : ", v);
		})
	);

	createEffect(
		on([() => store.todos], (v) => {
			console.log("Todos changed : ", v);
		})
	);

	return (
		<CounterContext.Provider value={counterStoreActions}>
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

				<p>{store.name}</p>

				<button
					onClick={() => {
						setStore("name", `Jane Doe ${count()}`);
					}}>
					Change Name
				</button>

				<input
					onInput={(e) => setInput(e.target.value)}
					class="border-2 border-red-700"
				/>
				<p>{input()}</p>
				<button
					onClick={() => {
						setStore(
							produce((state) => {
								state.todos.push(input());
								console.log(state.todos);
							})
						);
						setInput("");
					}}>
					Submit
				</button>

				<ul>
					<For each={store.todos}>{(todo) => <li>{todo}</li>}</For>
				</ul>

				<Counter />
			</div>
		</CounterContext.Provider>
	);
}

export default App;
