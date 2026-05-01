import ClassInfoTeacher from "../pages/class-mode/teacher/ClassInfoTeacher";
import ClassModeTeacher from "../pages/class-mode/teacher/ClassModeTeacher";
import ContactUs from "../pages/teacher/ContactUs";
import FreeVideos from "../pages/teacher/FreeVideos";
import SelfAudioUpload from "../pages/teacher/SelfAudioUpload";
import TeacherHome from "../pages/teacher/TeacherHome";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import ClassManagement from "../pages/teacher/ClassManagement";
import MemberManagement from "../pages/teacher/MemberManagement";
import VideoPlayer from "../pages/teacher/VideoPlayer";
import TransactionManagement from "../pages/teacher/TransactionManagement";
import TeacherPlan from "../pages/teacher/TeacherPlan";
import TeacherPlaylist from "../pages/teacher/TeacherPlaylist";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
import TeacherTransactions from "../pages/teacher/TeacherTransactions";
import TeacherManageClasses from "../pages/teacher/class/Manage";
import InvitePage from "../pages/teacher/invite/Index";

// Admin Components for Teacher Routes
import ViewAllClasses from "../pages/admin/classes/ViewAllClasses";
import JoinClass from "../pages/admin/classes/JoinClass";
import AdminLogAttendance from "../pages/admin/classes/AdminLogAttendance";
import ViewAttendanceLogs from "../pages/admin/classes/ViewAttendanceLogs";
import ViewClassAttendees from "../pages/admin/classes/ViewClassAttendees";
import Students from "../pages/admin/member-management/Students";
import UserPlanPage from "../pages/admin/member-management/UserPlanPage";
import MyIncome from "../pages/admin/transactions/MyIncome";

export const TeacherRoutes = [
  // Teacher Dashboard & Main Pages
  {
    path: "/teacher/dashboard",
    element: <TeacherDashboard />,
  },
  {
    path: "/teacher",
    element: <TeacherHome />,
  },

  // Class Management
  {
    path: "/teacher/class-management",
    element: <ClassManagement />,
  },

  // Member Management
  {
    path: "/teacher/member-management",
    element: <MemberManagement />,
  },

  // Video Player
  {
    path: "/teacher/video-player",
    element: <VideoPlayer />,
  },

  // Transaction Management
  {
    path: "/teacher/transaction-management",
    element: <TransactionManagement />,
  },

  // Existing Routes
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

  // Class Management (Admin Components)
  {
    path: "/teacher/class/view-all",
    element: <ViewAllClasses adminRole={false} />,
  },
  {
    path: "/teacher/class/join",
    element: <JoinClass adminRole={false} />,
  },
  {
    path: "/teacher/class/log-attendance",
    element: <AdminLogAttendance adminRole={false} />,
  },
  {
    path: "/teacher/class/attendance-logs",
    element: <ViewAttendanceLogs adminRole={false} />,
  },
  {
    path: "/teacher/class/member-details",
    element: <ViewClassAttendees adminRole={false} />,
  },

  // Member Management (Admin Components)
  {
    path: "/teacher/members/students",
    element: <Students adminRole={false} />,
  },
  {
    path: "/teacher/members/user-plan-mappings",
    element: <UserPlanPage adminRole={false} />,
  },

  // Transaction Management (Admin Components)
  {
    path: "/teacher/transactions/all",
    element: <MyIncome adminRole={false} />,
  },
];
