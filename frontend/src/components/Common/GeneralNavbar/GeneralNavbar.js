import { Button, Drawer } from "@geist-ui/core";
import { Menu, X } from "@geist-ui/icons";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function GeneralNavbar() {
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);

	const NavLinks = () => {
		return (
			<>
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
			</>
		);
	};

	return (
		<div className="h-16 bg-white text-black px-4 shadow-sm flex items-center justify-between">
			<div className="flex gap-4 items-center h-full">
				<img src="/logo_6am.png" alt="6AM Yoga Logo" className="h-6" />
				<h1 className="text-base md:text-xl">My Yoga Teacher</h1>
			</div>
			<nav className="md:flex gap-4 items-center hidden">
				<NavLinks />
			</nav>
			<div className="md:hidden">
				<Button
					auto
					icon={<Menu />}
					scale={0.8}
					onClick={() => setOpen((p) => !p)}></Button>
			</div>
			<Drawer
				visible={open}
				onClose={() => setOpen(false)}
				placement="left"
				width="90%"
				className=""
				wrapClassName="relative block md:hidden">
				<Drawer.Title>My Yoga Teacher</Drawer.Title>
				<Drawer.Content className="relative">
					<button
						className="absolute -top-9 right-4 px-2 py-1 border rounded-lg"
						onClick={() => setOpen(false)}>
						<X className="w-5 h-5" />
					</button>
					<div className="flex flex-col gap-6 my-4 items-center text-xl">
						<NavLinks />
					</div>
				</Drawer.Content>
			</Drawer>
		</div>
	);
}
