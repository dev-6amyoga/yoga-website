import FreeVideos from "../pages/student/FreeVideos";
import RegisterNewPlaylistStudent from "../pages/student/RegisterNewPlaylistStudent";
import StudentHome from "../pages/student/StudentHome";
import StudentMain from "../pages/student/StudentMain";
import StudentPlan from "../pages/student/StudentPlan";
import StudentProfile from "../pages/student/StudentProfile";
import StudentSettings from "../pages/student/StudentSettings";
export const StudentRoutes = [
  {
    path: "/student/playlist-view",
    element: <StudentHome />,
  },

  {
    path: "/student/purchase-a-plan",
    element: <StudentPlan />,
  },
  {
    path: "/student/free-videos",
    element: <FreeVideos />,
  },
  {
    path: "/student",
    element: <StudentMain />,
  },
  {
    path: "/student/register-new-playlist",
    element: <RegisterNewPlaylistStudent />,
  },
  {
    path: "/student/my-profile",
    element: <StudentProfile />,
  },
  {
    path: "/student/settings",
    element: <StudentSettings />,
  },
];
