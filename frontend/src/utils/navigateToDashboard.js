export const navigateToDashboard = (currentRole, userPlan, navigate) => {
  const type = currentRole;

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
        navigate("/student/free-videos");
      } else {
        navigate("/student/playlist-view");
      }
      break;
    default:
      navigate("/");
      break;
  }
};
