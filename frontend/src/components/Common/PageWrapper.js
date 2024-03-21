import GeneralNavbar from "./GeneralNavbar/GeneralNavbar";

export default function PageWrapper({ heading, children }) {
	return (
		<>
			<GeneralNavbar />
			<div className="min-h-screen">
				{heading ? (
					<h1 className="pt-4 font-bold text-center">{heading}</h1>
				) : (
					<></>
				)}
				<div className="">{children}</div>
			</div>
		</>
	);
}
