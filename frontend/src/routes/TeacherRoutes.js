import ClassInfoTeacher from "../pages/class-mode/teacher/ClassInfoTeacher";
import ClassModeTeacher from "../pages/class-mode/teacher/ClassModeTeacher";
import ContactUs from "../pages/teacher/ContactUs";
import FreeVideos from "../pages/teacher/FreeVideos";
import SelfAudioUpload from "../pages/teacher/SelfAudioUpload";
import TeacherHome from "../pages/teacher/TeacherHome";
import TeacherPlan from "../pages/teacher/TeacherPlan";
import TeacherPlaylist from "../pages/teacher/TeacherPlaylist";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
import TeacherTransactions from "../pages/teacher/TeacherTransactions";
import TeacherManageClasses from "../pages/teacher/class/Manage";
import InvitePage from "../pages/teacher/invite/Index";

export const TeacherRoutes = [
  {
    path: "/teacher/free-videos",
    element: <FreeVideos />,
  },
  {
    path: "/teacher/purchase-a-plan",
    element: <TeacherPlan />,
  },
  {
    path: "/teacher/contact-us",
    element: <ContactUs />,
  },
  {
    path: "/teacher/transactions",
    element: <TeacherTransactions />,
  },
  {
    path: "/teacher/invite",
    element: <InvitePage />,
  },
  {
    path: "/teacher/playlist",
    element: <TeacherPlaylist />,
  },
  {
    path: "/teacher/self-audio-upload",
    element: <SelfAudioUpload />,
  },
  {
    path: "/teacher/make-playlist",
    element: <TeacherPlaylistCreation />,
  },

  // class mode
  {
    path: "/teacher/class/manage",
    element: <TeacherManageClasses />,
  },
  {
    path: "/teacher/class/:class_id/info",
    element: <ClassInfoTeacher />,
  },
  {
    path: "/teacher/class/:class_id",
    element: <ClassModeTeacher />,
  },
];
