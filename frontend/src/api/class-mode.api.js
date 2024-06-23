export class ClassModeAPI {
	static async postCreateClass(
		class_name,
		class_description,
		start_time,
		end_time
	) {
		try {
			const response = await Fetch({
				url: "/class-mode/create",
				method: "POST",
				data: {
					class_name: class_name,
					class_description: class_description,
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
				url: "/class-mode/get-by-id",
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
				url: "/class-mode/get-all",
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
}
