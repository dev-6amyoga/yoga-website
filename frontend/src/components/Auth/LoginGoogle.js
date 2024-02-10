import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/UserStore";

export default function LoginGoogle() {
  const [loginStatus, setLoginStatus] = useState(null);
  const navigate = useNavigate();
  const [type, SetType] = useState("");
  const setUser = useUserStore((state) => state.setUser);
  const [clientID, setClientID] = useState("");

  useEffect(() => {
    setClientID(process.env.REACT_APP_GOOGLE_CLIENT_ID);
  }, []);

  async function verify_login(email, name) {
    try {
      const baseURL = "http://localhost:4000";
      const response = await axios.post(`${baseURL}/user/get-by-email`, {
        email: email,
      });
      var userExists = false;
      if (response.status === 200) {
        userExists = true;
      }
      setUser(response.data.user);
      SetType(response.data.user_type);
      // for (const entry of response.data) {
      //   if (entry.user_name === name || entry.email_id === email) {
      //     userExists = true;
      //     SetType(entry.user_type);
      //     setUser(entry);
      //     break;
      //   }
      // }
      setLoginStatus(userExists ? "Login successful" : "Invalid credentials");
    } catch (error) {
      console.error(error);
      setLoginStatus("Failed to verify login");
    }
  }

  useEffect(() => {
    console.log(loginStatus, type);
    if (loginStatus === "Login successful" && type === "student") {
      navigate("/student");
    } else if (loginStatus === "Login successful" && type === "admin") {
      navigate("/admin");
    } else if (loginStatus === "Login successful" && type === "teacher") {
      navigate("/teacher");
    }
  }, [loginStatus, navigate]);

  return (
    <GoogleOAuthProvider clientId={clientID}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            const jwt_token = credentialResponse.credential
              ? credentialResponse.credential
              : null;
            const baseURL = "http://localhost:4000";
            const payload = await axios.post(`${baseURL}/auth/verify-google`, {
              client_id: clientID,
              jwtToken: jwt_token,
            });
            const email_verified = payload.data.email_verified;
            if (email_verified) {
              const email = payload.data.email;
              const name = payload.data.name;
              console.log(email, name);
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
