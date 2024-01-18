import InstituteHome from "../pages/institute";
// import MemberManagement from '../pages/institute/';
import AddNewTeacher from "../pages/institute/settings/AddNewTeacher";
import InstituteSettings from "../pages/institute/settings/InstituteSettings";
import UserSettings from "../pages/institute/settings/UserSettings";
import MemberManagement from "../pages/institute/settings/MemberManagement";
import PurchaseAPlan from "../pages/institute/settings/PurchaseAPlan";
import TransactionHistoryInstitute from "../pages/institute/settings/TransactionHistoryInstitute";
import MakeNewPlaylist from "../pages/institute/settings/MakeNewPlaylist";
export const InstituteRoutes = [
  {
    path: "/institute",
    element: <InstituteHome />,
  },
  {
    path: "institute/settings",
    element: <InstituteSettings />,
  },
  {
    path: "institute/user/settings",
    element: <UserSettings />,
  },
  {
    path: "institute/add-new-teacher",
    element: <AddNewTeacher />,
  },
  {
    path: "institute/member-management",
    element: <MemberManagement />,
  },
  {
    path: "institute/purchase-a-plan",
    element: <PurchaseAPlan />,
  },
  {
    path: "institute/view-transactions",
    element: <TransactionHistoryInstitute />,
  },
  {
    path: "institute/make-playlist",
    element: <MakeNewPlaylist />,
  },
];
