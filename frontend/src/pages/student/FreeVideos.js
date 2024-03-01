import { useEffect, useMemo, useState } from "react";
import useUserStore from "../../store/UserStore";
// import { useNavigate } from "react-router-dom";
import { Button, Card } from "@geist-ui/core";
import { Eye } from "@geist-ui/icons";
import YouTube from "react-youtube";
import StudentPageWrapper from "../../components/Common/StudentPageWrapper";
import { Fetch } from "../../utils/Fetch";
export default function FreeVideos() {
	const [planId, setPlanId] = useState(0);
	const [currentVideoId, setCurrentVideoId] = useState("");
	let user = useUserStore((state) => state.user);
	const videoOptions = {
		playerVars: {
			autoplay: 1,
			controls: 1,
			rel: 0,
		},
	};
	const [player, setPlayer] = useState(null);

	const saveTarget = (e) => {
		// setting event target to gain control on player
		setPlayer(e.target);

		// get markers for current video
		// setMarker(asanas[queue[0]].asana.markers);

		// set duration

		// start timer for duration

		// check marker every second
	};

	const iChanged = (s) => {
		console.log(s);
	};
	const handleEnd = () => {
		console.log("the end");
	};
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await Fetch({
					url: "/user-plan/get-user-plan-by-id",
					method: "POST",
					data: { user_id: user?.user_id },
				});
				const data = await response.data;
				if (data["userPlan"]) {
					setPlanId(data["userPlan"]["plan_id"]);
				} else {
					console.log(data["error"]);
				}
			} catch (error) {
				console.log(error);
			}
		};
		if (user) {
			fetchData();
		}
	}, [user]);

	const freeVideos = useMemo(
		() => [
			{
				videoId: "jYIE9dtfmr8",
				title: "Yoga to improve bowel movements",
			},
			{ videoId: "iRFQyZa-L6A", title: "Try this to know your BMI!" },
			{
				videoId: "MLXrRYpbskg",
				title: "Improve Lung Capacity through yoga",
			},
			{ videoId: "sIT1RyjWgJM", title: "Slow down and reduce stress" },
			{ videoId: "20fvnDTOkRg", title: "Yoga for eyes" },
			{ videoId: "hRD0coM5esM", title: "Benefits of sweating" },
			{ videoId: "EYe_w4HlRoo", title: "Easy Headstand" },
			{ videoId: "CojVgFpvFlw", title: "Dont cut nails at night" },
			{ videoId: "CP8HZllEO_s", title: "Ujjayi Pranayama" },
			{ videoId: "JMdWiSQ4cXE", title: "Weight Loss Yoga" },
			{ videoId: "odFz9kG3BaM", title: "Why chant Om" },
			{ videoId: "GsBv5kuTAug", title: "Improve back posture" },
			{ videoId: "vKn5-2vusMc", title: "OM or AUM" },
			{ videoId: "sFmxJtjb43Y", title: "Master Class 16Dec23" },
		],
		[]
	);

	return (
		<StudentPageWrapper heading="Free Videos">
			<div className="rounded-lg bg-slate-100 p-2 md:p-8">
				<YouTube
					className="max-w-5xl mx-auto aspect-video"
					iframeClassName="w-full h-full rounded-lg"
					videoId={currentVideoId}
					opts={videoOptions}
					onEnd={handleEnd}
					onReady={saveTarget}
					onStateChange={iChanged}
					onPlay={() => {}}
					onPause={() => {}}
				/>
			</div>

			<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-10">
				{freeVideos.map((video, index) => (
					<Card key={video?.videoId}>
						<div className="flex items-center justify-between gap-4">
							<p className="text-sm md:text-base">
								{video?.title}
							</p>
							<Button
								type="success"
								auto
								onClick={() => {
									setCurrentVideoId(video?.videoId);
								}}
								icon={<Eye />}
								scale={0.67}>
								Watch
							</Button>
						</div>
					</Card>
				))}
			</div>
		</StudentPageWrapper>
	);
}
