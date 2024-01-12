import Auth from "../pages/auth/Auth";
import Otp from "../pages/otp/Otp";
export const AuthRoutes = [
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/auth/otp-phone",
    element: <Otp />,
  },
];
