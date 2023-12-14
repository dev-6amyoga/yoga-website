import StudentHome from "../pages/student/StudentHome";
import StudentPlan from "../pages/student/StudentPlan";
import FreeVideos from "../pages/student/FreeVideos";
import StudentMain from "../pages/student/StudentMain";
import RegisterNewPlaylistStudent from "../pages/student/RegisterNewPlaylistStudent";
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
];
