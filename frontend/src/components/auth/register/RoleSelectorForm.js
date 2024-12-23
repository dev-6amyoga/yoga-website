import { Briefcase, UserCheck } from "@geist-ui/icons";
import SchoolIcon from "@mui/icons-material/School";

export default function RoleSelectorForm({ role, setRole, handleNextStep }) {
  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={() => {}}>
      <h6 className="text-center">Select Role</h6>

      <div className="flex gap-4 items-center justify-center">
        <div
          className={`flex items-center gap-2 flex-col p-8 border-2 rounded-lg ${
            role === "STUDENT" ? "border-blue-500" : ""
          } cursor-pointer`} // Add cursor-pointer class here
          onClick={() => {
            setRole("STUDENT");
            handleNextStep();
          }}
        >
          <UserCheck />
          Student
        </div>

        {/* enable for institute */}
        <div
          className={`flex items-center gap-2 flex-col p-8 border rounded-lg ${
            role === "TEACHER" ? "border-blue-500" : ""
          }`}
          onClick={() => {
            setRole("TEACHER");
            handleNextStep();
          }}
        >
          <SchoolIcon />
          Teacher
        </div>
      </div>
    </form>
  );
}
