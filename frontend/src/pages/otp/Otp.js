import { ErrorBoundary } from "react-error-boundary";
import LoginPhone from "../../components/auth/LoginPhone";

export default function Otp({ onSuccessCallback }) {
  return (
    <ErrorBoundary onError={(err) => console.log(err)}>
      <LoginPhone onSuccessCallback={onSuccessCallback} />
    </ErrorBoundary>
  );
}
