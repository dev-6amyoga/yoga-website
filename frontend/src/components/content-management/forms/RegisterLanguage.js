import { Button, Card, Input, Text } from "@geist-ui/core";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROLE_ROOT } from "../../../enums/roles";
import { Fetch } from "../../../utils/Fetch";
import { withAuth } from "../../../utils/withAuth";
import AdminPageWrapper from "../../Common/AdminPageWrapper";
import "./RegisterVideoForm.css";

function RegisterLanguageForm() {
	const navigate = useNavigate();
	const notify = () => toast("Enter a valid language!");
	const [tableLanguages, setTableLanguages] = useState([]);
	const [found, setFound] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/content/language/getAllLanguages",
				});
				const data = response.data;
				setTableLanguages(data);
			} catch (error) {
				console.log(error);
			}
		};
		fetchData();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const language = document.querySelector("#language").value;
		if (language === "") {
			notify();
		} else {
			for (var lang in tableLanguages) {
				if (lang.language === language) {
					setFound(true);
					break;
				}
			}
			if (found) {
				console.log("Already exists!");
			} else {
				const newLanguage = {
					language: language,
				};
				console.log(newLanguage);
				try {
					const response = await Fetch({
						url: "/content/language/addLanguage",
						method: "POST",
						data: newLanguage,
					});

					if (response?.status === 200) {
						console.log("New Language added successfully");
						navigate("/admin/language/view-all");
					} else {
						console.error("Failed to add new Language");
					}
				} catch (error) {
					console.error("Error while making the request:", error);
				}
			}
		}
	};

	return (
		<AdminPageWrapper heading="Content Management - Register Language">
			<Card>
				<form
					className="flex flex-col gap-1 mx-auto bg-white"
					onSubmit={handleSubmit}>
					<br />
					<Card>
						<Text span style={{ color: "#949392" }}>
							Existing Languages:
						</Text>
						{tableLanguages &&
							tableLanguages.map((language) => (
								<Text style={{ color: "#949392" }}>
									{language.language}
								</Text>
							))}
					</Card>
					<br />
					<Text h5>New Language:</Text>
					<Input width="100%" id="language"></Input>
					<br />
					<Button htmlType="submit">Submit</Button>
				</form>
			</Card>
		</AdminPageWrapper>
	);
}

export default withAuth(RegisterLanguageForm, ROLE_ROOT);
