import AllAsanas from "../components/content-management/AllAsanas";
import RegisterPlaylistForm from "../components/content-management/forms/RegisterPlaylistForm";
import RegisterVideoForm from "../components/content-management/forms/RegisterVideoForm";
import AdminHome from "../pages/admin/AdminHome";
import AllPlaylists from "../components/content-management/AllPlaylists";
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
];
