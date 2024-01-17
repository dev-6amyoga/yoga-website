import { CssBaseline, GeistProvider, Select } from "@geist-ui/core";
import React, { useEffect } from "react";
import { useCookies } from "react-cookie";
import ReactDOM from "react-dom/client";
import "react-phone-number-input/style.css";
import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { AdminRoutes } from "./routes/AdminRoutes";
import { AuthRoutes } from "./routes/AuthRoutes";
import { GeneralRoutes } from "./routes/GeneralRoutes";
import { InstituteRoutes } from "./routes/InstituteRoutes";
import { StudentRoutes } from "./routes/StudentRoutes";
import { TeacherRoutes } from "./routes/TeacherRoutes";
import { TestingRoutes } from "./routes/TestingRoutes";
import useUserStore from "./store/UserStore";
import { Fetch } from "./utils/Fetch";
import { useShallow } from "zustand/react/shallow";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
  ...GeneralRoutes,
  ...AuthRoutes,
  ...AdminRoutes,
  ...InstituteRoutes,
  ...StudentRoutes,
  ...TeacherRoutes,
  ...TestingRoutes,
]);

function LoginIndex() {
  const [cookies, setCookie, removeCookie] = useCookies([
    "6amyoga_access_token",
    "6amyoga_refresh_token",
  ]);

  const [
    user,
    setUser,
    userPlan,
    setUserPlan,
    setAccessToken,
    setRefreshToken,
    setCurrentInstituteId,
    setInstitutes,
    currentRole,
    setCurrentRole,
    setRoles,
  ] = useUserStore(
    useShallow((state) => [
      state.user,
      state.setUser,
      state.userPlan,
      state.setUserPlan,
      state.setAccessToken,
      state.setRefreshToken,
      state.setCurrentInstituteId,
      state.setInstitutes,
      state.currentRole,
      state.setCurrentRole,
      state.setRoles,
    ])
  );

  useEffect(() => {
    // check for user tokens and log them in
    if (!user) {
      // console.log(cookies["6amyoga_access_token"]);
      // console.log(cookies["6amyoga_refresh_token"]);

      const access_token = cookies["6amyoga_access_token"];
      const refresh_token = cookies["6amyoga_refresh_token"];

      if (access_token && refresh_token) {
        // validate tokens

        Fetch({
          url: "http://localhost:4000/auth/verify-tokens",
          method: "POST",
          data: {
            access_token: access_token,
            refresh_token: refresh_token,
          },
        })
          .then((res) => {
            console.log({
              verifyTokenResponse: res?.data?.message,
            });
            if (res.status === 200 && res?.data?.message === "Token verified") {
              // get user from token
              Fetch({
                url: "http://localhost:4000/user/get-by-token",
                method: "POST",
                data: {
                  access_token: access_token,
                },
              })
                .then((res) => {
                  if (res.status === 200) {
                    const userData = res.data;
                    // console.log(userData);
                    setUser(userData.user);
                    // setUserType(userData.user.role.name);
                    setAccessToken(userData?.accessToken);
                    setRefreshToken(userData?.refreshToken);

                    setRoles(userData?.user?.roles);

                    const currRole = Object.keys(userData?.user?.roles)[0];
                    // use first role as current role
                    setCurrentRole(currRole);

                    const currPlan = userData?.user?.roles[currRole][0]?.plan;
                    setUserPlan(currPlan);

                    console.log(userData?.user?.roles[currRole]);
                    const ins = userData?.user?.roles[currRole].map(
                      (r) => r?.institute
                    );

                    setInstitutes(ins);

                    setCurrentInstituteId(ins[0]?.institute_id);

                    // console.log({
                    //   user: userData?.user,
                    //   roles: userData?.user?.roles,
                    //   accessToken: userData?.accessToken,
                    //   refreshToken: userData?.refreshToken,
                    //   currentRole: currRole,
                    //   userPlan: currPlan,
                    //   institutes: ins,
                    //   currentInstituteId: ins[0]?.institute_id,
                    // });

                    // set token cookies
                    setCookie("6amyoga_access_token", userData?.accessToken);
                    setCookie("6amyoga_refresh_token", userData?.refreshToken);
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            }
          })
          .catch((err) => {
            const errMsg = err?.response?.data?.message;
            console.log({ verifyTokenResponse: errMsg });

            switch (errMsg) {
              // access token expired
              case "Access token expired":
                // use refresh token to get new access token
                Fetch({
                  url: "http://localhost:4000/auth/refresh-token",
                  method: "POST",
                  data: {
                    refresh_token: refresh_token,
                  },
                })
                  .then((res) => {
                    if (res.status === 200) {
                      setAccessToken(res.data.accessToken);
                      setRefreshToken(refresh_token);
                      // set token cookies
                      setCookie("6amyoga_access_token", res.data.accessToken, {
                        domain: "localhost",
                        path: "/",
                      });
                      setCookie("6amyoga_refresh_token", refresh_token, {
                        domain: "localhost",
                        path: "/",
                      });
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                    // reset cookies
                    setAccessToken(null);
                    setRefreshToken(null);
                    removeCookie("6amyoga_access_token", {
                      domain: "localhost",
                      path: "/",
                    });
                    removeCookie("6amyoga_refresh_token", {
                      domain: "localhost",
                      path: "/",
                    });
                  });
                break;
              // refresh token expired
              // let them login again
              case "Refresh token expired":
                setAccessToken(null);
                setRefreshToken(null);
                removeCookie("6amyoga_access_token", {
                  domain: "localhost",
                  path: "/",
                });
                removeCookie("6amyoga_refresh_token", {
                  domain: "localhost",
                  path: "/",
                });
                break;
              // invalid response, let it go
              default:
                setAccessToken(null);
                setRefreshToken(null);
                removeCookie("6amyoga_access_token", {
                  domain: "localhost",
                  path: "/",
                });
                removeCookie("6amyoga_refresh_token", {
                  domain: "localhost",
                  path: "/",
                });
                break;
            }
          });
      }
    }
  }, [
    cookies,
    user,
    setUser,
    setAccessToken,
    setRefreshToken,
    setCookie,
    removeCookie,
  ]);

  return <></>;
}

function TemporaryRoleChanger() {
  const [
    userPlan,
    setUserPlan,
    setCurrentInstituteId,
    setInstitutes,
    currentRole,
    setCurrentRole,
    roles,
  ] = useUserStore(
    useShallow((state) => [
      state.userPlan,
      state.setUserPlan,
      state.setCurrentInstituteId,
      state.setInstitutes,
      state.currentRole,
      state.setCurrentRole,
      state.roles,
    ])
  );

  const handleRoleChange = (role) => {
    // console.log(val);
    const currRole = role;
    // use first role as current role

    const currPlan = roles[currRole][0]?.plan;
    setUserPlan(currPlan);

    console.log(roles[currRole]);
    const ins = roles[currRole].map((r) => r?.institute);

    setInstitutes(ins);

    setCurrentInstituteId(ins[0]?.institute_id);

    setCurrentRole(currRole);
  };

  return (
    <div className="absolute top-4 right-4 bg-slate-700 rounded-lg z-100 p-4">
      <p className="text-white text-center">Temporary Role Changer</p>
      <Select onChange={handleRoleChange} value={currentRole}>
        {Object.keys(roles).map((role) => {
          return (
            <Select.Option key={role} value={role}>
              {role}
            </Select.Option>
          );
        })}
      </Select>
    </div>
  );
}

function Index() {
  return (
    <>
      <GeistProvider>
        <CssBaseline />
        <RouterProvider router={router} />
        <ToastContainer />
        <LoginIndex />
        <TemporaryRoleChanger />
      </GeistProvider>
    </>
  );
}

// TODO : do we put back React.StrictMode
root.render(<Index />);

reportWebVitals();
