// import withAuth from "../utils/withAuth";
import AutomaticRegister from "../components/content-management/forms/AutomaticRegister";
import ClassInfoStudent from "../components/testing/ClassInfoStudent";
import ClassInfoTeacher from "../components/testing/ClassInfoTeacher";
import ClassModeStudent from "../pages/class-mode/student/ClassModeStudent";
import ClassModeTeacher from "../pages/class-mode/teacher/ClassModeTeacher";
import ManageClasses from "../pages/class-mode/teacher/ManageClasses";
import StudentHome from "../pages/student/StudentHome";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
import DesignBoard from "../pages/testing/DesignBoard";
import ShakaVideo from "../pages/testing/ShakaVideo";
import SocketPage from "../pages/testing/Socket";
export const TestingRoutes = [
  // {
  //   path: "/testing/video",
  //   element: <TestingVideo />,
  // },
  {
    path: "/testing/shaka-video",
    element: <ShakaVideo />,
  },
  {
    path: "/testing/ai-student",
    element: <StudentHome />,
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
  {
    path: "/testing/socket",
    element: <SocketPage />,
  },
  {
    path: "/class/student/:class_id",
    element: <ClassModeStudent />,
  },
  {
    path: "/class/teacher/:class_id",
    element: <ClassModeTeacher />,
  },
  {
    path: "/class/teacher/:class_id/info",
    element: <ClassInfoTeacher />,
  },
  {
    path: "/class/student/:class_id/info",
    element: <ClassInfoStudent />,
  },
  {
    path: "/class/manage",
    element: <ManageClasses />,
  },
  // {
  //   path: "/testing/playbar",
  //   element: <PlaybarPage />,
  // },
];
