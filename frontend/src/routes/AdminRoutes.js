import AllAsanaCategories from "../components/content-management/AllAsanaCategories";
import AllAsanas from "../components/content-management/AllAsanas";
import AllLanguages from "../components/content-management/AllLanguages";
import AllPlaylists from "../components/content-management/AllPlaylists";
import AllTransitions from "../components/content-management/AllTransitions";
import RegisterLanguageForm from "../components/content-management/forms/RegisterLanguage";
import RegisterTransitionVideoForm from "../components/content-management/forms/RegisterTransitionVideoForm";
import AdminHome from "../pages/admin/AdminHome";
import WatchAnalysis from "../pages/admin/watch-analysis/WatchAnalysis";
import RegisterNewPlan from "../pages/admin/Plans/RegisterNewPlan";
// import Settings from '../pages/admin/settings/settings';
import RegisterNewCategoryForm from "../components/content-management/forms/RegisterNewCategoryForm";
import ViewAllPlans from "../pages/admin/Plans/ViewAllPlans";
import RegisterPlaylist from "../pages/admin/content-management/playlist/RegisterPlaylist";
import EditAsana from "../pages/admin/content-management/video/EditAsana";
import RegisterVideo from "../pages/admin/content-management/video/RegisterVideo";
import DiscountManagement from "../pages/admin/discount-management";
import Institutes from "../pages/admin/member-management/Institutes";
import Students from "../pages/admin/member-management/Students";
import Teachers from "../pages/admin/member-management/Teachers";
import RegisterNewSchedule from "../pages/admin/schedule-management/RegisterNewSchedule";
import ViewAllSchedules from "../pages/admin/schedule-management/ViewAllSchedules";
import LogPayment from "../pages/admin/transactions/LogPayment";
import RefundManagement from "../pages/admin/transactions/Refund";
import AllPlaylistConfigs from "../components/content-management/AllPlaylistConfigs";
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
    path: "/admin/video/edit/:asana_id",
    element: <EditAsana />,
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
    path: "/admin/plan/view-all",
    element: <ViewAllPlans />,
  },
  // discount management
  {
    path: "/admin/discount-management",
    element: <DiscountManagement />,
  },
];
