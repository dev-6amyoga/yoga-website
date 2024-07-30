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
				return res?.data?.videos;
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
				const res = await fetch(
					`${getBackendDomain()}/r2/videos/${video.Key}`,
					{
						method: "GET",
					}
				);

				const videoData = await res.arrayBuffer();

				console.log(
					"res?.data?",
					videoData
					// Buffer.from(res.data)
				);

				console.log(
					"[download] Time to fetch video: ",
					performance.now() - intermediateStart
				);

				// do ffmpeg stuff here
				intermediateStart = performance.now();
				const f = new File([videoData], video.Key, {
					type: "video/mp4",
				});

				const fileBuffer = await f.stream().getReader().read();

				// if (!fileBuffer.done) {
				// 	throw new Error("Failed to read file");
				// }

				// console.log(fileBuffer.value);

				console.log(
					"[download] Time to create file: ",
					performance.now() - intermediateStart
				);

				intermediateStart = performance.now();
				// do ffmpeg stuff here
				await ffmpegRef.current.writeFile(
					"video.mp4",
					fileBuffer.value
				);

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
					performance.now() - intermediateStart
				);

				if (ffmpegExecResult !== 0) {
					throw new Error("FFMPEG failed to execute");
				}

				intermediateStart = performance.now();

				const data = await ffmpegRef.current.readFile("output.mp4");

				// videoBlobFile = new File(data, "output.mp4", {
				// 	type: "video/mp4",
				// });

				console.log(
					"[download] Time to read file, parse: ",
					performance.now() - intermediateStart
				);

				const url = window.URL.createObjectURL(new Blob([data]));
				const link = document.createElement("a");
				link.href = url;
				link.setAttribute("download", `${video.Key}`);
				document.body.appendChild(link);
				link.click();
				link.parentNode.removeChild(link);
				window.URL.revokeObjectURL(url);

				return res.data;
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
			accessorKey: "Key",
			header: "Video Name",
		},
		{
			header: "Actions",
			cell: ({ row }) => {
				console.log(row?.original);
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
					data={videos ?? []}
					columns={columns}
					refetch={refetch}
				/>
			</div>
		</AdminPageWrapper>
	);
}
