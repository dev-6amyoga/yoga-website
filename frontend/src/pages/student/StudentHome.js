import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import { ROLE_STUDENT } from "../../enums/roles";
import useUserStore from "../../store/UserStore";
import { withAuth } from "../../utils/withAuth";
import "./MovingText.css";
import Hero from "./components/Hero";

function StudentHome() {
	const [mode, setMode] = useState("light");

	const defaultTheme = createTheme({ palette: { mode } });

	const [user, userPlan] = useUserStore((state) => [
		state.user,
		state.userPlan,
	]);

	// check if user has plan
	const [hasPlan, setHasPlan] = useState(false);

	useEffect(() => {
		if (
			user !== null &&
			user !== undefined &&
			userPlan !== null &&
			userPlan !== undefined
		) {
			// console.log(user, userPlan);
			if (userPlan.current_status === "ACTIVE") {
				if (userPlan?.plan?.has_basic_playlist) {
					setHasPlan(true);
					return;
				}
			}
			setHasPlan(false);
		}
	}, [user, userPlan]);

	return (
		<ThemeProvider theme={defaultTheme}>
			<CssBaseline />
			<StudentNavMUI />
			<Hero heading="6AM Yoga Player" />
			{hasPlan ? (
				<div className="max-w-7xl mx-auto">
					<VideoPlayerWrapper />
				</div>
			) : (
				<div className="max-w-7xl mx-auto flex items-center text-center justify-center">
					<h3>Please purchase a plan to view this page.</h3>
				</div>
			)}
		</ThemeProvider>
	);
}

export default withAuth(StudentHome, ROLE_STUDENT);
