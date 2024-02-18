import AdminNavbar from "./AdminNavbar/AdminNavbar";

export default function AdminPageWrapper({ heading, children }) {
	return (
		<>
			<AdminNavbar />
			<div className="max-w-7xl mx-auto py-20 px-4">
				{heading ? (
					<h1 className="pt-4 font-bold text-center">{heading}</h1>
				) : (
					<></>
				)}
				<div className="mt-6">{children}</div>
			</div>
		</>
	);
}
