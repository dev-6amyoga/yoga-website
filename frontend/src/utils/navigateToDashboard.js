import { Fetch } from "./Fetch";

export const navigateToDashboard = async (currentRole, userPlan, navigate) => {
  const type = currentRole;
  //console.log("Navigating to dashboard", type);
  // return;
  switch (type) {
    case "ROOT":
      navigate("/admin");
      break;
    case "TEACHER":
      navigate("/teacher/free-videos");
      break;
    case "INSTITUTE_OWNER":
      navigate("/institute");
      break;
    case "INSTITUTE_ADMIN":
      navigate("/institute");
      break;
    case "STUDENT":
      console.log("User Plan in Navigation:", userPlan);

      if (userPlan?.plan_id) {
        navigate("/student/join-class");
      } else {
        // Check if Master Class is available
        try {
          const response = await Fetch({
            url: "/zoom/api/classes/today",
            method: "GET",
          });
          const classes = response.data || [];
          const hasMasterClass = classes.some(
            (classObj) => classObj.zoom_class_name === "Master Class"
          );

          if (hasMasterClass) {
            navigate("/student/join-class");
          } else {
            navigate("/student/purchase-a-plan");
          }
        } catch (error) {
          navigate("/student/purchase-a-plan");
        }
      }
      break;
    default:
      navigate("/");
      break;
  }
};
