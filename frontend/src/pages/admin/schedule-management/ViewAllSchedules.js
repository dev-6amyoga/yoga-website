import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { withAuth } from "../../../utils/withAuth";
import { useEffect } from "react";
import { toast } from "react-toastify";

function ViewAllSchedules() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:4000/schedule/getAllSchedules"
        );
        const data = await response.json();
        console.log(data);
      } catch (error) {
        toast(error);
      }
    };
    fetchData();
  }, []);
  return (
    <AdminPageWrapper heading="Schedule Management - View All"></AdminPageWrapper>
  );
}

export default withAuth(ViewAllSchedules, ROLE_ROOT);
