import { Button } from "@geist-ui/core";
import React from "react";
import useUserStore from "../../store/UserStore";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
export default function TeacherHome() {
  let user = useUserStore((state) => state.user);
  const [instituteID, setInstituteID] = useState(0);
  const [institute, setInstitute] = useState({});
  //   const [addLoading, setAddLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  function sayHello() {
    console.log("Hello to you!");
  }
  const getInstituteID = useCallback(async () => {
    setRefreshLoading(true);
    Fetch({
      url: "http://localhost:4000/user-institute/get-institute-by-user-id",
      method: "POST",
      data: {
        user_id: user.user_id,
      },
    })
      .then((res) => {
        setInstituteID(res.data.user_institute.institute_id);
        Fetch({
          url: "http://localhost:4000/institute/get-by-instituteid",
          method: "POST",
          data: {
            institute_id: res.data.user_institute.institute_id,
          },
        })
          .then((res1) => {
            setInstitute(res1.data);
          })
          .catch((err) => {});
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
    getInstituteID();
  }, [getInstituteID]);

  //   useEffect(() => {
  //     getInstituteDetails();
  //   }, [getInstituteDetails]);

  return (
    <div>
      <h1>WELCOME {user.name}</h1>
      <h4>WELCOME TO {instituteID}</h4>
      <h4>{institute?.name}</h4>
      <Button onClick={sayHello}>Click me to say hello</Button>
    </div>
  );
}
