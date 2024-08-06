import { GeistProvider } from "@geist-ui/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { CookiesProvider } from "react-cookie";
import ReactDOM from "react-dom/client";
import "react-phone-number-input/style.css";
import {
	Outlet,
	RouterProvider,
	createBrowserRouter,
	useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoginIndex from "./LoginIndex";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { AdminRoutes } from "./routes/AdminRoutes";
import { AuthRoutes } from "./routes/AuthRoutes";
import { GeneralRoutes } from "./routes/GeneralRoutes";
import { InstituteRoutes } from "./routes/InstituteRoutes";
import { StudentRoutes } from "./routes/StudentRoutes";
import { TeacherRoutes } from "./routes/TeacherRoutes";
import { TestingRoutes } from "./routes/TestingRoutes";

const root = ReactDOM.createRoot(document.getElementById("root"));

const Root = () => {
	const location = useLocation();
	// <AnimatePresence mode="wait">
	//   <motion.div
	//     key={location.pathname}
	//     initial={{ opacity: 0 }}
	//     animate={{ opacity: 1, transition: { duration: 0.3 } }}
	//     exit={{ opacity: 0, transition: { duration: 0.3 } }}
	//   >

	//   </motion.div>
	// </AnimatePresence>
	return <Outlet />;
};

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		children: [
			...GeneralRoutes,
			...AuthRoutes,
			...AdminRoutes,
			...InstituteRoutes,
			...StudentRoutes,
			...TeacherRoutes,
			...TestingRoutes,
		],
	},
]);

const queryClient = new QueryClient();

function Index() {
	//   const themes = Themes.create({
	//     palette: {
	// 		success: "#ff0000",
	// 		warning: ""
	// 	},
	//   });

	//   const theme = useTheme();

	// console.log("DOMAIN : ", import.meta.env.VITE_FRONTEND_DOMAIN);

	return (
		<CookiesProvider
			defaultSetOptions={{
				path: "/",
				sameSite: "lax",
				// domain: import.meta.env.VITE_FRONTEND_DOMAIN,
			}}>
			<QueryClientProvider client={queryClient}>
				<GeistProvider>
					{/* <CssBaseline /> */}
					<RouterProvider router={router} />
					<ToastContainer autoClose={3000} pauseOnHover={true} />
					<LoginIndex />
				</GeistProvider>
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</CookiesProvider>
	);
}

// TODO : do we put back React.StrictMode
root.render(<Index />);

reportWebVitals();
