import InstituteHome from '../pages/institute';
import MemberManagement from '../pages/institute/member';
import AddNewTeacher from '../pages/institute/settings/AddNewTeacher';
import InstituteSettings from '../pages/institute/settings/InstituteSettings';
import UserSettings from '../pages/institute/settings/UserSettings';
export const InstituteRoutes = [
    {
        path: '/institute',
        element: <InstituteHome />,
    },
    {
        path: 'institute/settings',
        element: <InstituteSettings />,
    },
    {
        path: 'institute/user/settings',
        element: <UserSettings />,
    },
    {
        path: 'institute/add-new-teacher',
        element: <AddNewTeacher />,
    },
    {
        path: 'institute/member-management',
        element: <MemberManagement />,
    },
];
