import StudentHome from "../pages/student/StudentHome";
import StudentPlan from "../pages/student/StudentPlan";
import FreeVideos from "../pages/student/FreeVideos";
import StudentMain from "../pages/student/StudentMain";
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
];
