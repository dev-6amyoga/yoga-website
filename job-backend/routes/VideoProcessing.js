const HyperExpress = require("hyper-express");
const { Readable } = require("stream");
const { buffer } = require("node:stream/consumers");

const ffmpeg = require("fluent-ffmpeg");

const VideoRecordings = require("../models/mongo/VideoRecordings");
const {
	cloudflareGetFile,
	cloudflareAddFileToBucket,
} = require("../utils/R2Client");

const fs = require("fs");

const router = new HyperExpress.Router();

const sleep = (ms) =>
	new Promise((r) => {
		setTimeout(r, ms);
	});

router.post("/recording/ffmpeg", async (req, res) => {
	console.log("ffmpeg processing request");
	const { video_recording_id } = await req.json();

	console.info("video_recording_id", video_recording_id);

	if (!video_recording_id) {
		return res.status(400).json({
			message: "video_recording_id is required",
		});
	}

	let videoRecording = null;
	let uploadId = null;
	let folder_name = null;

	try {
		// console.log('foldername:', foldername)
		// console.log('videos:', videos)
		videoRecording = await VideoRecordings.findById(video_recording_id);

		if (!videoRecording) {
			return res.status(HTTP_BAD_REQUEST).json({
				message: "Video recording not found",
			});
		}

		console.info("videoRecording found", videoRecording._id);

		folder_name = videoRecording.get("folder_name");

		// get file from cloudflare

		const file = await cloudflareGetFile(
			"yoga-video-recordings",
			`${folder_name}/${folder_name}_final.mp4`,
			"video/mp4"
		);

		const wf = fs.writeFileSync(`input.mp4`, Buffer.from(file.buffer));

		// const readableBuffer = Readable.from(file);
		// const readableBuffer = new ReadableStream({
		// 	start(controller) {
		// 		controller.enqueue(file.buffer);
		// 		controller.close();
		// 	},
		// });

		// console.info("readableBuffer created");

		// create a file
		// fs.closeSync(fs.openSync(`${foldername}.mp4`, 'a'))
		const fd = fs.openSync(`video.mp4`, "a");

		fs.closeSync(fd);

		// const newBuf = await buffer();

		console.info("file created");
		// // process with ffmpeg
		const command = ffmpeg(`input.mp4`)
			.inputOption("-sn")
			.inputOption("-strict", "experimental")
			.output(`video.mp4`);

		command.run();

		let status = -1;
		let maxWaitTime = 5 * 60;

		command.on("end", () => {
			status = 1;
			console.info("ffmpeg completed");
		});

		command.on("error", (err) => {
			console.error(err);
			status = 0;
			console.error("ffmpeg error");
		});

		while (status === -1 && maxWaitTime > 0) {
			console.log("waiting for ffmpeg to complete");
			maxWaitTime -= 1;
			await sleep(1000);
		}

		if (status === -1 || maxWaitTime === 0) {
			fs.unlinkSync(`video.mp4`);
			return res.status(500).json({
				message: "Failed to process video",
			});
		}

		// get buffer from file
		const processedBuffer = fs.readFileSync(`video.mp4`);

		console.log("processed buffer size:", processedBuffer.byteLength);

		await cloudflareAddFileToBucket(
			"yoga-video-recordings",
			`${folder_name}/${folder_name}_final_ffmpeg.mp4`,
			processedBuffer,
			"video/mp4"
		);

		// delete the file
		fs.unlinkSync(`video.mp4`);
		fs.unlinkSync(`input.mp4`);

		videoRecording.processing_status = "PROCESSED_FFMPEG";
		await videoRecording.save();

		return res.status(200).json({
			message: "Video processed successfully",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: err,
		});
	}
});

module.exports = router;
