// import withAuth from "../utils/withAuth";
import AutomaticRegister from "../components/content-management/forms/AutomaticRegister";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
import DesignBoard from "../pages/testing/DesignBoard";
import ShakaVideo from "../pages/testing/ShakaVideo";
import SocketPage from "../pages/testing/Socket";
export const TestingRoutes = [
	// {
	//   path: "/testing/video",
	//   element: <TestingVideo />,
	// },
	{
		path: "/testing/shaka-video",
		element: <ShakaVideo />,
	},
	{
		path: "/testing/tp",
		element: <TeacherPlaylistCreation />,
	},
	{
		path: "/testing/design",
		element: <DesignBoard />,
	},
	{
		path: "/testing/auto-reg",
		element: <AutomaticRegister />,
	},
	{
		path: "/testing/socket",
		element: <SocketPage />,
	},
	{
		path: "/testing/class-mode-student",
		element: <div />,
	},
	{
		path: "/testing/class-mode-teacher",
		element: <div />,
	},
	// {
	//   path: "/testing/playbar",
	//   element: <PlaybarPage />,
	// },
];
