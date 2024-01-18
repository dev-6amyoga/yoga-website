import TestingVideo from "../pages/testing/Video";
import InvitePage from "../pages/teacher/invite/Index";
import withAuth from "../utils/withAuth";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
export const TestingRoutes = [
  {
    path: "/testing/video",
    element: <TestingVideo />,
  },
  {
    path: "/testing/tp",
    element: <TeacherPlaylistCreation />,
  },
];
