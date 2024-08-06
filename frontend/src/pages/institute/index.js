import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import InstitutePageWrapper from "../../components/Common/InstitutePageWrapper";
import { ROLE_INSTITUTE_ADMIN } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { Fetch } from "../../utils/Fetch";
import { withAuth } from "../../utils/withAuth";

function InstituteHome() {
  let [user, institutes, currentInstituteId] = useUserStore((state) => [
    state.user,
    state.institutes,
    state.currentInstituteId,
  ]);
  const [instituteData, setInstituteData] = useState({});
  const [currentInstitute, setCurrentInstitute] = useState(null);

  useEffect(() => {
    // console.log(user);
    const fetchData = async (id) => {
      console.log("CALLING", id);
      if (id) {
        Fetch({
          url: "/institute/get-by-instituteid",
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
      }
    };
    if (currentInstitute && currentInstitute.institute_id != null) {
      fetchData(currentInstitute?.institute_id);
    }
  }, [currentInstitute]);

  useEffect(() => {
    console.log({ currentInstituteId, institutes });
    if (
      currentInstituteId !== null &&
      currentInstituteId !== undefined &&
      institutes
    ) {
      setCurrentInstitute(() => {
        const ins = institutes?.find(
          (institute) => institute?.institute_id === currentInstituteId
        );
        console.log("Setting institute in ins home: ", ins);
        return ins;
      });
    }
  }, [currentInstituteId, institutes]);

  return (
    <InstitutePageWrapper heading="Institute Dashboard">
      <h2 className="">Welcome to 6AM Yoga</h2>

      <div className="my-10 rounded-lg border p-4">
        <h3>Institute Info {currentInstituteId}</h3>
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

export default withAuth(InstituteHome, ROLE_INSTITUTE_ADMIN);
