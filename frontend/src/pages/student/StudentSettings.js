import { Tabs } from "@geist-ui/core";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import ChangePassword from "../../components/student/UserSettings/ChangePassword";
import GeneralSettings from "../../components/student/UserSettings/GeneralSettings";
import { ROLE_STUDENT } from "../../enums/roles";
import { withAuth } from "../../utils/withAuth";

function StudentSettings() {
	// const user = useUserStore((state) => state.user);
	return (
		<StudentPageWrapper heading="Settings">
			<div className="max-w-7xl mx-auto">
				<Tabs initialValue="general" className="">
					<Tabs.Item label="General" value="general">
						<GeneralSettings />
					</Tabs.Item>
					<Tabs.Item label="Change Password" value="password">
						<ChangePassword />
					</Tabs.Item>
				</Tabs>
			</div>
		</StudentPageWrapper>
	);
}

export default withAuth(StudentSettings, ROLE_STUDENT);
