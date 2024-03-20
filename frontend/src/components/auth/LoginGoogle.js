import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/UserStore";
import { getBackendDomain } from "../../utils/getBackendDomain";
import { Fetch } from "../../utils/Fetch";
import { useShallow } from "zustand/react/shallow";
export default function LoginGoogle() {
  const [loginStatus, setLoginStatus] = useState(null);
  const navigate = useNavigate();
  const [type, SetType] = useState("");
  const [setUser, setCurrentRole] = useUserStore(
    useShallow((state) => [state.setUser, state.setCurrentRole])
  );
  const [clientID, setClientID] = useState("");

  useEffect(() => {
    setClientID(process.env.REACT_APP_GOOGLE_CLIENT_ID);
  }, []);

  async function verify_login(email, name) {
    try {
      const baseURL = getBackendDomain();
      const response = await axios.post(`${baseURL}/user/get-by-email`, {
        email: email,
      });
      var userExists = false;
      if (response?.status === 200) {
        userExists = true;
        console.log(response.data);
        setUser(response.data.user);
        const roleFetcher = await Fetch({
          url: "/user/get-role-by-user-id",
          method: "POST",
          data: {
            user_id: response.data.user?.user_id,
          },
        });
        const data = roleFetcher.data;
        let maxRole = 0;
        if (data) {
          for (var i = 0; i < data.user_role.length; i++) {
            if (data.user_role[i].role_id == 1) {
              maxRole = 1;
            }
          }
          if (maxRole !== 1) {
            maxRole = Math.max(...data.user_role.map((role) => role.role_id));
          }
          console.log("max", maxRole);
          if (maxRole === 5) {
            SetType("student");
          }
          if (maxRole === 4) {
            SetType("teacher");
          }
          if (maxRole === 3) {
            SetType("institute_admin");
          }
          if (maxRole === 1) {
            setCurrentRole("ROOT");
            SetType("root");
          }
        }
      }
      setLoginStatus(userExists ? "Login successful" : "Invalid credentials");
    } catch (error) {
      console.error(error);
      setLoginStatus("Failed to verify login");
    }
  }

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
            const baseURL = getBackendDomain();
            const payload = await axios.post(`${baseURL}/auth/verify-google`, {
              client_id: clientID,
              jwtToken: jwt_token,
            });
            const email_verified = payload.data.email_verified;
            if (email_verified) {
              const email = payload.data.email;
              const name = payload.data.name;
              verify_login(email, name);
            } else {
            }
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
