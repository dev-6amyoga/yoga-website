import { useEffect } from "react";
import StudentNavMUI from "../../components/Common/StudentNavbar/StudentNavMUI";
import VideoPlayer from "../../components/StackVideoShaka/VideoPlayer";
import ClassInfoStudent from "../../components/testing/ClassInfoStudent";
import PlaylistSectionsStudent from "../../components/testing/Sections";
import usePlaylistStore from "../../store/PlaylistStore";
import useVideoStore from "../../store/VideoStore";
import Hero from "../student/components/Hero";

function ClassModeStudent() {
	const [fullScreen] = useVideoStore((state) => [state.fullScreen]);
	const [addToQueue] = usePlaylistStore((state) => [state.addToQueue]);

	useEffect(() => {
		addToQueue([
			{
				_id: "66617a16485e980956f9f772",
				playlist_id: 4,
				playlist_name: "June Sequence Student DRM",
				asana_ids: [
					"T_273",
					309,
					"T_274",
					316,
					"T_277",
					"T_276",
					331,
					331,
					331,
					331,
					331,
					330,
					329,
					"T_278",
					"T_261",
					338,
					340,
					"T_285",
					"T_262",
					319,
					318,
					"T_264",
					"T_261",
					"T_263",
					308,
					"T_272",
					"T_282",
					306,
					"T_281",
					"T_283",
					"T_270",
					333,
					307,
					334,
					314,
					"T_269",
					"T_279",
					"T_271",
					"T_258",
					326,
					315,
					312,
					321,
					"T_260",
					"T_275",
					"T_259",
					337,
					"T_267",
					"T_268",
					"T_284",
					335,
					310,
					320,
					"T_281",
					"T_284",
					327,
					"T_280",
					"T_265",
					322,
					"T_266",
					311,
					324,
					324,
					323,
					317,
					339,
					325,
					336,
					332,
					328,
				],
				duration: 4719.339999999999,
				__v: 2,
				playlist_mode: "Student",
				drm_playlist: true,
				playlist_dash_url:
					"https://pub-0f821d8aa0b0446cae0613788ad21abc.r2.dev/66617a16485e980956f9f772.mpd",
				sections: [
					{
						name: "Starting prayer stand lock legs and namaskar non ai drm",
						time: 0,
						_id: "6661b552eb70e385e8a00fb6",
					},
					{
						name: "Asatoma Starting Prayer",
						time: 16,
						_id: "6661b552eb70e385e8a00fb7",
					},
					{
						name: "Starting prayer stand unlock namaskar and legs non ai drm",
						time: 70.88,
						_id: "6661b552eb70e385e8a00fb8",
					},
					{
						name: "Mixed Warmup",
						time: 81.88,
						_id: "6661b552eb70e385e8a00fb9",
					},
					{
						name: "Suryanamaskar preparation non stithi non ai drm",
						time: 966.46,
						_id: "6661b552eb70e385e8a00fba",
					},
					{
						name: "Suryanamaskar prefix non stithi non ai drm",
						time: 1072.54,
						_id: "6661b552eb70e385e8a00fbb",
					},
					{
						name: "SVYASA 2 Rounds (Left and Right)",
						time: 1080.54,
						_id: "6661b552eb70e385e8a00fbc",
					},
					{
						name: "SVYASA 2 Rounds (Left and Right)",
						time: 1206.54,
						_id: "6661b552eb70e385e8a00fbd",
					},
					{
						name: "SVYASA 2 Rounds (Left and Right)",
						time: 1332.54,
						_id: "6661b552eb70e385e8a00fbe",
					},
					{
						name: "SVYASA 2 Rounds (Left and Right)",
						time: 1458.54,
						_id: "6661b552eb70e385e8a00fbf",
					},
					{
						name: "SVYASA 2 Rounds (Left and Right)",
						time: 1584.54,
						_id: "6661b552eb70e385e8a00fc0",
					},
					{
						name: "SVYASA 1 Round (Left Leg)",
						time: 1710.54,
						_id: "6661b552eb70e385e8a00fc1",
					},
					{
						name: "SVYASA 1 Round (Right Leg) (Holding Round)",
						time: 1773.54,
						_id: "6661b552eb70e385e8a00fc2",
					},
					{
						name: "Suryanamaskara Non AI Non Stithi Suffix",
						time: 2004.54,
						_id: "6661b552eb70e385e8a00fc3",
					},
					{
						name: "Feet apart hand loose non ai drm",
						time: 2012.54,
						_id: "6661b552eb70e385e8a00fc4",
					},
					{
						name: "Eye Exercises With Name",
						time: 2020.54,
						_id: "6661b552eb70e385e8a00fc5",
					},
					{
						name: "Udhiyana Agnisara Kriya",
						time: 2155.86,
						_id: "6661b552eb70e385e8a00fc6",
					},
					{
						name: "Walk back turn left non ai drm",
						time: 2323.86,
						_id: "6661b552eb70e385e8a00fc7",
					},
					{
						name: "Feet together hand tight side stand non ai drm",
						time: 2331.86,
						_id: "6661b552eb70e385e8a00fc8",
					},
					{
						name: "Parsvakonasana",
						time: 2339.86,
						_id: "6661b552eb70e385e8a00fc9",
					},
					{
						name: "Parivrtta Parsvakonasana",
						time: 2451.86,
						_id: "6661b552eb70e385e8a00fca",
					},
					{
						name: "Jump and turn side to front non ai drm",
						time: 2563.86,
						_id: "6661b552eb70e385e8a00fcb",
					},
					{
						name: "Feet apart hand loose non ai drm",
						time: 2571.86,
						_id: "6661b552eb70e385e8a00fcc",
					},
					{
						name: "Feet together hands tight stand non ai drm",
						time: 2579.86,
						_id: "6661b552eb70e385e8a00fcd",
					},
					{
						name: "Ardha Chandrasana",
						time: 2587.86,
						_id: "6661b552eb70e385e8a00fce",
					},
					{
						name: "Standing to vajra non ai drm",
						time: 2683.86,
						_id: "6661b552eb70e385e8a00fcf",
					},
					{
						name: "Vajra dyanmudra front non ai drm",
						time: 2691.86,
						_id: "6661b552eb70e385e8a00fd0",
					},
					{
						name: "Adho Mukha Virasana",
						time: 2699.86,
						_id: "6661b552eb70e385e8a00fd1",
					},
					{
						name: "Vajra dyan to relax non ai drm",
						time: 2755.86,
						_id: "6661b552eb70e385e8a00fd2",
					},
					{
						name: "Vajra to sitting non ai drm",
						time: 2763.86,
						_id: "6661b552eb70e385e8a00fd3",
					},
					{
						name: "Sit straight front non ai drm",
						time: 2771.86,
						_id: "6661b552eb70e385e8a00fd4",
					},
					{
						name: "Upavishta Konasana",
						time: 2779.86,
						_id: "6661b552eb70e385e8a00fd5",
					},
					{
						name: "Ardha Purvottanasana",
						time: 2915.86,
						_id: "6661b552eb70e385e8a00fd6",
					},
					{
						name: "Vakrasana",
						time: 2963.86,
						_id: "6661b552eb70e385e8a00fd7",
					},
					{
						name: "Gomukhasana",
						time: 3043.86,
						_id: "6661b552eb70e385e8a00fd8",
					},
					{
						name: "Sit relax front non ai drm",
						time: 3139.86,
						_id: "6661b552eb70e385e8a00fd9",
					},
					{
						name: "Turn mat sit front to side ai and non ai drm",
						time: 3147.86,
						_id: "6661b552eb70e385e8a00fda",
					},
					{
						name: "Sit to supine ai and non ai drm",
						time: 3163.86,
						_id: "6661b552eb70e385e8a00fdb",
					},
					{
						name: "Arms overhead feet togther ai and non ai drm",
						time: 3179.86,
						_id: "6661b552eb70e385e8a00fdc",
					},
					{
						name: "Sarvanga Hala Badhakona Markata Combo",
						time: 3187.86,
						_id: "6661b552eb70e385e8a00fdd",
					},
					{
						name: "Matsyasana no break student jun24 drm",
						time: 3395.86,
						_id: "6661b552eb70e385e8a00fde",
					},
					{
						name: "Chakrasana no break student jun24 drm",
						time: 3483.86,
						_id: "6661b552eb70e385e8a00fdf",
					},
					{
						name: "Pawanmuktasana no break student jun24 drm",
						time: 3531.86,
						_id: "6661b552eb70e385e8a00fe0",
					},
					{
						name: "Feet apart arms down ai and non ai drm",
						time: 3571.86,
						_id: "6661b552eb70e385e8a00fe1",
					},
					{
						name: "Supine to prone ai and non ai drm",
						time: 3579.86,
						_id: "6661b552eb70e385e8a00fe2",
					},
					{
						name: "Arms stright parallel prone non ai drm",
						time: 3619.86,
						_id: "6661b552eb70e385e8a00fe3",
					},
					{
						name: "Dhanurasana",
						time: 3627.86,
						_id: "6661b552eb70e385e8a00fe4",
					},
					{
						name: "Prone sthithi to relax makar non ai drm",
						time: 3675.86,
						_id: "6661b552eb70e385e8a00fe5",
					},
					{
						name: "Prone to vajra ai and non ai drm",
						time: 3683.86,
						_id: "6661b552eb70e385e8a00fe6",
					},
					{
						name: "Vajra to supine ai and non ai drm",
						time: 3707.86,
						_id: "6661b552eb70e385e8a00fe7",
					},
					{
						name: "Vasisthasana no break student jun24 drm",
						time: 3723.86,
						_id: "6661b552eb70e385e8a00fe8",
					},
					{
						name: "Balasana",
						time: 3787.86,
						_id: "6661b552eb70e385e8a00fe9",
					},
					{
						name: "Parvatasana",
						time: 3827.86,
						_id: "6661b552eb70e385e8a00fea",
					},
					{
						name: "Vajra dyan to relax non ai drm",
						time: 3867.86,
						_id: "6661b552eb70e385e8a00feb",
					},
					{
						name: "Vajra to supine ai and non ai drm",
						time: 3875.86,
						_id: "6661b552eb70e385e8a00fec",
					},
					{
						name: "Savasana 2 min eng no break student jun24 drm",
						time: 3891.86,
						_id: "6661b552eb70e385e8a00fed",
					},
					{
						name: "Turn mat sit side to front ai and non ai drm",
						time: 4052.4,
						_id: "6661b552eb70e385e8a00fee",
					},
					{
						name: "Prayer sit start fold and namaskar ai and non ai drm",
						time: 4068.4,
						_id: "6661b552eb70e385e8a00fef",
					},
					{
						name: "Pranasyedam Prayer",
						time: 4100.38,
						_id: "6661b552eb70e385e8a00ff0",
					},
					{
						name: "Prayer sit unlock only namaskar unlock ai and non ai drm",
						time: 4160.32,
						_id: "6661b552eb70e385e8a00ff1",
					},
					{
						name: "Bhastrika pranayama 2 rounds 40+30 no break student jun24 drm",
						time: 4171.32,
						_id: "6661b552eb70e385e8a00ff2",
					},
					{
						name: "Pratiloma Pranayama 1 cycle 2 rounds no break student jun24 drm",
						time: 4297.92,
						_id: "6661b552eb70e385e8a00ff3",
					},
					{
						name: "Pratiloma Pranayama 1 cycle 2 rounds no break student jun24 drm",
						time: 4353.92,
						_id: "6661b552eb70e385e8a00ff4",
					},
					{
						name: "Pratiloma LAST  cycle no break student jun24 drm",
						time: 4409.92,
						_id: "6661b552eb70e385e8a00ff5",
					},
					{
						name: "Omkara 1 round no break student jun24 drm",
						time: 4465.92,
						_id: "6661b552eb70e385e8a00ff6",
					},
					{
						name: "Rub Your Palms",
						time: 4486.74,
						_id: "6661b552eb70e385e8a00ff7",
					},
					{
						name: "Purnamadah Closing Prayer",
						time: 4507.179999999999,
						_id: "6661b552eb70e385e8a00ff8",
					},
					{
						name: "Tolasana",
						time: 4591.459999999999,
						_id: "6661b552eb70e385e8a00ff9",
					},
					{
						name: "Sirsasana",
						time: 4663.459999999999,
						_id: "6661b552eb70e385e8a00ffa",
					},
				],
			},
		]);
	}, [addToQueue]);

	return (
		<main>
			<Hero heading="Class Mode" />
			<StudentNavMUI />
			<div className="max-w-7xl mx-auto py-2 px-1 xl:px-0">
				<div className="mt-6">
					<>
						<ClassInfoStudent />

						<div
							className={
								fullScreen
									? ""
									: "relative video-grid mb-12 w-full gap-2"
							}>
							<div
								className={
									fullScreen
										? "absolute w-full h-screen top-0 left-0 right-0 bottom-0 z-[10000]"
										: "video-area"
								}>
								<VideoPlayer />
							</div>
							{!fullScreen ? (
								<div className="queue-area">
									<PlaylistSectionsStudent />
								</div>
							) : (
								<></>
							)}
						</div>

						{fullScreen ? (
							<div className="queue-area">
								<PlaylistSectionsStudent />
							</div>
						) : (
							<></>
						)}
					</>
				</div>
			</div>
		</main>
	);
}

export default ClassModeStudent;
