import { CssBaseline, GeistProvider } from "@geist-ui/core";
import React from "react";
import ReactDOM from "react-dom/client";
import "react-phone-number-input/style.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const router = createBrowserRouter([
    ...GeneralRoutes,
    ...AuthRoutes,
    ...AdminRoutes,
    ...InstituteRoutes,
    ...StudentRoutes,
    ...TeacherRoutes,
    ...TestingRoutes,
]);

root.render(
    <React.StrictMode>
        <GeistProvider>
            <CssBaseline />
            {/* <App /> */}
            <RouterProvider router={router} />
            <ToastContainer />
        </GeistProvider>
    </React.StrictMode>
);

reportWebVitals();
