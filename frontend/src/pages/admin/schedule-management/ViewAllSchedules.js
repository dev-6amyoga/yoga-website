import { useEffect } from "react";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";

function ViewAllSchedules() {
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/schedule/getAllSchedules",
				});
				const data = response.data;
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
