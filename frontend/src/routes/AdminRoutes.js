import AllAsanaCategories from "../components/content-management/AllAsanaCategories";
import AllAsanas from "../components/content-management/AllAsanas";
import AllLanguages from "../components/content-management/AllLanguages";
import AllPlaylists from "../components/content-management/AllPlaylists";
import AllTransitions from "../components/content-management/AllTransitions";
import RegisterLanguageForm from "../components/content-management/forms/RegisterLanguage";
import RegisterTransitionVideoForm from "../components/content-management/forms/RegisterTransitionVideoForm";
import AdminHome from "../pages/admin/AdminHome";
import RegisterNewPlan from "../pages/admin/Plans/RegisterNewPlan";
import WatchAnalysis from "../pages/admin/watch-analysis/WatchAnalysis";
// import Settings from '../pages/admin/settings/settings';
import AllPlaylistConfigs from "../components/content-management/AllPlaylistConfigs";
import RegisterNewCategoryForm from "../components/content-management/forms/RegisterNewCategoryForm";
import CustomerAssistanceVideos from "../pages/admin/CustomerAssistanceVideos";
import RegisterCustomizedPlan from "../pages/admin/Plans/RegisterCustomizedPlan";
import ViewAllCustomPlans from "../pages/admin/Plans/ViewAllCustomPlans";
import ViewAllPlans from "../pages/admin/Plans/ViewAllPlans";
import PlayerPage from "../pages/admin/PlayerPage";
import AdminManageClasses from "../pages/admin/classes/AdminManageClasses";
import RegisterPlaylist from "../pages/admin/content-management/playlist/RegisterPlaylist";
import EditAsana from "../pages/admin/content-management/video/EditAsana";
import EditTransition from "../pages/admin/content-management/video/EditTransition";
import RegisterVideo from "../pages/admin/content-management/video/RegisterVideo";
import DiscountManagement from "../pages/admin/discount-management";
import Institutes from "../pages/admin/member-management/Institutes";
import Students from "../pages/admin/member-management/Students";
import Teachers from "../pages/admin/member-management/Teachers";
import RegisterNewSchedule from "../pages/admin/schedule-management/RegisterNewSchedule";
import ViewAllSchedules from "../pages/admin/schedule-management/ViewAllSchedules";
import LogPayment from "../pages/admin/transactions/LogPayment";
import RefundManagement from "../pages/admin/transactions/Refund";
import EditPlaylist from "../components/content-management/EditPlaylist";
import PackagingVideos from "../pages/admin/packing-videos/PackagingVideos";
import LoginHistory from "../pages/admin/member-management/LoginHistory";
import UserPlanPage from "../pages/admin/member-management/UserPlanPage";
export const AdminRoutes = [
  {
    path: "/admin",
    element: <AdminHome />,
  },
  // video
  {
    path: "/admin/video/create",
    element: <RegisterVideo />,
  },
  {
    path: "/admin/package-videos",
    element: <PackagingVideos />,
  },
  // {
  // 	path: "/admin/classmode/create",
  // 	element: <RegisterNewClass />,
  // },
  // {
  // 	path: "/admin/classmode/view",
  // 	element: <ViewAllClasses />,
  // },
  // {
  // 	path: "/class-mode/:class_id",
  // 	element: <ClassModePage />,
  // },

  {
    path: "/admin/video/edit/:asana_id",
    element: <EditAsana />,
  },
  {
    path: "/admin/transition/edit/:transition_id",
    element: <EditTransition />,
  },
  {
    path: "/admin/video/view-all",
    element: <AllAsanas />,
  },
  {
    path: "/admin/watch-analysis",
    element: <WatchAnalysis />,
  },
  // video transition
  {
    path: "/admin/video/transition/create",
    element: <RegisterTransitionVideoForm />,
  },
  {
    path: "/admin/video/transition/all",
    element: <AllTransitions />,
  },
  {
    path: "/admin/player-page",
    element: <PlayerPage />,
  },
  // schedule
  {
    path: "/admin/schedule/register",
    element: <RegisterNewSchedule />,
  },
  {
    path: "/admin/schedule/view",
    element: <ViewAllSchedules />,
  },
  // language
  {
    path: "/admin/language/create",
    element: <RegisterLanguageForm />,
  },
  {
    path: "/admin/language/view-all",
    element: <AllLanguages />,
  },
  // playlist
  {
    path: "/admin/playlist/create",
    element: <RegisterPlaylist />,
  },
  {
    path: "/admin/playlist/edit/:playlist_id",
    element: <EditPlaylist />,
  },
  {
    path: "/admin/playlist/view-all",
    element: <AllPlaylists />,
  },
  {
    path: "/admin/playlist-configs",
    element: <AllPlaylistConfigs />,
  },
  // asana category
  {
    path: "/admin/asana-category/create",
    element: <RegisterNewCategoryForm />,
  },
  {
    path: "/admin/asana-category/all",
    element: <AllAsanaCategories />,
  },
  // members
  {
    path: "/admin/members/institutes",
    element: <Institutes />,
  },
  {
    path: "/admin/members/teachers",
    element: <Teachers />,
  },
  {
    path: "/admin/members/students",
    element: <Students />,
  },
  {
    path: "/admin/members/login-history",
    element: <LoginHistory />,
  },
  {
    path: "/admin/members/all-user-plans",
    element: <UserPlanPage />,
  },

  // transactions
  {
    path: "/admin/transactions/log-payment",
    element: <LogPayment />,
  },
  {
    path: "/admin/transactions/refund",
    element: <RefundManagement />,
  },
  // plans
  {
    path: "/admin/plan/create",
    element: <RegisterNewPlan />,
  },
  {
    path: "/admin/custom-plan/create",
    element: <RegisterCustomizedPlan />,
  },
  {
    path: "/admin/custom-plan/view",
    element: <ViewAllCustomPlans />,
  },
  {
    path: "/admin/plan/view-all",
    element: <ViewAllPlans />,
  },
  // discount management
  {
    path: "/admin/discount-management",
    element: <DiscountManagement />,
  },

  {
    path: "/admin/class/manage",
    element: <AdminManageClasses />,
  },

  {
    path: "/admin/customer-assistance-videos",
    element: <CustomerAssistanceVideos />,
  },
];
