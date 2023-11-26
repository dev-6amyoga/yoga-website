import { CssBaseline, GeistProvider } from '@geist-ui/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './App';
import AllAsanas from './components/content-management/all_asanas';
import './index.css';
import Admin_home from './pages/admin/admin_home';
import RegisterPlaylist from './pages/content-management/playlist/RegisterPlaylist';
import RegisterVideo from './pages/content-management/video/RegisterVideo';
import Firstpage from './pages/firstpage/firstpage';
import Student_home from './pages/student/student_home';
import Teacher_home from './pages/teacher/teacher_home';
import reportWebVitals from './reportWebVitals';
const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/login',
        element: <Firstpage />,
    },
    {
        path: '/student',
        element: <Student_home />,
    },
    {
        path: '/admin',
        element: <Admin_home />,
    },
    {
        path: '/teacher',
        element: <Teacher_home />,
    },

    {
        path: '/content/video/create',
        element: <RegisterVideo />,
    },

    {
        path: '/content/playlist/create',
        element: <RegisterPlaylist />,
    },

    {
        path: '/admin/allAsanas',
        element: <AllAsanas />,
    },
    {
        path: '/content/video/create/addmarkers',
        element: <RegisterVideo />,
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
