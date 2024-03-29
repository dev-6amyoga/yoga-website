import TestingVideo from "../pages/testing/Video";
// import withAuth from "../utils/withAuth";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
import DesignBoard from "../pages/testing/DesignBoard";
import AutomaticRegister from "../components/content-management/forms/AutomaticRegister";
export const TestingRoutes = [
  {
    path: "/testing/video",
    element: <TestingVideo />,
  },
  {
    path: "/testing/tp",
    element: <TeacherPlaylistCreation />,
  },
  {
    path: "/testing/design",
    element: <DesignBoard />,
  },
  {
    path: "/testing/auto-reg",
    element: <AutomaticRegister />,
  },
];
