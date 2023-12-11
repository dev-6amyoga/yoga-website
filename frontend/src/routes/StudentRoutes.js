import StudentHome from "../pages/student/StudentHome";
import StudentPlan from "../pages/student/StudentPlan";
export const StudentRoutes = [
  {
    path: "/student",
    element: <StudentHome />,
  },

  {
    path: "/student/purchase-a-plan",
    element: <StudentPlan />,
  },
];
