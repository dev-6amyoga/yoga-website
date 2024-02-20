import TeacherNavbar from "./TeacherNavbar/TeacherNavbar";

export default function TeacherPageWrapper({ heading, children }) {
	return (
		<>
			<TeacherNavbar />
			<div className="max-w-7xl mx-auto py-20 px-4 xl:px-0">
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
