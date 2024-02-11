import GeneralNavbar from "./GeneralNavbar/GeneralNavbar";

export default function PageWrapper({ children }) {
	return (
		<div className="min-h-screen">
			<GeneralNavbar />
			<div>{children}</div>
		</div>
	);
}
