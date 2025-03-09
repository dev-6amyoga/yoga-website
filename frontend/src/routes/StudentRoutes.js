import ClassInfoStudent from "../pages/class-mode/student/ClassInfoStudent";
import ClassModeStudent from "../pages/class-mode/student/ClassModeStudent";
import AboutUs from "../pages/student/AboutUs";
import ContactUs from "../pages/student/ContactUs";
import EditPlaylistStudent from "../pages/student/EditPlaylistStudent";
import FreeVideos from "../pages/student/FreeVideos";
import RegisterNewPlaylistStudent from "../pages/student/RegisterNewPlaylistStudent";
import StudentHome from "../pages/student/StudentHome";
import StudentMain from "../pages/student/StudentMain";
import StudentPlan from "../pages/student/StudentPlan";
import StudentProfile from "../pages/student/StudentProfile";
import StudentSettings from "../pages/student/StudentSettings";
import StudentTransactionHistory from "../pages/student/StudentTransactionHistory";
import StudentWatchHistory from "../pages/student/StudentWatchHistory";
import ViewAllPlaylists from "../pages/student/ViewAllPlaylists";
import ViewMyClasses from "../pages/student/class-mode/ViewMyClasses";
export const StudentRoutes = [
  {
    path: "/student/playlist-view",
    element: <StudentHome />,
  },
  {
    path: "/student/class/my-classes",
    element: <ViewMyClasses />,
  },
  {
    path: "/student/contact-us",
    element: <ContactUs />,
  },
  {
    path: "/student/about-us",
    element: <AboutUs />,
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
    path: "/student/playlist/edit/:playlist_id",
    element: <EditPlaylistStudent />,
  },
  {
    path: "/student/view-all-playlists",
    element: <ViewAllPlaylists />,
  },
  {
    path: "/student/my-profile",
    element: <StudentProfile />,
  },
  {
    path: "/student/settings",
    element: <StudentSettings />,
  },
  {
    path: "/student/transactions",
    element: <StudentTransactionHistory />,
  },
  {
    path: "/student/watch-history",
    element: <StudentWatchHistory />,
  },

  // class mode
  {
    path: "/student/class/:class_id/info",
    element: <ClassInfoStudent />,
  },
  {
    path: "/student/class/:class_id",
    element: <ClassModeStudent />,
  },
];
