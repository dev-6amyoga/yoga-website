import Auth from "../pages/auth/Auth";
import EmailVerification from "../pages/email-verify/EmailVerification";
import Otp from "../pages/otp/Otp";
import UpdateScreen from "../pages/student/UpdateScreen";
import ForgotPassword from "../components/forgot-password/ForgotPassword";
export const AuthRoutes = [
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/auth/otp-phone",
    element: <Otp />,
  },
  {
    path: "auth/verify-email",
    element: <EmailVerification />,
  },
  {
    path: "/user/forgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "auth/update-email",
    element: <UpdateScreen />,
  },
];
