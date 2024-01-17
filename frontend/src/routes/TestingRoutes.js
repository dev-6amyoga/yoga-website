import TestingVideo from "../pages/testing/Video";
import InvitePage from "../pages/teacher/invite/Index";
import withAuth from "../utils/withAuth";

export const TestingRoutes = [
  {
    path: "/testing/video",
    element: <TestingVideo />,
  },
  {
    path: "/testing/invite",
    element: <InvitePage />,
  },
];
