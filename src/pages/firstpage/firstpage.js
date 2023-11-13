import Login from "../login/login";
import Register from "../register/register";
import LoginGoogle from "../login/login_google";
import "./firstpage.css";

export default function Firstpage() {
  return (
    <div className="firstpage">
      <div className="notGoogle">
        <div className="registerWrapper">
          <Register />
        </div>
        <div className="loginWrapper">
          <Login />
        </div>
      </div>
      <div className="googleWrapper">
        <LoginGoogle />
      </div>
    </div>
  );
}
