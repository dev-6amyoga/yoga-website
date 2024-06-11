import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import PageWrapper from "../../components/Common/PageWrapper";
import Login from "../login/login";
import Register from "../register/register";
import "./Auth.css";

export default function Auth() {
	const location = useLocation();
	const [loginOpen, setLoginOpen] = useState(true);
	const [searchParams, _] = useSearchParams();

	useEffect(() => {
		if (location.state) {
			// console.log(location.state);
			setLoginOpen(
				location?.state?.login !== undefined
					? location?.state?.login
					: false
			);
		}

		if (searchParams.get("login") === "true") {
			setLoginOpen(true);
		}
		if (searchParams.get("register") === "true") {
			setLoginOpen(false);
		}
	}, [location, searchParams]);

	return (
		<PageWrapper>
			<div className="min-h-screen grid place-items-center">
				{loginOpen ||
				searchParams.get("login") === "true" ||
				!(searchParams.get("register") === "true") ? (
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
