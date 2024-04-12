// "use strict";
// exports.__esModule = true;
// exports.useStore = void 0;

import { onCleanup } from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { createStore as createZustandStore } from "zustand/vanilla";

function useStore(api, selector, equalityFn) {
	if (selector === void 0) {
		selector = api.getState;
	}
	var initialValue = selector(api.getState());

	var [state, setState] = createStore(initialValue);

	var listener = function (nextState, previousState) {
		var prevStateSlice = selector(previousState);
		var nextStateSlice = selector(nextState);

		if (equalityFn !== undefined) {
			const eq = equalityFn(prevStateSlice, nextStateSlice);
			console.log({ eq, prevStateSlice, nextStateSlice });
			if (!eq) {
				// const r = reconcile(nextStateSlice);
				// console.log({ nextStateSlice });
				setState(nextStateSlice);
			}
		} else {
			setState(reconcile(nextStateSlice));
		}
	};

	var unsubscribe = api.subscribe(listener);

	onCleanup(function () {
		return unsubscribe();
	});

	return state;
}

// export const useStore = useStore;

function createImpl(createState) {
	var api =
		typeof createState === "function"
			? createZustandStore(createState)
			: createState;

	var useBoundStore = function (selector, equalityFn) {
		return useStore(api, selector, equalityFn);
	};

	Object.assign(useBoundStore, api);

	return useBoundStore;
}

var create = function (createState) {
	return createState ? createImpl(createState) : createImpl;
};

export default create;
