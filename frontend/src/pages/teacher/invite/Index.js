import { Button, Input, Tag } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../../utils/Fetch";
import getFormData from "../../../utils/getFormData";

function Card({ title, description }) {
  return (
    <div className="border rounded-lg p-4">
      <h1 className="text-center">{title}</h1>
      <p className="text-center">{description}</p>
    </div>
  );
}

function VerifyEmailCard({
  inviteToken,
  setConfirmEmail,
  handleAccept,
  handleReject,
  instituteName,
  expiryDiffSeconds,
}) {
  return (
    <div className="border rounded-lg p-4">
      <h1 className="text-center">Invite</h1>
      <div className="text-sm text-center">
        <div className="mb-4">
          <p>To join the institute : {instituteName}</p>
          <p>
            Invite Expires in :{" "}
            {expiryDiffSeconds < 86400
              ? `${(expiryDiffSeconds / 3600)?.toFixed(3)} Hours`
              : `${(expiryDiffSeconds / 86400)?.toFixed(3)} Days`}
          </p>
        </div>
      </div>

      <Input
        name="confirm_email"
        placeholder="Enter Email to verify"
        w="100%"
        className="mb-4"
        onChange={(e) => setConfirmEmail(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="success" onClick={handleAccept}>
          Accept
        </Button>
        <Button type="primary" onClick={handleReject}>
          Reject
        </Button>
      </div>
    </div>
  );
}

function UpdateDetailsCard({
  inviteToken,
  handleUpdateDetails,
  instituteName,
}) {
  return (
    <div className="border rounded-lg p-4">
      <h1 className="text-center">Invite</h1>
      <div className="text-sm text-center">
        {/* <p>Invite Token : {inviteToken}</p> */}
        <p>To join the institute : {instituteName}</p>
        <div className="mt-4">
          <Tag type="success" w="100%">
            Teacher Verified
          </Tag>
        </div>
      </div>

      <form className="flex flex-col gap-4 mt-4" onSubmit={handleUpdateDetails}>
        <p className="text-center font-bold">Update your login details!</p>
        <label for="username">
          Username
          <Input name="username" w="100%" />
        </label>
        <label htmlFor="new_password">
          Password
          <Input.Password name="new_password" w="100%" />
        </label>
        <label htmlFor="confirm_new_password">
          Confirm Password
          <Input.Password name="confirm_new_password" w="100%" />
        </label>
        <Button type="success" htmlType="submit">
          Submit
        </Button>
      </form>
    </div>
  );
}

export default function InvitePage() {
  const [token, setToken] = useState(null);
  const [invite, setInvite] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [used, setUsed] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setToken(() => {
      if (location.search.includes("?token=")) {
        return location.search.split("?token=")[1];
      } else {
        return null;
      }
    });
  }, [location]);

  useEffect(() => {
    if (token) {
      Fetch({
        url: "http://localhost:4000/invite/get-by-token",
        method: "POST",
        data: {
          token: token,
        },
      }).then((res) => {
        // console.log(res.data);
        if (res.status === 200) {
          setInvite(res.data.invite);

          if (res.data.invite.is_filled) {
            setUsed(true);
          }

          if (new Date(res.data.invite.expiry_date).getTime() < Date.now()) {
            setExpired(true);
          }

          if (res.data.invite.is_accepted) {
            setAccepted(true);
          }
        }
      });
    }
  }, [token]);

  const handleAccept = (e) => {
    e.preventDefault();

    Fetch({
      url: "http://localhost:4000/invite/accept",
      method: "POST",
      data: {
        invite_token: token,
        confirm_email: confirmEmail,
      },
    })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          setVerified(true);
          toast("Email Verified", { type: "success" });
        }
      })
      .catch((err) => {
        console.log(err);
        toast(err?.response?.data?.message, { type: "error" });
      });
  };

  const handleReject = (e) => {
    e.preventDefault();

    Fetch({
      url: "http://localhost:4000/invite/reject",
      method: "POST",
      data: {
        invite_token: token,
        confirm_email: confirmEmail,
      },
    })
      .then((res) => {
        // console.log(res);
        if (res.status === 200) {
          setUsed(true);
          setAccepted(false);
          toast("Invite Rejected", { type: "success" });
        }
      })
      .catch((err) => {
        console.log(err);
        toast(err?.response?.data?.message, { type: "error" });
      });
  };

  const handleUpdateDetails = (e) => {
    e.preventDefault();

    const formData = getFormData(e);
    console.log(formData);

    Fetch({
      url: "http://localhost:4000/invite/update-userdetails",
      method: "POST",
      data: {
        invite_token: token,
        ...formData,
      },
    })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          setAccepted(true);
          toast("Details Updated", { type: "success" });
          navigate("/auth");
        }
      })
      .catch((err) => {
        console.log(err);
        toast(err?.response?.data?.message, { type: "error" });
      });
  };

  const notUsedComponent = (
    <>
      {verified ? (
        // !expired !accepted !used verified
        <UpdateDetailsCard
          handleUpdateDetails={handleUpdateDetails}
          inviteToken={token}
          instituteName={invite?.institute_name}
        />
      ) : (
        // !expired !accepted !used !verified
        <VerifyEmailCard
          inviteToken={token}
          setConfirmEmail={setConfirmEmail}
          handleAccept={handleAccept}
          handleReject={handleReject}
          instituteName={invite?.institute_name}
          expiryDiffSeconds={
            (new Date(invite?.expiry_date).getTime() - Date.now()) / 1000
          }
        />
      )}
    </>
  );

  const acceptedComponent = (
    <>
      {!accepted ? (
        <Card
          title="You have rejected the invite"
          description="You can no longer create your account; Contact the institute owner"
        />
      ) : (
        // !expired accepted used
        <Card
          title="You have already created your account"
          description="You can no longer create your account; Contact the institute owner"
        />
      )}
    </>
  );

  return (
    <div className="grid place-content-center min-h-screen">
      {!expired ? (
        <>{!used ? <>{notUsedComponent}</> : <>{acceptedComponent}</>}</>
      ) : (
        <Card
          title="Invite Expired"
          description="You can no longer create your account; Contact the institute owner"
        />
      )}
    </div>
  );
}
