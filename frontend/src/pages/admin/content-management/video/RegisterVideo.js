import AdminPageWrapper from "../../../../components/Common/AdminPageWrapper";
import RegisterVideoForm from "../../../../components/content-management/forms/RegisterVideoForm";
import { ROLE_ROOT } from "../../../../enums/roles";
import { withAuth } from "../../../../utils/withAuth";

function RegisterVideo() {
	return (
		<AdminPageWrapper heading="Content Management - Register Video">
			<RegisterVideoForm />
		</AdminPageWrapper>
	);
}

export default withAuth(RegisterVideo, ROLE_ROOT);
