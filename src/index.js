import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { GeistProvider, CssBaseline } from "@geist-ui/core";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RegisterVideo from "./pages/content-management/video/RegisterVideo";
import Firstpage from "./pages/firstpage/firstpage";
import Student_home from "./pages/student/student_home";
import Admin_home from "./pages/admin/admin_home";
import Teacher_home from "./pages/teacher/teacher_home";

const root = ReactDOM.createRoot(document.getElementById("root"));
const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div>
        <App />
      </div>
    ),
  },
  {
    path: "/login",
    element: (
      <div>
        <Firstpage />
      </div>
    ),
  },
  {
    path: "/student",
    element: (
      <div>
        <Student_home />
      </div>
    ),
  },
  {
    path: "/admin",
    element: (
      <div>
        <Admin_home />
      </div>
    ),
  },
  {
    path: "/teacher",
    element: (
      <div>
        <Teacher_home />
      </div>
    ),
  },

  {
    path: "/content/video/create",
    element: (
      <div>
        <RegisterVideo />
      </div>
    ),
  },
  {
    path: "/content/video/create/addmarkers",
    element: (
      <div>
        <RegisterVideo />
      </div>
    ),
  },
]);

root.render(
  <React.StrictMode>
    <GeistProvider>
      <CssBaseline />
      {/* <App /> */}
      <RouterProvider router={router} />
    </GeistProvider>
  </React.StrictMode>
);

reportWebVitals();
