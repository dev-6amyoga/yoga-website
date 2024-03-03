export const getFrontendDomain = () => {
  return process.env.REACT_APP_FRONTEND_DOMAIN || "http://localhost:3000";
};
