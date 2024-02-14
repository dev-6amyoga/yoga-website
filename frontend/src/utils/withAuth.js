import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
		const [show, setShow] = useState(false);

		useEffect(() => {
			// if not user
			if (!user) {
				// if role is null, show the component
				if (role === null) {
					setShow(true);
					return;
				} else if (currentRole !== role) {
					// if role is not null, and current role is not equal to role, navigate to unauthorized
					navigate("/unauthorized", {
						state: { from: location.pathname },
					});
					return;
				} else if (currentRole === role) {
					// if role is not null, and current role is equal to role, show the component
					navigate("/auth");
					return;
				}
			}
			setShow(true);
		}, [user, currentRole, location, navigate]);

		return <>{show ? <Component {...props} /> : <></>}</>;
	};
};
