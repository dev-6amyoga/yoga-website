import { useState } from "react";
import Login from "../login/login";
import Register from "../register/register";
import "./Auth.css";

export default function Auth() {
	const [loginOpen, setLoginOpen] = useState(true);

	return (
		<div className="min-h-screen">
			<div className="h-20 bg-zinc-800 text-white">
				<h1 className="text-center">6AM Yoga</h1>
			</div>

			<div className="">
				{loginOpen ? (
					<div className="p-8 lg:p-20">
						<Login switchForm={setLoginOpen} />
					</div>
				) : (
					<div className="p-8 lg:p-20">
						<Register switchForm={setLoginOpen} />
					</div>
				)}
			</div>
		</div>
	);
}
