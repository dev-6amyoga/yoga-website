import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageWrapper from "../../components/Common/PageWrapper";
import Login from "../login/login";
import Register from "../register/register";
import "./Auth.css";

export default function Auth() {
	const location = useLocation();
	const [loginOpen, setLoginOpen] = useState(true);

	useEffect(() => {
		if (location.state) {
			// console.log(location.state);
			setLoginOpen(
				location?.state?.login !== undefined
					? location?.state?.login
					: false
			);
		}
	}, [location]);

	return (
		<PageWrapper>
			<div className="bg-y-white min-h-screen grid place-items-center">
				{loginOpen ? (
					<div className="p-4 lg:p-20">
						<Login switchForm={setLoginOpen} />
					</div>
				) : (
					<div className="p-4 lg:p-20">
						<Register switchForm={setLoginOpen} />
					</div>
				)}
			</div>
		</PageWrapper>
	);
}
