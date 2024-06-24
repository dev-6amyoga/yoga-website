import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useState } from "react";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import VideoPlayerWrapper from "../../components/StackVideoShaka/VideoPlayerWrapper";
import "./MovingText.css";
import Hero from "./components/Hero";

function StudentHome() {
	const [mode, setMode] = useState("light");

	const defaultTheme = createTheme({ palette: { mode } });

	return (
		<ThemeProvider theme={defaultTheme}>
			<CssBaseline />
			<StudentNavMUI />
			<Hero heading="6AM Yoga Player" />
			<div className="max-w-7xl mx-auto">
				<VideoPlayerWrapper />
			</div>
		</ThemeProvider>
	);
}

export default StudentHome;
