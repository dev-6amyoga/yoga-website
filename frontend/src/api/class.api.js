import { Fetch } from "../utils/Fetch";

export class ClassAPI {
	static async postCreateClass(
		class_name,
		class_desc,
		class_type,
		recurrance_type,
		recurrance_days = [],
		onetime_class_start_time = null,
		onetime_class_end_time = null,
		recurring_class_start_time = null,
		recurring_class_end_time = null,
		recurring_class_timezone = null,
		teacher_id,
		allowed_students = []
	) {
		try {
			const response = await Fetch({
				url: "/class/create",
				method: "POST",
				data: {
					class_name,
					class_desc,
					class_type,
					recurrance_type,
					recurrance_days,
					onetime_class_start_time,
					onetime_class_end_time,
					recurring_class_start_time,
					recurring_class_end_time,
					recurring_class_timezone,
					teacher_id,
					allowed_students,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postUpdateClass(
		class_id,
		class_name,
		class_desc,
		status,
		teacher_id,
		old_start_time,
		old_end_time,
		start_time,
		end_time
	) {
		try {
			const response = await Fetch({
				url: "/class/update",
				method: "POST",
				data: {
					class_id: class_id,
					class_name: class_name,
					class_desc: class_desc,
					status: status,
					teacher_id: teacher_id,
					old_start_time,
					old_end_time,
					start_time: start_time,
					end_time: end_time,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postGetClassById(class_id) {
		try {
			const response = await Fetch({
				url: "/class/get-by-id",
				method: "POST",
				data: {
					class_id: class_id,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postGetClasses() {
		try {
			const response = await Fetch({
				url: "/class/get-all",
				method: "POST",
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postStartClass(class_id) {
		try {
			const response = await Fetch({
				url: "/class/start",
				method: "POST",
				data: {
					class_id: class_id,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postEndClass(class_id, status) {
		try {
			const response = await Fetch({
				url: "/class/end",
				method: "POST",
				data: {
					class_id: class_id,
					status: status,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postGetLatestClassHistoryById(class_id) {
		try {
			const response = await Fetch({
				url: "/class/get-latest-history",
				method: "POST",
				data: {
					class_id: class_id,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postGetClassHistoryById(class_id) {
		try {
			console.log("GETTING HISTORY : ", class_id);
			const response = await Fetch({
				url: "/class/get-history",
				method: "POST",
				data: {
					class_id: class_id,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}

	static async postUpdateClassHistoryStatus(class_history_id, status) {
		try {
			const response = await Fetch({
				url: "/class/update-history-status",
				method: "POST",
				data: {
					class_history_id: class_history_id,
					status: status,
				},
			});

			if (response.status === 200) {
				return [response.data, null];
			} else {
				return [null, response.data];
			}
		} catch (err) {
			return [null, err];
		}
	}
}
