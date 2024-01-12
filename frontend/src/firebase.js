import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAKqOliSZPwroDokdMhHfz-hF3Hk8HVb1M",
  authDomain: "otp-6amyoga.firebaseapp.com",
  projectId: "otp-6amyoga",
  storageBucket: "otp-6amyoga.appspot.com",
  messagingSenderId: "500272326176",
  appId: "1:500272326176:web:f4afa9eadd47f8d0b97e45",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
