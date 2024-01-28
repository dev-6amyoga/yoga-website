export const navigateToDashboard = (currentRole, userPlan, navigate) => {
  const type = currentRole;
  console.log("Navigating to dashboard", type);
  // return;
  switch (type) {
    case "ROOT":
      navigate("/admin");
      break;
    case "TEACHER":
      navigate("/teacher");
      break;
    case "INSTITUTE_OWNER":
      // TODO what if institute_owner doesnt have a plan
      navigate("/institute");
      break;
    case "STUDENT":
      if (userPlan === null) {
        navigate("/student/playlist-view");
      } else {
        navigate("/student/playlist-view");
      }
      break;
    default:
      navigate("/");
      break;
  }
};
