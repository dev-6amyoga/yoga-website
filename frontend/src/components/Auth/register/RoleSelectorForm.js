import { Briefcase, UserCheck } from "@geist-ui/icons";

export default function RoleSelectorForm({ role, setRole }) {
	return (
		<form className="flex flex-col gap-4 w-full" onSubmit={() => {}}>
			<h4 className="text-center">Select Role</h4>

			<div className="flex gap-4 items-center justify-center">
				<div
					className={`flex items-center gap-2 flex-col p-8 border rounded-lg ${
						role === "STUDENT" ? "border-blue-500" : ""
					}`}
					onClick={() => setRole("STUDENT")}>
					<UserCheck />
					Student
				</div>
				<div
					className={`flex items-center gap-2 flex-col p-8 border rounded-lg ${
						role === "INSTITUTE_OWNER" ? "border-blue-500" : ""
					}`}
					onClick={() => setRole("INSTITUTE_OWNER")}>
					<Briefcase />
					Institute
				</div>
			</div>
		</form>
	);
}
