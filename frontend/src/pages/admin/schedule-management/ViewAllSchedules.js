import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import { ROLE_ROOT } from "../../../enums/roles";
import { withAuth } from "../../../utils/withAuth";

function ViewAllSchedules() {
	return (
		<AdminPageWrapper heading="Schedule Management - View All"></AdminPageWrapper>
	);
}

export default withAuth(ViewAllSchedules, ROLE_ROOT);
