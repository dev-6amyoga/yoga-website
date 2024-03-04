import { Card } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
export default function EmailVerification() {
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [invite, setInvite] = useState(null);
  const [expired, setExpired] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setToken(() => {
      if (location.search.includes("?token=")) {
        console.log(
          "IN EMAIL VERIFICATION WITH : ",
          location.search.split("?token=")[1]
        );
        return location.search.split("?token=")[1];
      } else {
        return null;
      }
    });
  }, [location]);
  useEffect(() => {
    if (token) {
      Fetch({
        url: "/invite/get-email-verification-by-token",
        method: "POST",
        data: {
          token: token,
        },
      }).then((res) => {
        if (res.status === 200) {
          setInvite(res.data.invite);
        }
        if (new Date(res.data.invite.expiry_date).getTime() < Date.now()) {
          setExpired(true);
        }
      });
    }
  }, [token]);

  const verifyEmail = async () => {
    if (invite) {
      Fetch({
        url: "/invite/email-verified",
        method: "POST",
        data: {
          token: token,
        },
      }).then((res) => {
        if (res.status === 200) {
          toast("Email Verified!");
        }
      });
    }
  };
  useEffect(() => {
    verifyEmail();
  }, [invite]);
  return (
    <div className="border rounded-lg p-4">
      <h1 className="text-center">Email Verification</h1>
      <div className="text-sm text-center">
        <div className="mb-4">
          {!expired ? (
            <div>
              {" "}
              <Card>
                <h2>
                  Your email has been verified! You may close this tab now.
                </h2>
              </Card>
            </div>
          ) : (
            <div>
              <Card>
                <h2>
                  You can no longer create your account; Contact the institute
                  owner
                </h2>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
