import Fetch from "../utils/Fetch";

export class UserPlanAPI {
	static async postUserPlanTeacherInstitutePlan(institute_id) {
		try {
			const response = await Fetch({
				url: "/user-plan/get-teacher-institute-plan",
				method: "POST",
				token: true,
				data: {
					institute_id: institute_id,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {}
	}
}
