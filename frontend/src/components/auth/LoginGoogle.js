import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";

export default function LoginGoogle() {
  const [loginStatus, setLoginStatus] = useState(null);
  const navigate = useNavigate();
  const [type, SetType] = useState("");
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
  const [clientID, setClientID] = useState("");

  useEffect(() => {
    setClientID(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  }, []);

  useEffect(() => {
    if (loginStatus === "Login successful" && type === "student") {
      navigate("/student/free-videos");
    } else if (loginStatus === "Login successful" && type === "root") {
      console.log("here!");
      navigate("/admin");
    } else if (loginStatus === "Login successful" && type === "teacher") {
      navigate("/teacher");
    } else if (
      loginStatus === "Login successful" &&
      type === "institute_admin"
    ) {
      navigate("/institute");
    }
  }, [loginStatus, type, navigate]);

  return (
    <GoogleOAuthProvider clientId={clientID}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const jwt_token = credentialResponse.credential
              ? credentialResponse.credential
              : null;

            const response = await Fetch({
              url: `/auth/login-google`,
              method: "POST",
              data: {
                client_id: clientID,
                jwtToken: jwt_token,
              },
            });
            if (response && response?.status === 200) {
              console.log("response is : ", response);
              if (response.data?.message === "User does not exist") {
                const googleName = response.data?.user.name;
                const googleEmail = response.data?.user.email;
                // navigate("/auth?register=true");
                navigate(
                  `/auth?register=true&googleName=${encodeURIComponent(googleName)}&googleEmail=${encodeURIComponent(googleEmail)}`
                );
              } else {
                const userData = response.data;
                setUser(userData.user);
                setAccessToken(userData?.accessToken);
                setRefreshToken(userData?.refreshToken);
                setRoles(userData?.user?.roles);
                const currRole = Object.keys(userData?.user?.roles)[0];
                const currPlan = userData?.user?.roles[currRole][0]?.plan;
                setUserPlan(currPlan);
                console.log(userData?.user?.roles[currRole]);
                const ins = userData?.user?.roles[currRole].map(
                  (r) => r?.institute
                );
                setInstitutes(ins);
                setCurrentInstituteId(ins[0]?.institute_id);
                sessionStorage.setItem(
                  "6amyoga_access_token",
                  userData?.accessToken
                );
                sessionStorage.setItem(
                  "6amyoga_refresh_token",
                  userData?.refreshToken
                );

                // should navigate based on role
                setCurrentRole(currRole);
              }
            } else {
              const errorData = response.data;
              // removeCookie("6amyoga_access_token");
              // removeCookie("6amyoga_refresh_token");
              sessionStorage.removeItem("6amyoga_access_token");
              sessionStorage.removeItem("6amyoga_refresh_token");
              toast(errorData?.error, { type: "error" });
            }
          }}
          onError={() => {
            console.log("Login Failed");
          }}
          size="large"
        />
      </div>
    </GoogleOAuthProvider>
  );
}
