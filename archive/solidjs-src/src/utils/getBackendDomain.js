export const getBackendDomain = () => {
	return import.meta.env.VITE_BACKEND_DOMAIN || "http://localhost:4000";
};
