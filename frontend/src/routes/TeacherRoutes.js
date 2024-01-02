import TeacherHome from '../pages/teacher/TeacherHome';
import InvitePage from '../pages/teacher/invite/Index';

export const TeacherRoutes = [
    {
        path: '/teacher',
        element: <TeacherHome />,
    },
    {
        path: '/teacher/invite',
        element: <InvitePage />,
    },
];
