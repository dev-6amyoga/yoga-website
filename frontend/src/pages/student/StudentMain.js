import "react-toastify/dist/ReactToastify.css";
import StudentNavbar from "../../components/Common/StudentNavbar/StudentNavbar";
export default function StudentMain() {
	return (
		<div>
			<div>
				<StudentNavbar />
			</div>
			{/* <div>Plans for : {user.name}!</div> */}
			<div className="flex flex-col items-center justify-center py-20">
				Home Page.
			</div>
		</div>
	);
}
