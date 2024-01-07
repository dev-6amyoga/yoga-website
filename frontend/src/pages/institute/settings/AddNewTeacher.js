import { Button, Input, Table, Tag } from "@geist-ui/core";
import { Copy } from "@geist-ui/icons";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validateEmail, validatePhone } from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";

export default function AddNewTeacher() {
  const user = useUserStore((state) => state.user);
  const [invites, setInvites] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const getInvites = useCallback(async () => {
    setRefreshLoading(true);
    Fetch({
      url: "http://localhost:4000/invite/get-all-by-inviterid",
      method: "POST",
      data: {
        inviter_user_id: user.user_id,
      },
    })
      .then((res) => {
        setInvites(res.data.invites);
        toast("Invites fetched successfully", { type: "success" });
        setRefreshLoading(false);
      })
      .catch((err) => {
        toast(`Error : ${err?.response?.data?.message}`, {
          type: "error",
        });
        setRefreshLoading(false);
      });
  }, [user.user_id]);

  useEffect(() => {
    getInvites();
  }, [getInvites]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    const formData = getFormData(e);

    if (!formData) return;

    if (!formData.name) {
      setAddLoading(false);
      toast("Teacher name is required", { type: "error" });
      return;
    }

    const [validEmail, emailError] = validateEmail(formData.email);

    if (!validEmail) {
      toast(emailError.message, { type: "error" });
      setAddLoading(false);
      return;
    }

    const [validPhone, phoneError] = validatePhone(formData.phone);

    if (!validPhone) {
      toast(phoneError.message, { type: "error" });
      setAddLoading(false);
      return;
    }

    formData.invite_type = "TEACHER";
    formData.user_id = user.user_id;

    // console.log(formData);

    Fetch({
      url: "http://localhost:4000/invite/create",
      method: "POST",
      data: formData,
    })
      .then((res) => {
        toast("Teacher added successfully", { type: "success" });
        e.target.reset();
        getInvites();
        setAddLoading(false);
      })
      .catch((err) => {
        toast(`Error : ${err?.response?.data?.message}`, {
          type: "error",
        });
        setAddLoading(false);
      });
  };

  const retractInvite = (setRetractLoading, invite_id, invite_token) => {
    setRetractLoading(true);
    Fetch({
      url: "http://localhost:4000/invite/retract",
      method: "POST",
      data: {
        invite_id: invite_id,
        invite_token: invite_token,
      },
    })
      .then((res) => {
        toast("Invite retracted successfully", {
          type: "success",
        });
        getInvites();
        setRetractLoading(false);
      })
      .catch((err) => {
        toast(`Error : ${err?.response?.data?.message}`, {
          type: "error",
        });
        setRetractLoading(false);
      });
  };

  const resendInvite = (setResendLoading, invite_id) => {
    setResendLoading(true);
    Fetch({
      url: "http://localhost:4000/invite/resend",
      method: "POST",
      data: {
        invite_id: invite_id,
      },
    })
      .then((res) => {
        toast("Invite sent successfully", {
          type: "success",
        });
        getInvites();
        setResendLoading(false);
      })
      .catch((err) => {
        toast(`Error : ${err?.response?.data?.message}`, {
          type: "error",
        });
        setResendLoading(false);
      });
  };

  const copyToClipboard = (token) => {
    try {
      navigator.clipboard.writeText(
        `http://localhost:3000/teacher/invite?token=${token}`
      );
      toast("Copied to clipboard", {
        type: "success",
      });
    } catch (err) {
      toast("Error copying to clipboard", {
        type: "error",
      });
    }
  };

  const InviteActions = ({ row }) => {
    const [resendLoading, setResendLoading] = useState(false);
    const [retractLoading, setRetractLoading] = useState(false);

    return (
      <div className="flex gap-2">
        <Button
          icon={<Copy />}
          scale={0.7}
          w={0.5}
          disabled={row.is_retracted || row.is_filled}
          onClick={() => copyToClipboard(row.token)}
        ></Button>
        <Button
          type="secondary"
          scale={0.7}
          w={0.5}
          disabled={row.is_retracted || row.is_accepted || row.is_filled}
          loading={resendLoading}
          onClick={() => {
            resendInvite(setResendLoading, row.invite_id);
          }}
        >
          Resend
        </Button>
        <Button
          type="error-light"
          scale={0.7}
          w={0.5}
          disabled={row.is_retracted || row.is_filled}
          loading={retractLoading}
          onClick={() =>
            retractInvite(setRetractLoading, row.invite_id, row.token)
          }
        >
          Retract
        </Button>
      </div>
    );
  };

  const renderInviteStatus = (value, row, index) => {
    return (
      <>
        {row.is_retracted ? (
          <Tag type="error">Retracted</Tag>
        ) : row.is_filled ? (
          <Tag type="success">Registered</Tag>
        ) : row.is_accepted ? (
          <Tag type="success">Accepted</Tag>
        ) : (
          <Tag type="warning">Pending</Tag>
        )}
      </>
    );
  };

  const renderExpiryStatus = (value, row, index) => {
    const diff = (new Date(row.expiry_date).getTime() - Date.now()) / 1000;
    return (
      <>
        <p>
          <span>
            {diff > 86400
              ? (diff / 86400).toFixed(2) + " Days"
              : diff > 0
              ? (diff / 3600).toFixed(2) + " Hours"
              : "Expired"}
          </span>
          <br />
          <span className="text-sm text-zinc-400">
            {new Date(row.expiry_date).toDateString()}
          </span>
        </p>
      </>
    );
  };

  return (
    <InstitutePageWrapper heading="Teacher Invite Management">
      <div className="card-base">
        <h3>Add a teacher</h3>
        <form className="flex flex-col gap-2 my-8" onSubmit={handleSubmit}>
          <Input width="100%" placeholder="John Doe" name="name" required>
            Teacher Name
          </Input>
          <Input
            width="100%"
            placeholder="teacher@gmail.com"
            name="email"
            required
          >
            Teacher Email ID
          </Input>
          <Input width="100%" placeholder="9876543210" name="phone" required>
            Teacher Phone Number
          </Input>
          <div className="flex flex-row gap-2 w-full">
            <Button
              className="flex-1"
              type="secondary"
              htmlType="submit"
              loading={addLoading}
            >
              Add
            </Button>
          </div>
        </form>
      </div>

      <div className="my-20">
        <div className="flex justify-between items-center">
          <h2>Invites</h2>
          <Button onClick={getInvites} loading={refreshLoading}>
            Refresh
          </Button>
        </div>
        <Table data={invites} emptyText="---">
          <Table.Column prop="invite_id" label="ID" />
          <Table.Column prop="email" label="Email" />
          <Table.Column prop="invite_type" label="Invite Type" />
          <Table.Column
            prop="status"
            label="Status"
            render={renderInviteStatus}
          />
          <Table.Column label="Expiry" render={renderExpiryStatus} />
          <Table.Column
            label="Actions"
            render={(_, row, index) => {
              return <InviteActions row={row} key={index} />;
            }}
          />
        </Table>
      </div>
    </InstitutePageWrapper>
  );
}
