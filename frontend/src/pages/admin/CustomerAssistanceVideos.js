import { Button, CircularProgress, Tooltip } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AdminPageWrapper from "../../components/Common/AdminPageWrapper";
import { DataTable } from "../../components/Common/DataTable/DataTable";
import { Fetch } from "../../utils/Fetch";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { useRef, useState } from "react";
import { cloudflareGetFileUrl } from "../../utils/R2Client";

const VideoActions = ({ video }) => {
	const queryClient = useQueryClient();

	const { mutateAsync: handleDownload, isPending: isDownloadPending } =
		useMutation({
			mutationKey: ["justDownloadVideo", video._id],
			mutationFn: async () => {
				try {
					const url = await cloudflareGetFileUrl(
						import.meta.env.VITE_CLOUDFLARE_R2_RECORDINGS_BUCKET,
						`${video.folder_name}/${video.folder_name}_final_ffmpeg.mp4`,
						"video/mp4"
					);

					const res = await fetch(url);

					if (res.status === 200) {
						const buffer = await res.arrayBuffer();
						const blob = new Blob([buffer], { type: "video/mp4" });
						const blobURL = URL.createObjectURL(blob);

						const a = document.createElement("a");
						a.href = blobURL;
						a.download = `${video.folder_name}.mp4`;
						a.click();

						URL.revokeObjectURL(blobURL);

						toast("Video downloaded successfully", {
							type: "success",
						});

						return [];
					} else {
						throw new Error("Failed to download video");
					}
				} catch (error) {
					toast.error(error);
					throw error;
				}
			},
		});

	const { mutateAsync: handleProcess, isPending: isProcessPending } =
		useMutation({
			mutationKey: ["processVideo", video._id],
			mutationFn: async () => {
				try {
					toast.warn(
						"Processing videos, this may take up to 5 minutes"
					);

					const res = await Fetch({
						url: `/r2/videos/process/`,
						method: "POST",
						data: {
							folder_name: video.folder_name,
							video_recording_id: video._id,
						},
					});

					if (res.status === 200) {
						const res = await Fetch({
							url: `/r2/videos/process-ffmpeg/`,
							method: "POST",
							data: {
								folder_name: video.folder_name,
								video_recording_id: video._id,
							},
						});

						if (res.status === 200) {
							queryClient.invalidateQueries({
								queryKey: ["allVideoRecordings"],
							});
							toast.success("Videos processed successfully");

							return [];
						} else {
							throw new Error("Failed to process videos");
						}
					} else {
						throw new Error("Failed to process videos");
					}
				} catch (error) {
					toast.error(error);
					throw error;
				}
			},
		});

	const {
		mutateAsync: handleProcessFFMPEG,
		isPending: isProcessFFMPEGPending,
	} = useMutation({
		mutationKey: ["processVideoFFMPEG", video._id],
		mutationFn: async () => {
			try {
				toast.warn("Processing videos, this may take up to 5 minutes");

				const res = await Fetch({
					url: `/r2/videos/process-ffmpeg/`,
					method: "POST",
					data: {
						folder_name: video.folder_name,
						video_recording_id: video._id,
					},
				});

				if (res.status === 200) {
					queryClient.invalidateQueries({
						queryKey: ["allVideoRecordings"],
					});
					toast.success("Videos processed successfully");

					return [];
				} else {
					throw new Error("Failed to process videos");
				}
			} catch (error) {
				toast.error(error);
				throw error;
			}
		},
	});

	const { mutateAsync: handleDelete, isPending: isDeletePending } =
		useMutation({
			mutationKey: ["deleteVideo", video._id],
			mutationFn: async (video) => {
				// console.log(video._id, video._id.toString());
				try {
					const res = await Fetch({
						url: `/video-rec/deleteVideoRecording/${video._id.toString()}`,
						method: "DELETE",
					});
					if (res.status === 200) {
						toast.success("Video deleted successfully");
					} else {
						throw new Error("Failed to delete video");
					}
				} catch (error) {
					toast.error(error);
					throw error;
				}
			},
		});

	return (
		<div className="flex flex-row gap-2">
			<Tooltip title="Will combine and process ffmpeg.">
				<Button
					onClick={() => {
						handleProcess(video);
					}}
					variant={
						video?.processing_status === "PROCESSED" ||
						video?.processing_status === "PROCESSED_FFMPEG"
							? "outlined"
							: "contained"
					}
					size="small"
					disabled={isProcessPending}>
					{isProcessPending ? (
						<CircularProgress size="1rem" />
					) : video?.processing_status === "PROCESSED" ||
					  video?.processing_status === "PROCESSED_FFMPEG" ? (
						"REPROCESS"
					) : (
						"PROCESS"
					)}
				</Button>
			</Tooltip>

			<Tooltip title="Will process ffmpeg only.">
				<Button
					onClick={() => {
						handleProcessFFMPEG(video);
					}}
					variant={
						video?.processing_status === "PROCESSED_FFMPEG"
							? "outlined"
							: "contained"
					}
					size="small"
					disabled={
						isProcessFFMPEGPending ||
						video?.processing_status === "PENDING"
					}>
					{isProcessFFMPEGPending ? (
						<CircularProgress size="1rem" />
					) : video?.processing_status === "PROCESSED_FFMPEG" ? (
						"REPROCESS FFMPEG"
					) : (
						"PROCESS FFMPEG"
					)}
				</Button>
			</Tooltip>

			<Tooltip title="If prepared and processed with ffmpeg, will be downloadable">
				<Button
					onClick={() => {
						handleDownload(video);
					}}
					variant="contained"
					size="small"
					disabled={
						isDownloadPending ||
						!(video?.processing_status === "PROCESSED_FFMPEG")
					}>
					{isDownloadPending ? (
						<CircularProgress size="1rem" />
					) : (
						"Download"
					)}
				</Button>
			</Tooltip>

			<Button
				onClick={() => handleDelete(video)}
				color="error"
				variant="outlined"
				size="small"
				disabled={isDeletePending}>
				Delete
			</Button>
		</div>
	);
};

export default function CustomerAssistanceVideos() {
	const ffmpegRef = useRef(new FFmpeg());
	const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
	// const [allVideoRecs, setAllVideoRecs] = useState([]);

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
				let videos = res?.data?.videos;
				if (!videos) {
					return [];
				} else {
					videos = videos.reduce((acc, video) => {
						const [folder, key] = video.Key.split("/");
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
				return videos;
			} catch (error) {
				console.error("res?.data?", err);
				toast.error("Failed to fetch customer assistance videos");
				throw err;
			}
		},
	});

	const { data: allVideoRecs, refetch: refetchAllVideos } = useQuery({
		queryKey: ["allVideoRecordings"],
		queryFn: async () => {
			try {
				const response = await Fetch({
					url: "/video-rec/getAllVideoRecordings",
					method: "GET",
				});
				const data = response.data;

				const sortedData = data.sort(
					(a, b) => new Date(b.created_at) - new Date(a.created_at)
				);

				return sortedData;
			} catch (err) {
				throw err;
			}
		},
	});

	const { mutateAsync: handleDownload, isPending } = useMutation({
		mutationKey: ["downloadVideo"],
		mutationFn: async (video) => {
			try {
				console.log("video is : ", video);
				let intermediateStart = performance.now();
				const { folder, videos } = video;
				let finalVideoPath = `${folder}_final_ffmpeg.mp4`;
				console.log("finalVideoPath", finalVideoPath);
				if (videos.length === 0) {
					throw new Error("No videos to process");
				}

				if (videos.find((v) => v.Key === finalVideoPath)) {
					// toast("")
					const url = await cloudflareGetFileUrl(
						import.meta.env.VITE_CLOUDFLARE_R2_RECORDINGS_BUCKET,
						`${folder}/${finalVideoPath}`,
						"video/mp4"
					);

					const res = await fetch(url);

					if (res.status === 200) {
						const buffer = await res.arrayBuffer();
						const blob = new Blob([buffer], { type: "video/mp4" });
						const blobURL = URL.createObjectURL(blob);

						const a = document.createElement("a");
						a.href = blobURL;
						a.download = `${folder}.mp4`;
						a.click();

						URL.revokeObjectURL(blobURL);

						toast("Video downloaded successfully", {
							type: "success",
						});

						return [];
					} else {
						throw new Error("Failed to download video");
					}
				} else {
					toast.warn(
						"Processing videos, this may take up to 5 minutes"
					);

					const res = await Fetch({
						url: `/r2/videos/process/${folder}`,
						method: "POST",
						data: {
							videos: videos,
						},
					});

					if (res.status === 200) {
						toast.success("Videos processed successfully");
						const url = await cloudflareGetFileUrl(
							import.meta.env
								.VITE_CLOUDFLARE_R2_RECORDINGS_BUCKET,
							`${folder}/${finalVideoPath}`,
							"video/mp4"
						);

						const res = await fetch(url);

						if (res.status === 200) {
							const buffer = await res.arrayBuffer();
							const blob = new Blob([buffer], {
								type: "video/mp4",
							});
							const blobURL = URL.createObjectURL(blob);

							const a = document.createElement("a");
							a.href = blobURL;
							a.download = `${folder}.mp4`;
							a.click();

							URL.revokeObjectURL(blobURL);

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
				}
			} catch (error) {
				toast.error(error);
				throw error;
			}
		},
	});

	const columns1 = [
		{
			accessorKey: "user_id",
			header: "Student ID",
		},
		{
			accessorKey: "user_username",
			header: "Student Username",
		},
		{
			header: "Creation Date",
			cell: ({ row }) => (
				<p>{new Date(row?.original?.created_at).toLocaleString()}</p>
			),
		},
		{
			accessorKey: "processing_status",
			header: "Processing Status",
		},
		{
			header: "Actions",
			cell: ({ row }) => <VideoActions video={row.original} />,
		},
	];

	return (
		<AdminPageWrapper heading="Customer Assistance Videos">
			<div>
				<h2>All Video Recordings</h2>
				<p className="my-2 text-muted-foreground">
					{"Stages : PENDING -> PROCESSED -> PROCESSED_FFMPEG"}
				</p>
				<div className="my-4"></div>
				<DataTable
					data={allVideoRecs ?? []}
					columns={columns1}
					refetch={refetchAllVideos}
				/>
			</div>
			<br />
			{/* <div>
        <h2>Processed Videos</h2>
        <DataTable
          data={videos ? Object.values(videos) : []}
          columns={columns}
          refetch={refetch}
        />
      </div> */}
		</AdminPageWrapper>
	);
}
