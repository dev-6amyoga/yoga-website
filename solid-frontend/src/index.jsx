/* @refresh reload */
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import App from "./App";
import "./index.css";
import Video from "./pages/Video";

// if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
// 	throw new Error(
// 		"Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
// 	);
// }
// it just loading idk
// it coming now, lh:3000/testing/video
// what does it say
// are u running anything on port 3000
// ah hm wait ill come on meet
//okkk
// not able to access :(())
// https://meet.google.com/yax-tqfc-sdw

render(
	() => (
		<Router>
			<Route path="/" component={App} />
			<Route path="/testing/video" component={Video} />
		</Router>
	),
	document.getElementById("app")
);
