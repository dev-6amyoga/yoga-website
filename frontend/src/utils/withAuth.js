import { CircularProgress } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
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

export const withAuth = (Component, ...roles) => {
  const isRoleValid = roles.every((role) => {
    if (
      role !== ROLE_INSTITUTE_ADMIN &&
      role !== ROLE_INSTITUTE_OWNER &&
      role !== ROLE_STUDENT &&
      role !== ROLE_TEACHER &&
      role !== ROLE_ROOT &&
      role !== null
    ) {
      return false;
    }
    return true;
  });

  return function AuthenticatedComponent(props) {
    const [user, currentRole] = useUserStore((state) => [
      state.user,
      state.currentRole,
    ]);

    const queryClient = useQueryClient();

    const navigate = useNavigate();
    const location = useLocation();
    const [show, setShow] = useState(false);
    const [finishedLoading, setFinishLoading] = useState(false);

    useEffect(() => {
      const t = setInterval(() => {
        setFinishLoading(true);
      }, 1000);

      return () => {
        clearInterval(t);
      };
    }, []);

    useEffect(() => {
      // console.log("withAuth : userChanged");
      // if user is there, check if role is valid
      if (finishedLoading) {
        if (user) {
          // console.log(user, "IN WITH AUTH");
          // console.log(roles, " IN WITH AUTH");
          // console.log(currentRole, "IN WITH AUTH");
          // if role is null, show the component [authenticated+public]
          if (roles.includes(null)) {
            setShow(true);
            return;
          } else if (!roles.includes(currentRole)) {
            // if role is not null, and current role is not equal to role, navigate to unauthorized
            navigate("/unauthorized", {
              state: { from: location.pathname },
            });
            return;
          }
          setShow(true);
        } else {
          if (queryClient.isFetching({ queryKey: ["user"] })) {
            // alert("fetching");
            console.log("fetching");
            setFinishLoading(false);
            return;
          }

          setShow(false);
          if (location && location.pathname !== "/auth") {
            navigate("/auth?login=true", {
              state: { login: true, from: location.pathname },
            });
          }
          return;
        }
      }
    }, [user, currentRole, location, navigate, finishedLoading]);

    // useEffect(() => {
    // 	console.log("withAuth : userChanged");
    // }, [user]);

    return (
      <>
        {show ? (
          <Component {...props} />
        ) : (
          <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-white flex items-center justify-center">
            <CircularProgress variant="indeterminate" />
          </div>
        )}
      </>
    );
  };
};
