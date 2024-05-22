import App from "../App";
import PageWrapper from "../components/Common/PageWrapper";
import NotFound from "../pages/common/NotFound";
import Unauthorized from "../pages/common/Unauthorized";

export const GeneralRoutes = [
	{
		path: "/",
		element: <App />,
	},
	{
		path: "/about-us",
		element: <PageWrapper>NOT IMPLEMENTED</PageWrapper>,
	},
	{
		path: "/contact-us",
		element: <PageWrapper>NOT IMPLEMENTED</PageWrapper>,
	},
	{
		path: "/pricing",
		element: <PageWrapper>NOT IMPLEMENTED</PageWrapper>,
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
