import TestingVideo from "../pages/testing/Video";
// import withAuth from "../utils/withAuth";
import TeacherPlaylistCreation from "../pages/teacher/TeacherPlaylistCreation";
import DesignBoard from "../pages/testing/DesignBoard";
export const TestingRoutes = [
	{
		path: "/testing/video",
		element: <TestingVideo />,
	},
	{
		path: "/testing/tp",
		element: <TeacherPlaylistCreation />,
	},
	{
		path: "/testing/design",
		element: <DesignBoard />,
	},
];
