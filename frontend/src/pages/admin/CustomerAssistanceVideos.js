import { Button, CircularProgress } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import { Fetch } from "../../utils/Fetch";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import { getBackendDomain } from "../../utils/getBackendDomain";

export default function CustomerAssistanceVideos() {
	const ffmpegRef = useRef(new FFmpeg());
	const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

	useEffect(() => {
		const loadFFMpeg = async () => {
			try {
				const baseURL =
					"https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";

				const ffmpeg = ffmpegRef.current;
				ffmpeg.on("log", ({ message }) => {
					// messageRef.current.innerHTML = message;
					console.log("[FFMPEG]", message);
				});
				// toBlobURL is used to bypass CORS issue, urls with the same
				// domain can be used directly.
				console.log(
					"[FFMPEG]",
					"getting ffmpeg-core.js and ffmpeg-core.wasm"
				);
				await ffmpeg.load({
					coreURL: await toBlobURL(
						`${baseURL}/ffmpeg-core.js`,
						"text/javascript"
					),
					wasmURL: await toBlobURL(
						`${baseURL}/ffmpeg-core.wasm`,
						"application/wasm"
					),
				});
				console.log(
					"[FFMPEG]",
					"loaded ffmpeg-core.js and ffmpeg-core.wasm"
				);
				setFfmpegLoaded(true);
			} catch (error) {
				console.error("[FFMPEG]", error);
			}
		};
		loadFFMpeg();
	}, []);

	const {
		data: videos,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ["customerAssistanceVideos"],
		queryFn: async () => {
			try {
				const res = await Fetch({
					url: "/r2/videos",
					method: "GET",
				});

				console.log("res?.data?", res);
				let videos = res?.data?.videos;

				if (!videos) {
					return [];
				} else {
					videos = videos.reduce((acc, video) => {
						// split the key to get the folder of the video
						const [folder, key] = video.Key.split("/");

						// add key to list of videos under folder
						if (!acc[folder]) {
							acc[folder] = {
								folder: folder,
								videos: [],
							};
						}

						acc[folder]["videos"].push({ Key: key });

						return acc;
					}, {});
				}

				console.log("videos", videos);

				return videos;
			} catch (error) {
				console.error("res?.data?", err);
				toast.error("Failed to fetch customer assistance videos");

				throw err;
			}
		},
	});

	const { mutateAsync: handleDownload, isPending } = useMutation({
		mutationKey: ["downloadVideo"],
		mutationFn: async (video) => {
			try {
				let intermediateStart = performance.now();

				const { folder, videos } = video;

				let finalVideoPath = `${folder}_final.mp4`;

				// console.log(
				// 	finalVideoPath,
				// 	videos.find((v) => v.Key === finalVideoPath)
				// );

				if (videos.length === 0) {
					throw new Error("No videos to process");
				}

				if (videos.find((v) => v.Key === finalVideoPath)) {
					const res = await fetch(
						`${getBackendDomain()}/r2/videos/get`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								filename: `${folder}/${finalVideoPath}`,
								content_type: "video/mp4",
							}),
						}
					);

					if (res.status === 200) {
						const buffer = await res.arrayBuffer();
						const blob = new Blob([buffer], { type: "video/mp4" });
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = `${folder}.mp4`;
						a.click();
						URL.revokeObjectURL(url);
						toast("Video downloaded successfully", {
							type: "success",
						});
						return [];
					} else {
						throw new Error("Failed to download video");
					}
				}

				toast.warn("Processing videos, this may take upto 5 minutes");

				const res = await Fetch({
					url: `/r2/videos/process/${folder}`,
					method: "POST",
					data: {
						videos: videos,
					},
				});

				if (res.status === 200) {
					toast.success("Videos processed successfully");
					const res = await fetch(
						`${getBackendDomain()}/r2/videos/get`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								filename: `${folder}/${finalVideoPath}`,
								content_type: "video/mp4",
							}),
						}
					);

					if (res.status === 200) {
						const buffer = await res.arrayBuffer();
						const blob = new Blob([buffer], { type: "video/mp4" });
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = `${folder}.mp4`;
						a.click();
						URL.revokeObjectURL(url);
						toast("Video downloaded successfully", {
							type: "success",
						});
						return [];
					} else {
						throw new Error("Failed to download video");
					}
				} else {
					throw new Error("Failed to process videos");
				}

				// let promises = videos.map(async (v) => {
				// 	try {
				// 		let res = await fetch(
				// 			`${getBackendDomain()}/r2/videos/get`,
				// 			{
				// 				method: "POST",
				// 				headers: {
				// 					"Content-Type": "application/json",
				// 				},
				// 				body: JSON.stringify({
				// 					filename: `${folder}/${v.Key}`,
				// 				}),
				// 			}
				// 		);

				// 		const buffer = await res.arrayBuffer();

				// 		console.log("[download] got : ", v.Key);
				// 		return { Key: v.Key, buffer: buffer };
				// 	} catch (error) {
				// 		console.error(
				// 			"[download] Failed to fetch video",
				// 			error
				// 		);
				// 		throw error;
				// 	}
				// });

				// let videoData = await Promise.all(promises);

				// videoData.sort((v1, v2) => (v1.Key > v2.Key ? 1 : -1));

				// let buffers = videoData.map((v) => v.buffer);

				// console.log(
				// 	"[download] res?.data?",
				// 	videoData,
				// 	buffers
				// 	// Buffer.from(res.data)
				// );

				// console.log(
				// 	"[download] Time to fetch video: ",
				// 	performance.now() - intermediateStart
				// );

				/*
				// do ffmpeg stuff here
				intermediateStart = performance.now();
				const f = new File(buffers, video.Key, {
					type: "video/mp4",
				});

				console.log("[download] combined size : ", f.size);

				const fileBuffer = await f.stream().getReader().read();

				console.log(
					"[download] Time to create file: ",
					performance.now() - intermediateStart
				);

				intermediateStart = performance.now();

				let files = (await ffmpegRef.current.listDir("/"))
					.filter((f) => !f.isDir)
					.map((f) => f.name);

				console.log("[download] files", files);

				if (files.includes("video.mp4")) {
					await ffmpegRef.current.deleteFile("/video.mp4");
				}

				console.log(
					"[download] Time to list and delete file: ",
					performance.now() - intermediateStart
				);

				// // do ffmpeg stuff here
				intermediateStart = performance.now();

				await ffmpegRef.current.writeFile(
					"/video.mp4",
					fileBuffer.value
				);

				files = (await ffmpegRef.current.listDir("/"))
					.filter((f) => !f.isDir)
					.map((f) => f.name);

				console.log("[download] files", files);

				console.log(
					"[download] Time to write file: ",
					performance.now() - intermediateStart
				);

				intermediateStart = performance.now();
				let ffmpegExecResult = await ffmpegRef.current.exec([
					"-i",
					"video.mp4",
					"-sn",
					"-c:v",
					"libx264",
					"-c:a",
					"aac",
					"-strict",
					"experimental",
					"output.mp4",
				]);

				console.log(
					"[download] Time to exec: ",
					performance.now() - intermediateStart,
					{ ffmpegExecResult }
				);

				if (ffmpegExecResult !== 0) {
					throw new Error("FFMPEG failed to execute");
				}

				intermediateStart = performance.now();

				const data = await ffmpegRef.current.readFile("output.mp4");

				// let videoBlobFile = new File(data, "output.mp4", {
				// 	type: "video/mp4",
				// });

				console.log(
					"[download] Time to read file, parse: ",
					performance.now() - intermediateStart
				);
        */

				// const combinedBlob = new Blob(buffers, {
				// 	type: "video/mp4",
				// });

				// console.log("[download] combinedBlob", combinedBlob);

				// const url = window.URL.createObjectURL(combinedBlob);
				// const link = document.createElement("a");

				// link.href = url;
				// link.setAttribute("download", `${folder}.mp4`);
				// document.body.appendChild(link);
				// link.click();
				// link.parentNode.removeChild(link);
				// window.URL.revokeObjectURL(url);

				return [];
			} catch (error) {
				console.error("res?.data?", error);
				toast.error("Failed to download video");

				throw error;
			}
		},
	});

	const handleDelete = (row) => {};

	const columns = [
		{
			accessorKey: "folder",
			header: "Folder name",
		},
		{
			header: "Actions",
			cell: ({ row }) => {
				// console.log(row?.original);
				let [loading, setLoading] = useState(false);

				const handle = async (row) => {
					setLoading(true);
					await handleDownload(row);
					setLoading(false);
				};

				return (
					<div className="flex flex-row gap-2">
						<Button
							onClick={() => handle(row?.original)}
							variant="contained"
							size="small"
							disabled={loading}>
							{loading ? <CircularProgress /> : "Download"}
						</Button>
						<Button
							onClick={() => handleDelete(row?.original)}
							color="error"
							variant="outlined"
							size="small">
							Delete
						</Button>
					</div>
				);
			},
		},
	];

	return (
		<AdminPageWrapper heading="Customer Assistance Videos">
			<div>
				<DataTable
					data={videos ? Object.values(videos) : []}
					columns={columns}
					refetch={refetch}
				/>
			</div>
		</AdminPageWrapper>
	);
}
