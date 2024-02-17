// http://localhost:4000/content/asana/addAsanaCategory

import { Button, Card, Input, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ROLE_ROOT } from "../../../enums/roles";
import getFormData from "../../../utils/getFormData";
import { withAuth } from "../../../utils/withAuth";
import AdminPageWrapper from "../../Common/AdminPageWrapper";
import "./RegisterVideoForm.css";

function RegisterNewCategoryForm() {
	const navigate = useNavigate();
	const [categories, setCategories] = useState([]);
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					"http://localhost:4000/content/asana/getAllAsanaCategories"
				);
				const data = await response.json();
				setCategories(data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const formData = getFormData(e);
		console.log(formData);

		if (formData.asana_category === "") {
			toast("Missing required fields!");
		} else {
			const categoryExists = categories.some(
				(category) =>
					formData.asana_category === category.asana_category
			);
			if (categoryExists) {
				toast("Entered category already exists!");
			} else {
				try {
					const response = await fetch(
						"http://localhost:4000/content/asana/addAsanaCategory",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(formData),
						}
					);

					if (response.ok) {
						toast("New Category added successfully");
						navigate("/admin/asana-category/all");
					} else {
						toast("Failed to add new category");
					}
				} catch (error) {
					console.error("Error while making the request:", error);
				}
			}
		}
	};

	return (
		<AdminPageWrapper heading="Content Management - Register New Asana Category">
			<Card>
				<form className="flex flex-col gap-1" onSubmit={handleSubmit}>
					<br />
					<Card>
						<Text span style={{ color: "#949392" }}>
							Existing Asana Categories :
						</Text>
						{categories &&
							categories.map((x) => (
								<Text style={{ color: "#949392" }}>
									{x.asana_category}
								</Text>
							))}
					</Card>
					<br />
					<Text h5>New Asana Category:</Text>
					<Input width="100%" name="asana_category"></Input>
					<br />
					<Button htmlType="submit">Submit</Button>
				</form>
			</Card>
		</AdminPageWrapper>
	);
}

export default withAuth(RegisterNewCategoryForm, ROLE_ROOT);
