import { Button } from "@geist-ui/core";
import { Link, useNavigate } from "react-router-dom";

export default function GeneralNavbar() {
	const navigate = useNavigate();
	return (
		<div className="h-16 bg-white text-black px-4 shadow-sm flex items-center justify-between">
			<div className="flex gap-4 items-center h-full">
				<img src="/logo_6am.png" alt="6AM Yoga Logo" className="h-6" />
				<h1 className="text-xl">My Yoga Teacher</h1>
			</div>
			<nav className="flex gap-4 items-center">
				<Link to="/" className="text-black">
					Home
				</Link>
				<Link to="/about" className="text-black">
					About
				</Link>
				<Link to="/contact" className="text-black">
					Contact
				</Link>
				<Button
					auto
					onClick={() => {
						navigate("/auth", { state: { login: true } });
					}}>
					Login
				</Button>
				<Button
					auto
					type="success"
					onClick={() => {
						navigate("/auth", { state: { login: false } });
					}}>
					Register Now!
				</Button>
			</nav>
		</div>
	);
}
