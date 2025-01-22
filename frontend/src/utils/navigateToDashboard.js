export const navigateToDashboard = (currentRole, userPlan, navigate) => {
  const type = currentRole;
  console.log("Navigating to dashboard", type);
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
      // if (userPlan === null) {
      //   navigate("/student/free-videos");
      // } else {
      //   navigate("/student/free-videos");
      // }
      navigate("/student/free-videos");
      break;
    default:
      navigate("/");
      break;
  }
};
