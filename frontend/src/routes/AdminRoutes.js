import AllAsanas from "../components/content-management/AllAsanas";
import AllLanguages from "../components/content-management/AllLanguages";
import AllPlaylists from "../components/content-management/AllPlaylists";
import RegisterLanguageForm from "../components/content-management/forms/RegisterLanguage";
import RegisterPlaylistForm from "../components/content-management/forms/RegisterPlaylistForm";
import RegisterVideoForm from "../components/content-management/forms/RegisterVideoForm";
import AdminHome from "../pages/admin/AdminHome";
import RegisterNewPlan from "../pages/admin/Plans/RegisterNewPlan";
// import Settings from '../pages/admin/settings/settings';
import ViewAllPlans from "../pages/admin/Plans/ViewAllPlans";
export const AdminRoutes = [
  {
    path: "/admin",
    element: <AdminHome />,
  },
  {
    path: "/content/video/create",
    element: <RegisterVideoForm />,
  },
  {
    path: "/content/playlist/create",
    element: <RegisterPlaylistForm />,
  },
  {
    path: "/content/language/create",
    element: <RegisterLanguageForm />,
  },
  {
    path: "/content/video/create/addmarkers",
    element: <RegisterVideoForm />,
  },
  {
    path: "/admin/allAsanas",
    element: <AllAsanas />,
  },
  {
    path: "/admin/allPlaylists",
    element: <AllPlaylists />,
  },
  {
    path: "/admin/allLanguages",
    element: <AllLanguages />,
  },
  {
    path: "/plan/registerNewPlan",
    element: <RegisterNewPlan />,
  },
  {
    path: "/plan/viewAllPlans",
    element: <ViewAllPlans />,
  },
  // {
  //     path: 'admin/settings',
  //     element: <Settings />,
  // },
];
