export const getBackendDomain = () => {
  return process.env.REACT_APP_BACKEND_DOMAIN || "http://localhost:4000";
};
