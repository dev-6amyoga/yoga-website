import { Button, Card, Divider } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";

export default function UpdateScreen() {
  const location = useLocation();
  const [token, setToken] = useState(null);
  const [updateRequest, setUpdateRequest] = useState(null);
  const [userId, setUserId] = useState(0);
  const [userData, setUserData] = useState({});
  const [display, setDisplay] = useState(false);
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
        url: "/update-request/get-update-request-by-token",
        method: "POST",
        data: {
          token: token,
        },
      }).then((res) => {
        if (res.status === 200) {
          setUpdateRequest(res.data.request);
        }
      });
    }
  }, [token]);
  useEffect(() => {
    const fetchData = async () => {
      Fetch({
        url: "/user/get-by-email-and-name",
        method: "POST",
        data: {
          name: updateRequest?.name,
          email: updateRequest?.old_email,
        },
      })
        .then((res) => {
          if (res && res.status === 200) {
            setUserId(res.data.user.user_id);
            setUserData(res.data.user);
            console.log(res.data.user);
            setDisplay(true);
            toast("User fetched successfully", {
              type: "success",
            });
          } else {
            toast("Error fetching; retry", {
              type: "error",
            });
          }
        })
        .catch((err) => {
          toast("Error fetching: " + err?.response?.data?.error, {
            type: "error",
          });
        });
    };
    if (updateRequest) {
      fetchData();
    }
  }, [updateRequest]);

  const accepted = async () => {
    Fetch({
      url: "/user/update-email",
      method: "POST",
      data: {
        user_id: userId,
        email: updateRequest?.new_email,
      },
    })
      .then((res) => {
        if (res && res.status === 200) {
          toast("Email ID updated successfully, you may close this tab now.", {
            type: "success",
          });
        } else {
          toast("Error updating; retry", {
            type: "error",
          });
        }
      })
      .catch((err) => {
        toast("Error updating: " + err?.response?.data?.error, {
          type: "error",
        });
      });
  };
  return (
    <div className="bg-[#f0efed] min-h-screen">
      <div className="h-20 bg-zinc-800 text-white">
        <h1 className="text-center">6AM Yoga</h1>
      </div>

      <div className="">
        {" "}
        <div className="p-8 lg:p-20">
          {display && (
            <div>
              <Card>
                <Card.Content>
                  <h3 className="text-center">Update Email ID</h3>
                  <Divider />
                  <p className="text-center text-1xl font-bold text-black">
                    Update your Email ID from
                  </p>
                  <p className="text-center text-2xl font-bold text-blue-500">
                    {updateRequest?.old_email}
                  </p>
                  <p className="text-center text-1xl font-bold text-black">
                    to
                  </p>
                  <p className="text-center text-2xl font-bold text-blue-500">
                    {updateRequest?.new_email}
                  </p>
                  <Divider />
                  <div className="flex justify-center gap-4">
                    <Button onClick={accepted}>Yes</Button>
                    <Button>No</Button>
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
