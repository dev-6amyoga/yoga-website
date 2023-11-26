import { GoogleOAuthProvider } from "@react-oauth/google";
import Login_page from "./login_page";

export default function LoginGoogle() {
  return (
    <div>
      <GoogleOAuthProvider clientId="749892759088-nn2uoltojfs74js4vhe4gps6lfoiuqet.apps.googleusercontent.com">
        <Login_page />
      </GoogleOAuthProvider>
    </div>
  );
}
