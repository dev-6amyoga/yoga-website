import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherPageWrapper from "../../components/Common/TeacherPageWrapper";
import useUserStore from "../../store/UserStore";
export default function TeacherHome() {
	const navigate = useNavigate();
	let user = useUserStore((state) => state.user);
	const institutes = useUserStore((state) => state.institutes);
	let currentInstituteId = useUserStore((state) => state.currentInstituteId);
	const [currentInstitute, setCurrentInstitute] = useState(null);
	useEffect(() => {
		if (currentInstituteId) {
			setCurrentInstitute(
				institutes?.find(
					(institute) => institute.institute_id === currentInstituteId
				)
			);
		}
	}, [currentInstituteId, institutes]);
	// const { instituteOwnerId, userPlan } = usePlanAllocator(
	//     user?.user_id,
	//     currentInstituteId
	// )
	return (
		<TeacherPageWrapper>
			<h1>Welcome, {user?.name}</h1>
			<h3>Welcome to {currentInstitute?.name}</h3>
		</TeacherPageWrapper>
	);
}
