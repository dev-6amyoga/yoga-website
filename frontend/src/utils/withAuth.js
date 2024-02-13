import { useEffect } from "react";
import { useHref, useLocation, useNavigate } from "react-router-dom";
import {
	ROLE_INSTITUTE_ADMIN,
	ROLE_INSTITUTE_OWNER,
	ROLE_ROOT,
	ROLE_STUDENT,
	ROLE_TEACHER,
} from "../enums/roles";
import useUserStore from "../store/UserStore";

export const withAuth = (Component, role = null) => {
	switch (role) {
		case ROLE_ROOT:
		case ROLE_INSTITUTE_OWNER:
		case ROLE_INSTITUTE_ADMIN:
		case ROLE_TEACHER:
		case ROLE_STUDENT:
			break;
		default:
			if (role === null) {
				break;
			} else {
				throw new Error("Invalid Role");
			}
	}

	return function AuthenticatedComponent(props) {
		const [user, currentRole] = useUserStore((state) => [
			state.user,
			state.currentRole,
		]);
		const navigate = useNavigate();
		const location = useLocation();

		useEffect(() => {
			if (!user) {
				navigate("/auth");
			}
		}, [user, navigate]);

		useEffect(() => {
			if (currentRole !== role) {
				navigate("/unauthorized", {
					state: { from: location.pathname },
				});
			}
		}, [currentRole, location, navigate]);

		return <Component {...props} />;
	};
};
