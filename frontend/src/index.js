import { CssBaseline, GeistProvider } from '@geist-ui/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { AdminRoutes } from './routes/AdminRoutes';
import { AuthRoutes } from './routes/AuthRoutes';
import { GeneralRoutes } from './routes/GeneralRoutes';
import { StudentRoutes } from './routes/StudentRoutes';
import { TeacherRoutes } from './routes/TeacherRoutes';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
    ...GeneralRoutes,
    ...AuthRoutes,
    ...AdminRoutes,
    ...StudentRoutes,
    ...TeacherRoutes,
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
