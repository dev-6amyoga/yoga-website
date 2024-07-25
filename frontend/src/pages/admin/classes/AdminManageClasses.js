import AdminPageWrapper from "../../../components/Common/AdminPageWrapper";
import ManageClasses from "../../class-mode/teacher/ManageClasses";

export default function AdminManageClasses() {
	return (
		<AdminPageWrapper heading={"Manage Classes"}>
			<ManageClasses />
		</AdminPageWrapper>
	);
}
