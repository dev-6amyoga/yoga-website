import Auth from "../pages/auth/Auth";
import Otp from "../pages/otp/Otp";
import EmailVerification from "../pages/email-verify/EmailVerification";
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
];
