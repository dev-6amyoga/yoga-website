import AllAsanaCategories from "../components/content-management/AllAsanaCategories";
import AllAsanas from "../components/content-management/AllAsanas";
import AllLanguages from "../components/content-management/AllLanguages";
import AllPlaylists from "../components/content-management/AllPlaylists";
import AllTransitions from "../components/content-management/AllTransitions";
import RegisterLanguageForm from "../components/content-management/forms/RegisterLanguage";
import RegisterPlaylistForm from "../components/content-management/forms/RegisterPlaylistForm";
import RegisterTransitionVideoForm from "../components/content-management/forms/RegisterTransitionVideoForm";
import RegisterVideoForm from "../components/content-management/forms/RegisterVideoForm";
import AdminHome from "../pages/admin/AdminHome";
import RegisterNewPlan from "../pages/admin/Plans/RegisterNewPlan";
// import Settings from '../pages/admin/settings/settings';
import RegisterNewCategoryForm from "../components/content-management/forms/RegisterNewCategoryForm";
import ViewAllPlans from "../pages/admin/Plans/ViewAllPlans";
import DiscountManagement from "../pages/admin/discount-management";
import Institutes from "../pages/admin/member-management/Institutes";
import Students from "../pages/admin/member-management/Students";
import Teachers from "../pages/admin/member-management/Teachers";
import RegisterNewSchedule from "../pages/admin/schedule-management/RegisterNewSchedule";
import ViewAllSchedules from "../pages/admin/schedule-management/ViewAllSchedules";
import LogPayment from "../pages/admin/transactions/LogPayment";
import RefundManagement from "../pages/admin/transactions/Refund";
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
		path: "/admin/schedule/register",
		element: <RegisterNewSchedule />,
	},
	{
		path: "/admin/schedule/view",
		element: <ViewAllSchedules />,
	},
	{
		path: "/content/language/create",
		element: <RegisterLanguageForm />,
	},
	{
		path: "/content/playlist/create",
		element: <RegisterPlaylistForm />,
	},
	{
		path: "/content/asana-category/create",
		element: <RegisterNewCategoryForm />,
	},
	{
		path: "/content/asana-category/all",
		element: <AllAsanaCategories />,
	},
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
		path: "/admin/transactions/log-payment",
		element: <LogPayment />,
	},
	{
		path: "/admin/transactions/refund",
		element: <RefundManagement />,
	},
	{
		path: "/content/video/transition/create",
		element: <RegisterTransitionVideoForm />,
	},
	{
		path: "/content/transition/all",
		element: <AllTransitions />,
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
	{
		path: "/admin/discount-management",
		element: <DiscountManagement />,
	},
];
