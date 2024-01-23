import { useState, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import InstitutePageWrapper from "../../components/Common/InstitutePageWrapper";
import useUserStore from "../../store/UserStore";
import { toast } from "react-toastify";
import { Fetch } from "../../utils/Fetch";
export default function InstituteHome() {
  const [user, institutes, currentInstituteId] = useUserStore(
    useShallow((state) => [
      state.user,
      state.institutes,
      state.currentInstituteId,
    ])
  );
  const [instituteData, setInstituteData] = useState({});
  const [currentInstitute, setCurrentInstitute] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/user-plan/get-user-plan-by-id",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: user?.user_id }),
          }
        );
        const data = await response.json();
        console.log(data?.userPlan?.plan?.number_of_teachers);
      } catch (error) {
        console.log(error);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // console.log(user);
    const fetchData = async (id) => {
      Fetch({
        url: "http://localhost:4000/institute/get-by-instituteid",
        method: "POST",
        data: {
          institute_id: id,
        },
      }).then((res) => {
        if (res && res.status === 200) {
          console.log(res.data);
          setInstituteData(res.data);
          // updateInstitute(res.data);
        } else {
          toast("Error fetching institute; retry", {
            type: "error",
          });
        }
      });
    };
    if (currentInstitute.institute_id != null) {
      fetchData(currentInstitute.institute_id);
    }
  }, [currentInstitute]);

  useState(() => {
    if (currentInstituteId) {
      setCurrentInstitute(
        institutes?.find(
          (institute) => institute.institute_id === currentInstituteId
        )
      );
    }
  }, [currentInstituteId, institutes]);

  return (
    <InstitutePageWrapper heading="Institute Dashboard">
      <h2 className="">Welcome to 6AM Yoga</h2>

      <div className="my-10 p-4 rounded-lg border">
        <h3>Institute Info</h3>
        <hr />
        <p>
          <strong>Owner Name: </strong> {user?.name}
        </p>
        <p>
          <strong>Institute Name: </strong>
          {currentInstitute?.name}
        </p>
        <p>
          <strong>Institute Email: </strong> {instituteData?.email}
        </p>
        <p>
          <strong>Institute Phone: </strong> {instituteData?.phone}
        </p>
        <p>
          <strong>Institute Address: </strong>
          {instituteData?.address1 + " " + instituteData?.address2}
        </p>
        <p>
          <strong>Institute Billing Address: </strong>
          {instituteData?.billing_address}
        </p>
      </div>
    </InstitutePageWrapper>
  );
}
