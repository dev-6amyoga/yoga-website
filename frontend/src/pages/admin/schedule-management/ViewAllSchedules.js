import AdminNavbar from "../../../components/Common/AdminNavbar/AdminNavbar";
import { ROLE_ROOT } from "../../../enums/roles";
import { withAuth } from "../../../utils/withAuth";

function ViewAllSchedules() {
	return (
		<div className="video_form min-h-screen">
			<AdminNavbar />
			<div className="flex justify-center my-10 gap-8">
				View All Schedules
			</div>
		</div>
	);
}

export default withAuth(ViewAllSchedules, ROLE_ROOT);
