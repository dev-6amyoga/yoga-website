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
import EditAsana from "../components/content-management/EditAsana";
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
	// video
	{
		path: "/admin/video/create",
		element: <RegisterVideoForm />,
	},
	{
		path: "/admin/video/edit/:asana_id",
		element: <EditAsana />,
	},
	{
		path: "/admin/video/view-all",
		element: <AllAsanas />,
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
		element: <RegisterPlaylistForm />,
	},
	{
		path: "/admin/playlist/view-all",
		element: <AllPlaylists />,
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
