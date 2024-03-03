import { Button, Input, Table, Tag } from "@geist-ui/core";
import { Copy } from "@geist-ui/icons";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";
import InstitutePageWrapper from "../../../components/Common/InstitutePageWrapper";
import { ROLE_INSTITUTE_OWNER } from "../../../enums/roles";
import { USER_PLAN_ACTIVE } from "../../../enums/user_plan_status";
import useUserStore from "../../../store/UserStore";
import { Fetch } from "../../../utils/Fetch";
import { validateEmail, validatePhone } from "../../../utils/formValidation";
import getFormData from "../../../utils/getFormData";
import { withAuth } from "../../../utils/withAuth";
import { getFrontendDomain } from "../../../utils/getFrontendDomain";

function AddNewTeacher() {
  const [currentTeachersCount, setCurrentTeachersCount] = useState([]);
  const [allowedTeachersCount, setAllowedTeachersCount] = useState(0);
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );
  useEffect(() => {
    console.log(user.user_id);
    Fetch({
      url: "/user-plan/get-user-institute-plan-by-id",
      method: "POST",
      data: {
        user_id: user.user_id,
        institute_id: currentInstituteId,
      },
    }).then((res) => {
      for (var i = 0; i !== res.data.userplans.length; i++) {
        if (res.data.userplans[i].current_status === USER_PLAN_ACTIVE) {
          setAllowedTeachersCount(
            res.data.userplans[i]?.plan?.number_of_teachers
          );
          break;
        } else {
          toast(
            "You dont have an active plan! Please head to the Purchase A Plan page"
          );
        }
      }
    });
  }, [currentInstituteId, user]);

  const [instituteData, setInstituteData] = useState({});
  const [currentInstitute, setCurrentInstitute] = useState(null);
  useState(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);
  const [invites, setInvites] = useState([]);
  const [addLoading, setAddLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const getInvites = useCallback(async () => {
    if (user) {
      setRefreshLoading(true);
      Fetch({
        url: "/invite/get-all-by-inviterid",
        method: "POST",
        data: {
          inviter_user_id: user?.user_id,
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
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      Fetch({
        url: "/institute/teacher/get-all-by-instituteid",
        method: "POST",
        data: {
          institute_id: currentInstituteId,
        },
      }).then((res) => {
        setCurrentTeachersCount(
          res.data.teachers ? res.data.teachers.length : 0
        );
      });
    };
    if (currentInstituteId && currentInstituteId !== 0) {
      fetchData();
    }
  }, [currentInstituteId]);
  useEffect(() => {
    getInvites();
  }, [getInvites]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    const formData = getFormData(e);
    if (currentTeachersCount === allowedTeachersCount) {
      toast(
        "You cannot add more teachers as this is the maximum permitted by your plan. Kindly upgrade your plan."
      );
      return;
    }
    if (currentTeachersCount > allowedTeachersCount) {
      toast(
        "You cannot add more teachers as this is the maximum permitted by your plan. Kindly upgrade your plan."
      );
    }

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

    if (!formData.phone.startsWith("+91")) {
      formData.phone = "+91" + formData.phone;
    }

    formData.invite_type = "TEACHER";
    formData.user_id = user?.user_id;
    Fetch({
      url: "/invite/create",
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
      url: "/invite/retract",
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
      url: "/invite/resend",
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
        `${getFrontendDomain()}/teacher/invite?token=${token}`
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
        <form className="my-8 flex flex-col gap-2" onSubmit={handleSubmit}>
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
          <div className="flex w-full flex-row gap-2">
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
        <div className="flex items-center justify-between">
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

export default withAuth(AddNewTeacher, ROLE_INSTITUTE_OWNER);
