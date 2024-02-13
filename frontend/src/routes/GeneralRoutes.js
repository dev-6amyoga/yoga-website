import App from "../App";
import NotFound from "../pages/common/NotFound";
import Unauthorized from "../pages/common/Unauthorized";

export const GeneralRoutes = [
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/unauthorized",
		element: <Unauthorized />,
	},
	{
		path: "*",
		element: <NotFound />,
	},
];
