export const getFrontendDomain = () => {
	return import.meta.env.VITE_FRONTEND_DOMAIN || "http://localhost:3000";
};
